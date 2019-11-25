



/** @format */

import Const from '../data/Const.js';
var HomeCenterCache = require('HomeCenterCache.js');
var MqttClient = require('../utils/mqttclient.js');
var HomeCenter = require('../clazz/HomeCenter.js');
// var app = require('../app.js');
// data: {
//   homeCenterMap: null;
//   homeCenterCacheMap: null;
//   defaultHomeCenterUuid: null;
// }

function addHomeCenter(homeCenter) {
  let that = this;
  if (that.homeCenterMap == undefined) {
    that.homeCenterMap = new Map();
  }
  if (that.homeCenterCacheMap == undefined) {
    that.homeCenterCacheMap = new Map();
  }
  that.homeCenterMap.set(homeCenter.uuid, homeCenter);
  that.homeCenterCacheMap.set(homeCenter.uuid, new HomeCenterCache(homeCenter.uuid));
}

function removeHomeCenter(uuid) {
  let that = this;
  if (that.homeCenterMap != undefined && that.homeCenterMap.has(uuid)) {
    that.homeCenterMap.delete(uuid);
  }
  if (that.homeCenterCacheMap != undefined && that.homeCenterCacheMap.has(uuid)) {
    that.homeCenterCacheMap.delete(uuid);
  }
}

//获取所有的家庭中心，当没有时，可能获取到undefined
function getAllHomeCenters() {
  let that = this;
  if (that.homeCenterMap) {
    let homeCenters = [];
    if (that.homeCenterMap.has(that.defaultHomeCenterUuid)) {
      let defaultHomeCenter = that.homeCenterMap.get(that.defaultHomeCenterUuid);
      homeCenters.push(defaultHomeCenter);
    }
    for (let homeCenter of that.homeCenterMap.values()) {
      if (homeCenter.uuid == that.defaultHomeCenterUuid) {
        continue;
      }
      homeCenters.push(homeCenter);
    }
    return homeCenters;
  }
  return undefined;
}

function getHomeCenter(uuid) {
  let that = this;
  if (that.homeCenterMap == undefined || !that.homeCenterMap.has(uuid)) {
    return undefined;
  }

  return that.homeCenterMap.get(uuid);
}

function getHomeCenterCount() {
  let that = this;
  if (that.homeCenterMap == undefined) {
    return 0;
  }
  return that.homeCenterMap.size;
}

//获取当前选中的家庭中心
function getDefaultHomeCenter(){
  let that = this;
  if (that.homeCenterMap.has(that.defaultHomeCenterUuid))
    return that.homeCenterMap.get(that.defaultHomeCenterUuid);
  
  return null;
} 
//获取指定的HomeCenterCache
function getHomeCenterCache(uuid) {
  let that = this;
  if (that.homeCenterCacheMap == undefined || !that.homeCenterCacheMap.has(uuid)) {
    return undefined;
  }
  return that.homeCenterCacheMap.get(uuid);
}
function findDefaultHomeCenter(uuid){
  for(let homecenter of this.getAllHomeCenters()){
    if(homecenter.uuid == uuid){
      return true
    }
  }
  return false
}
//设置当前选中的家庭中心
function setDefaultHomeCenter(uuid) {
  console.log(uuid)
  let that = this;
  let newallhomebox = {};
  newallhomebox.rosters = that.getAllHomeCenters();
  if (that.findDefaultHomeCenter(wx.getStorageSync('setDefaultHomeCenter')) == false){
    that.defaultHomeCenterUuid = that.getAllHomeCenters()[0].uuid;
    wx.setStorageSync('setDefaultHomeCenter', that.getAllHomeCenters()[0].uuid);
    return
  }
  if (that.getHomeCenter(wx.getStorageSync('setDefaultHomeCenter')).online == false || that.getHomeCenter(wx.getStorageSync('setDefaultHomeCenter')).types != 3){
    if (newallhomebox.rosters != undefined) {
        if (newallhomebox.rosters.length > 1) {
          for (let roster = 1; roster < newallhomebox.rosters.length; roster++) {
            if (newallhomebox.rosters[roster].online == true && newallhomebox.rosters[roster].types == 3) {
              that.defaultHomeCenterUuid = newallhomebox.rosters[roster].uuid;
              wx.setStorageSync('setDefaultHomeCenter', newallhomebox.rosters[roster].uuid);
              return;
            }
          }
        }
    }
  }
  
  console.log(uuid)
  that.defaultHomeCenterUuid = uuid;
}

