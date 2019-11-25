/** @format */

// var mqttclient = require('mqttclient')
// var EntityParser = require('EntityParser.js')
var HomeCenterManager = require('../data/HomeCenterManager.js');

function handleMqttMessage(msg_, app) {
  var that = app;
  //反馈可用的设备列表展示到页面上
  // 给可用家庭中心 发送GetEntity消息
  if (msg_.Presence != undefined && msg_.Presence != null) {
    //测试代码
    console.log(HomeCenterManager.getAllHomeCenters());
    // if (msg_.Presence.Online == true && wx.getStorageSync('updata')) {
    //   // for (let center of newallhomebox.rosters) {
    //   if (msg_.Presence.Username == wx.getStorageSync('updata')) {
    //     wx.removeStorageSync('updata');
    //   }
    //   // }
    // }
    HomeCenterManager.handlePresenceMessage(msg_, app);
  }
  //删除了room
  if (msg_.DeleteAreaResult != undefined && msg_.DeleteAreaResult != null) {
    let homecenter = HomeCenterManager.homeCenterCacheMap.get(msg_.Sender)
    let entities = homecenter.entities;
    entities.delete(msg_.DeleteAreaResult.UUID)
  }
  //增加了room
  if (msg_.AreaCreated != undefined && msg_.AreaCreated != null) {
    HomeCenterManager.getHomeCenterCache(msg_.Sender).processRoomCreated(msg_.AreaCreated.Area);
    // entities.set(msg_.AreaCreated.Area)
  }
  //可用家庭中心就订阅该家庭中心，第一次关联box之后 订阅该box（ 关联了新的box就会收到这个函数）
  if (msg_.DeviceAssociation != undefined && msg_.DeviceAssociation != null) {
    //测试代码
    HomeCenterManager.handleDeviceAssociationMessage(msg_, app);
  }
  // 别人删除了设备
  if (msg_.DeviceDeleted != undefined && msg_.DeviceDeleted != null) {
    //测试代码
    let deviceUuid = msg_.DeviceDeleted.UUID;
    let sender = msg_.Sender;
    HomeCenterManager.getHomeCenterCache(sender).processDeviceDelete(deviceUuid);
  }
  // 设备离线
  if (msg_.PhysicDeviceOffline != undefined && msg_.PhysicDeviceOffline != null) {
    let deviceUuid = msg_.PhysicDeviceOffline.UUID;
    let sender = msg_.Sender;
    HomeCenterManager.getHomeCenterCache(sender).processDeviceOffline(deviceUuid);
  }
  //绑定启用或者停用
  if (msg_.BindingEnableChanged != undefined && msg_.BindingEnableChanged != null) {
    let bindingUuid = msg_.BindingEnableChanged.UUID;
    let enabled = msg_.BindingEnableChanged.Enabled;
    let sender = msg_.Sender;
    HomeCenterManager.getHomeCenterCache(sender).processBindingEnable(bindingUuid, enabled);
  }
  //收到的消息是GetEntityResult
  if (msg_.GetEntityResult != undefined && msg_.GetEntityResult != null) {
    console.log(msg_);
    let sender = msg_.Sender;
    let reslt = msg_.GetEntityResult;
    HomeCenterManager.getHomeCenterCache(sender).processGetEntityResult(reslt);
    if (msg_.GetEntityResult.Entities.length > 0) {
      if (msg_.GetEntityResult.Entities[0].BaseType == 6) {
        setTimeout(function() {
          var pages = getCurrentPages();
          console.log(pages);
          if (pages.length > 0) {
            var p = pages[pages.length - 1];
            console.log(p);
            if (p.getEntityResult) {
              p.getEntityResult(msg_);
            }
          }
        }, 500);
      }
    }
  }
  // DeviceAttrReport
  if (msg_.DeviceAttrReport != undefined && msg_.DeviceAttrReport != null) {
    let sender = msg_.Sender;
    let uuid = msg_.DeviceAttrReport.UUID;
    let rssi = msg_.DeviceAttrReport.RSSI;
    let attrs = msg_.DeviceAttrReport.Attributes;
    for (let attr of attrs) {
      HomeCenterManager.getHomeCenterCache(sender).processDeviceAttrReport(uuid, attr, rssi);
    }
  }
  //EntityAvailable
  if (msg_.EntityAvailable != undefined && msg_.EntityAvailable != null) {
    let sender = msg_.Sender;
    let entity = msg_.EntityAvailable.Entity;
    HomeCenterManager.getHomeCenterCache(sender).processEntityAvailable(entity);
  }
  //别人创建了绑定
  if (msg_.BindingCreated != null && msg_.BindingCreated != undefined) {
    let sender = msg_.Sender;
    let entity = msg_.BindingCreated.Binding;
    HomeCenterManager.getHomeCenterCache(sender).processBindingCreated(entity);
  }
  //别人修改了绑定
  if (msg_.BindingUpdated != null && msg_.BindingUpdated != undefined) {
    let sender = msg_.Sender;
    let entity = msg_.BindingUpdated.Binding;
    HomeCenterManager.getHomeCenterCache(sender).processBindingUpdated(entity);
  }
  //别人改变了场景
  if (msg_.SceneUpdated != undefined && msg_.SceneUpdated != null) {
    let sender = msg_.Sender;
    let entity = msg_.SceneUpdated.Scene;
    HomeCenterManager.getHomeCenterCache(sender).processSceneUpdated(entity);
  }
  //改变了名字和区域 添加了新设备
  if (msg_.EntityInfoConfigured != undefined && msg_.EntityInfoConfigured != null) {
    let sender = msg_.Sender;
    let config = msg_.EntityInfoConfigured;
    HomeCenterManager.getHomeCenterCache(sender).processEntityInfoConfiged(config);

    //家庭中心名称改变，修改HomeCenterManager中的对应家庭中心名称
    if (config.UUID == sender) {
      HomeCenterManager.getHomeCenter(sender).name = config.Name;
    }
    if (that.globalData.addHomecenterMsg) {
      for (let addroster of that.globalData.addHomecenterMsg) {
        if (addroster.DeviceUUID == config.UUID) {
          addroster.DeviceName = config.Name;
        }
      }
    }
  }
  //设备升级后改变版本号
  if (msg_.FirmwareUpgradeStatusChanged != undefined && msg_.FirmwareUpgradeStatusChanged != null) {
    if (msg_.FirmwareUpgradeStatusChanged.Status == 2) {
      //升级成功
      let sender = msg_.Sender;
      let uuid = msg_.FirmwareUpgradeStatusChanged.DeviceUUID;
      let version = msg_.FirmwareUpgradeStatusChanged.FirmwareVersion;
      HomeCenterManager.getHomeCenterCache(sender).processFirmwareUpgradeComplete(version, uuid);
    }
  }
  // 按键事件
  if (msg_.DeviceKeyPressed != undefined && msg_.DeviceKeyPressed != null) {
    let sender = msg_.Sender;
    let uuid = msg_.DeviceKeyPressed.UUID;
    let rssi = msg_.DeviceKeyPressed.RSSI;
    HomeCenterManager.getHomeCenterCache(sender).processDeviceKeyPressed(uuid, rssi);
  }
  //创建了场景
  if (msg_.SceneCreated != null && msg_.SceneCreated != undefined) {
    let sender = msg_.Sender;
    let entity = msg_.SceneCreated.Scene;
    HomeCenterManager.getHomeCenterCache(sender).processSceneCreated(entity);
  }
  //删除了场景
  if (msg_.BindingDeleted != null && msg_.BindingDeleted != undefined) {
    let sender = msg_.Sender;
    let entity = msg_;
    HomeCenterManager.getHomeCenterCache(sender).processSceneDeleted(entity);
  }
}
module.exports = {
  handleMqttMessage: handleMqttMessage
};