function getDefaultHomeCenterCache() {
  let that = this;
  if (that.defaultHomeCenterUuid == undefined) {
    if (that.homeCenterCacheMap) {
      for (let homeCenterCache of that.homeCenterCacheMap.values()) {
        console.log(homeCenterCache);
        return homeCenterCache;
      }
    } else {
      return undefined;
    }
  } else {
    return that.homeCenterCacheMap.get(that.defaultHomeCenterUuid);
  }
}
//处理家庭中心的Presence消息
function handlePresenceMessage(message, app) {
  let that = this;
  let presence = message.Presence;
  let homeCenter = that.getHomeCenter(presence.Username);
  if (homeCenter == undefined) {
    return;
  }
  homeCenter.online = presence.Online;
  console.log('def def -> home center online: ' + homeCenter.online);
  console.log('def def -> presence online: ' + presence.Online);
  if (homeCenter.online) {
    let topic = 'message/' + homeCenter.uuid;
    let client = app.getClient();
    let getEntityFunc = function(node) {
      console.log('get entity type of box', node, topic);
      MqttClient.sendRequest({
        client: client,
        topic: topic,
        req: MqttClient.buildGetEntityRequest(app.globalData.username_, node),
        success: function(req, res) {
          console.log('get response for entity type', req, res, node);
          if (node < 5) {
            getEntityFunc(node + 1);
          }
        },
        error: function(req, res) {
          console.log('get entity type error', req, res, topic, node);
        }
      });
    };
    getEntityFunc(0);
  } else {
    let homeCenterCache = that.getHomeCenterCache(homeCenter.uuid);
    if (homeCenterCache != undefined) {
      homeCenterCache.processHomeCenterOffline();
    }
  }
}
//处理与家庭中心相关的关联消息
function handleDeviceAssociationMessage(message, app) {
  let that = this;
  let deviceAssociation = message.DeviceAssociation;
  let user = deviceAssociation.User;
  let by = deviceAssociation.By;
  let action = deviceAssociation.Action;
  let status = deviceAssociation.Status;
  let deviceUuid = deviceAssociation.DeviceUUID;
  let deviceName = deviceAssociation.DeviceName;
  let username = app.globalData.username_;
  console.log(deviceUuid);
  if (
    user == username &&
    by == username &&
    action == Const.ActionType.REQUEST &&
    status == Const.SubscriptionType.TO
  ) {
    //当前用户请求其他用户正在使用的家庭中心
    console.log('进来的是0');
    let types = 2;
    let newHomeCenter = new HomeCenter(deviceUuid, deviceName, undefined, undefined, undefined, types);
    that.addHomeCenter(newHomeCenter);
  } else if (
    user != username &&
    by != username &&
    action == Const.ActionType.REQUEST &&
    status == Const.SubscriptionType.TO
  ) {
    console.log('进来的是1');
    //别人请求添加我关联的box
    let newRoster = {};
    newRoster.Username = user;
    newRoster.Nickname = deviceAssociation.UserDisplayName;
    newRoster.types = 2;
    newRoster.uuid = deviceUuid;
    app.globalData.addHomecenterMsg.push(deviceAssociation);
    if (!that.getHomeCenter(deviceUuid).roster) {
      return;
    }
    that.getHomeCenter(deviceUuid).roster.push(newRoster);
    console.log(app.globalData.addHomecenterMsg);
  } else if (
    user == username &&
    by == username &&
    action == Const.ActionType.REMOVE &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    console.log('进来的是3');
    //删除家庭中心
    console.log(that);
    that.removeHomeCenter(deviceUuid);
  } else if (
    user == username &&
    by != username &&
    action == Const.ActionType.REJECT &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    console.log('进来的是2');
    that.removeHomeCenter(deviceUuid);
  } else if (
    user == username &&
    (by == username || by == deviceUuid) &&
    action == Const.ActionType.REMOVE &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    //自己删除家庭中心或家庭中心重置
    console.log('进来的是12');
    if (that.getAllHomeCenters()[0].uuid == deviceUuid) {
      wx.removeStorageSync('setDefaultHomeCenter');
    }
    that.removeHomeCenter(deviceUuid);
  } else if (
    user == username &&
    by != username &&
    action == Const.ActionType.APPROVE &&
    status == Const.SubscriptionType.BOTH
  ) {
    //新添加了一个家庭中心
    console.log('进来的是4');
    app.getHomecenter();
    let types = 3;
    let newHomeCenter = new HomeCenter(deviceUuid, deviceName, undefined, undefined, undefined, types);
    console.log(newHomeCenter);
    that.addHomeCenter(newHomeCenter);
    let topic = 'event/' + deviceUuid;
    console.log(that.getAllHomeCenters());
    console.log('关联了新的家庭中心，订阅event/boxUuid: ' + topic);
    app.getClient().subscribe(topic, {
      qos: Number(0)
    });
    if (
      wx.getStorageSync('setDefaultHomeCenter') == undefined ||
      wx.getStorageSync('setDefaultHomeCenter') == ''
    ) {
      console.log("?????1")
      wx.setStorageSync('setDefaultHomeCenter', deviceUuid);
    }
    that.setDefaultHomeCenter(deviceUuid);
  } else if (
    user == username &&
    by == username &&
    action == Const.ActionType.ACCEPT &&
    status == Const.SubscriptionType.BOTH
  ) {
    console.log('进来的是7');
  } else if (
    user == username &&
    by == username &&
    action == Const.ActionType.REQUEST &&
    status == Const.SubscriptionType.BOTH
  ) {
    console.log('进来的是5');
    let types = 3;
    let newHomeCenter = new HomeCenter(deviceUuid, deviceName, undefined, undefined, undefined, types);
    that.addHomeCenter(newHomeCenter);
    let topic = 'event/' + deviceUuid;
    console.log('关联了新的家庭中心，订阅event/boxUuid: ' + topic);
    app.getClient().subscribe(topic, {
      qos: Number(0)
    });
  } else if (
    user == username &&
    by == username &&
    action == Const.ActionType.DECLINE &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    console.log('进来的是6');
  } else if (
    user == username &&
    by == username &&
    action == Const.ActionType.SHARE &&
    status == Const.SubscriptionType.BOTH
  ) {
    console.log('进来的是8');
  } else if (
    user != username &&
    by != username &&
    action == Const.ActionType.CANCELREQUEST &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    console.log('进来的是10');
    if (!that.getHomeCenter(deviceUuid).roster) {
      return;
    }
    //别人自己取消了添加请求
    for (let ro = 0; ro < that.getHomeCenter(deviceUuid).roster.length; ro++) {
      if (user == that.getHomeCenter(deviceUuid).roster[ro].Username) {
        that.getHomeCenter(deviceUuid).roster.splice(ro, 1);
      }
    }
    let addHomeCenterMsg = app.globalData.addHomecenterMsg;
    console.log(app.globalData.addHomecenterMsg);
    for (var s = 0; s < addHomeCenterMsg.length; s++) {
      if (
        addHomeCenterMsg[s].DeviceUUID == deviceAssociation.DeviceUUID &&
        addHomeCenterMsg[s].User == deviceAssociation.User
      ) {
        addHomeCenterMsg.splice(s, 1);
        break;
      }
    }
  } else if (
    user != username &&
    action == Const.ActionType.REQUEST &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    //其他用户请求我在使用的家庭中心
    console.log('进来的是14');
    let addHomeCenterMsg = app.globalData.addHomecenterMsg;
    console.log(addHomeCenterMsg);
    if (addHomeCenterMsg) {
      for (let i = 0; i < addHomeCenterMsg.length; i++) {
        if (deviceUuid == addHomeCenterMsg[i].DeviceUUID && by == addHomeCenterMsg[i].User) {
          addHomeCenterMsg.splice(i, 1);
          return;
        }
      }
    }
  } else if (
    user != username &&
    by != username &&
    (action == Const.ActionType.APPROVE || action == Const.ActionType.REJECT) &&
    (status == Const.SubscriptionType.BOTH || status == Const.SubscriptionType.UNKNOWN)
  ) {
    //别的客户端处理了  同意或者拒绝
    console.log('进来的是15');
    let newRoster = {};
    newRoster.Username = user;
    newRoster.Nickname = deviceAssociation.UserDisplayName;
    newRoster.types = 3;
    newRoster.uuid = deviceUuid;
    let addHomeCenterMsg = app.globalData.addHomecenterMsg;
    if (addHomeCenterMsg) {
      for (let i = 0; i < addHomeCenterMsg.length; i++) {
        if (deviceUuid == addHomeCenterMsg[i].DeviceUUID && user == addHomeCenterMsg[i].User) {
          addHomeCenterMsg.splice(i, 1);
          return;
        }
      }
    }
    if (!that.getHomeCenter(deviceUuid).roster) {
      return;
    }
    that.getHomeCenter(deviceUuid).roster.push(newRoster);
  } else if (
    user != username &&
    by == username &&
    action == Const.ActionType.APPROVE &&
    status == Const.SubscriptionType.BOTH
  ) {
    //我同意了别人的请求
    let addHomeCenterMsg = app.globalData.addHomecenterMsg;
    console.log(addHomeCenterMsg);
    if (addHomeCenterMsg) {
      for (let i = 0; i < addHomeCenterMsg.length; i++) {
        if (deviceUuid == addHomeCenterMsg[i].DeviceUUID && user == addHomeCenterMsg[i].User) {
          addHomeCenterMsg.splice(i, 1);
          return;
        }
      }
    }
  } else if (
    user != username &&
    by == username &&
    action == Const.ActionType.REJECT &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    //我拒绝了别人的请求
    let addHomeCenterMsg = app.globalData.addHomecenterMsg;
    if (addHomeCenterMsg) {
      for (let i = 0; i < addHomeCenterMsg.length; i++) {
        if (deviceUuid == addHomeCenterMsg[i].DeviceUUID && user == addHomeCenterMsg[i].User) {
          addHomeCenterMsg.splice(i, 1);
          break;
        }
      }
    }
    console.log(that.getAllHomeCenters());
    for (let homecenters of that.getAllHomeCenters()) {
      if (homecenters.uuid == deviceUuid) {
        let rosters = homecenters.roster;
        for (let roster = 0; roster <= rosters.length; roster++) {
          if (rosters[roster].Username == user) {
            rosters.splice(roster, 1);
            console.log(that.getAllHomeCenters());
          }
        }
      }
    }
  } else if (
    user != username &&
    by != username &&
    action == Const.ActionType.REMOVE &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    if (!that.getHomeCenter(deviceUuid).roster) {
      return;
    }
    for (let ro = 0; ro < that.getHomeCenter(deviceUuid).roster.length; ro++) {
      if (user == that.getHomeCenter(deviceUuid).roster[ro].Username) {
        that.getHomeCenter(deviceUuid).roster.splice(ro, 1);
      }
    }
  } else if (
    user == username &&
    by == username &&
    action == Const.ActionType.CANCELREQUEST &&
    status == Const.SubscriptionType.UNKNOWN
  ) {
    console.log('进来的是21');
    that.removeHomeCenter(deviceUuid);
  } else if (
    user == username &&
    by != username &&
    action == Const.ActionType.REMOVE &&
    status == Const.SubscriptionType.UNKNOWN) {
    console.log('进来的是22');
    if (wx.getStorageSync('setDefaultHomeCenter') == deviceUuid){
      wx.removeStorageSync('setDefaultHomeCenter')
    }
    that.removeHomeCenter(deviceUuid);
    console.log(that.getAllHomeCenters())
    for (let homecenter of that.getAllHomeCenters()){
      if(homecenter.online == true){
        wx.setStorageSync('setDefaultHomeCenter', homecenter.uuid)
        that.setDefaultHomeCenter(homecenter.uuid)
      }
    }

    for (let homecenters of that.getAllHomeCenters()) {
      if (homecenters.uuid == deviceUuid) {
        let rosters = homecenters.roster;
        for (let roster = 0; roster <= rosters.length; roster++) {
          if (rosters[roster].Username == user) {
            rosters.splice(roster, 1);
            console.log(that.getAllHomeCenters());
          }
        }
      }
    }
  }
}
//获取physicDevice

//判断是不是 loggicDevice
//找到设备
 function findEntity(uuid) {
  let that = this;
  let entity = null;
  let _entities = that.getDefaultHomeCenterCache().entities;
  _entities.forEach(function (value, key) {
    if (uuid == key){
      entity = value;
    }
  }, _entities);
   return entity;
   
}


module.exports = {
  removeHomeCenter: removeHomeCenter,
  addHomeCenter: addHomeCenter,
  getHomeCenterCount: getHomeCenterCount,
  getHomeCenter: getHomeCenter,
  getAllHomeCenters: getAllHomeCenters,
  getHomeCenterCache: getHomeCenterCache,
  //获取当前家庭中心 HomeCenterManager.getDefaultHomeCenterCache().entities
  getDefaultHomeCenterCache: getDefaultHomeCenterCache,
  setDefaultHomeCenter: setDefaultHomeCenter,
  handlePresenceMessage: handlePresenceMessage,
  handleDeviceAssociationMessage: handleDeviceAssociationMessage,
  findDefaultHomeCenter: findDefaultHomeCenter,
  getDefaultHomeCenter: getDefaultHomeCenter,
  findEntity: findEntity
};
