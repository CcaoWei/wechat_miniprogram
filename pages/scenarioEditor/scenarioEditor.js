/** @format */
import Const from '../../data/Const.js';
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var MqttClient = require('../../utils/mqttclient.js');
var newAction = require('../../clazz/newAction.js');
var Action = require('../../clazz/Action.js');
var feedbackApi = require('../../utils/showToast.js');
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sceneUuid: '', //当前场景的uuid
    sceneName: '',
    editDevices: null,
    addScene: false
  },
  getEntityResult: function() {},
  initData: function() {
    let that = this;
    let cache = HomeCenterManager.getDefaultHomeCenterCache();
    console.log(HomeCenterManager.getDefaultHomeCenterCache(), 'mao10');
    if (cache == undefined) {
      console.log('mao11');
      return;
    }
    let scene = cache.getEntity(that.data.sceneUuid);
    console.log(scene)
    if (scene == undefined) {
      console.log('mao12');
      let newAreas = [];
      let newLogicDevices = [];
      let entities = cache.entities;
      for (let entity of entities.values()) {
        if (entity.getEntityType() == Const.EntityType.AREA) {
          newAreas.push(entity);
        }
        if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
          let lds = entity.logicDevice;
          if (lds) {
            for (let ld of lds) {
              if (ld.isWallSwitchButton() || (ld.profile == Const.Profile.WINDOW_COVERING && ld.isNew == true) || ld.isWallSwitchLightChange() || ld.isVRVUnitMachine() || ld.isZHHVRVGateway()) {
                continue;
              }
              newLogicDevices.push(ld);
            }
          }
        }
      }
      let UIAreas = [];
      for (let area of newAreas) {
        let UIArea = {};
        UIArea.area = area;
        UIArea.UILogicDevices = [];
        UIAreas.push(UIArea);
      }
      console.log(newLogicDevices)
      for (let ld of newLogicDevices) {
        let UILogicDevice = {};
        UILogicDevice.logicDevice = ld;
        UILogicDevice.selected = false;
        UILogicDevice.checked = false;
        UILogicDevice.selectImg = '../../imgs/scene_edit_icon_unselected.png';
        UILogicDevice.checkMode = 'unchecked';
        this.setLogicDeviceIcon(UILogicDevice);
        let desUIArea = this.findUIArea(UIAreas, ld.areaUuid);
        if (desUIArea) {
          desUIArea.UILogicDevices.push(UILogicDevice);
        }
      }
      for (let alldevice of UIAreas) {
        if (alldevice.UILogicDevices.length > 0){
          alldevice.isSelectAllText = true
        }
        
        if (that.isAllSelect(alldevice.UILogicDevices)) {
          alldevice.area.selectStatus = '取消全选'
        } else {
          alldevice.area.selectStatus = '选择全部'
        }
      }
      that.setData({
        editDevices: UIAreas
      });
      console.log(that.data.editDevices);
      return;
    }

    var areas = [];
    var logicDevices = [];

    let entities = cache.entities;
    for (let entity of entities.values()) {
      if (entity.getEntityType() == Const.EntityType.AREA) {
        areas.push(entity);
      }
      console.log('121212',entity);
      if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        let lds = entity.logicDevice;
        console.log(lds, 'maodian9');
        if (lds) {
          for (let lditem of lds) {
            //场景剔除墙壁开关的按键
            console.log(lditem, 'maodian5');
            console.log(lditem.isWallSwitchLightChange(), 'maodian6');
            console.log(lditem.isVRVUnitMachine(), 'maodian7');
            console.log(lditem.isZHHVRVGateway(), 'maodian8');
            if (lditem.isWallSwitchButton() || lditem.isWallSwitchLightChange() || lditem.isZHHVRVGateway() || lditem.isVRVUnitMachine()) {
              continue;
            }
            if (entity.model == 'TERNCY-CM01' && entity.isNew == true) {
              continue;
            }
            logicDevices.push(lditem);
          }
        }
      }
    }
    let UIAreas = [];
    for (let area of areas) {
      let UIArea = {};
      UIArea.area = area;
      UIArea.UILogicDevices = [];
      UIAreas.push(UIArea);
    }

    for (let ld of logicDevices) {
      let UILogicDevice = {};
      UILogicDevice.logicDevice = ld;

      let action = this.findAction(scene, ld.uuid);
      if (action) {
        UILogicDevice.selected = true;
        if (ld.profile == Const.Profile.WINDOW_COVERING) {
          console.log(UILogicDevice);
          UILogicDevice.checked = action.value > 50;
        } else {
          UILogicDevice.checked = action.value == 1;
        }
      } else {
        UILogicDevice.selected = false;
        UILogicDevice.checked = false;
      }

      //设置是否选择的图片
      if (UILogicDevice.selected) {
        UILogicDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
        UILogicDevice.checkMode = 'checked';
      } else {
        UILogicDevice.selectImg = '../../imgs/scene_edit_icon_unselected.png';
        UILogicDevice.checkMode = 'unchecked';
      }

      this.setLogicDeviceIcon(UILogicDevice);

      let desUIArea = this.findUIArea(UIAreas, ld.areaUuid);
      console.log(desUIArea)
      if (desUIArea) {
        desUIArea.UILogicDevices.push(UILogicDevice);
      }
    }

    console.log(UIAreas);
    for (let alldevice of UIAreas){
      if (alldevice.UILogicDevices.length > 0) {
        alldevice.isSelectAllText = true
      }
      if (that.isAllSelect(alldevice.UILogicDevices)){
        alldevice.area.selectStatus = '取消全选'
      }else{
        alldevice.area.selectStatus = '选择全部'
      }
    }
    that.leaveHomeScene(scene, UIAreas)
    that.goHomeScene(scene, UIAreas)
    this.setData({
      editDevices: UIAreas,
      sceneName: scene.name,
      oldScenename: scene.name
    });
    console.log(that.data);
  },
  // 离家场景
  leaveHomeScene: function (scene,editScene){
    if (scene.uuid == "scene-000002" && scene.actions.length == 0){
      for (let editroom of editScene){
        for (let itemRoomDevice of editroom.UILogicDevices){
          if (itemRoomDevice.logicDevice.profile == 0 || itemRoomDevice.logicDevice.profile == 3){
            itemRoomDevice.selected = true
            itemRoomDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
            itemRoomDevice.checkMode = 'checked';
            itemRoomDevice.checked = true

          }else{
            itemRoomDevice.selected = true
            itemRoomDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
            itemRoomDevice.checkMode = 'checked';
            itemRoomDevice.checked = false
          }
        }
      }
    }
  },
  goHomeScene: function (scene, editScene) {
    if (scene.uuid == "scene-000001" && scene.actions.length == 0) {
      for (let editroom of editScene) {
        for (let itemRoomDevice of editroom.UILogicDevices) {
          if (itemRoomDevice.logicDevice.profile == 0 || itemRoomDevice.logicDevice.profile == 3) {
            itemRoomDevice.selected = true
            itemRoomDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
            itemRoomDevice.checkMode = 'checked';
            itemRoomDevice.checked = false

          } else {
            itemRoomDevice.selected = true
            itemRoomDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
            itemRoomDevice.checkMode = 'checked';
            itemRoomDevice.checked = true
          }
        }
      }
    }
  },
  //设置每行设备显示图片
  setLogicDeviceIcon: function(UILogicDevice) {
    let ld = UILogicDevice.logicDevice;
    if (ld.profile == Const.Profile.ON_OFF_LIGHT) {
      if (UILogicDevice.checked) {
        UILogicDevice.img = '../../imgs/dev_icon_light_on.png';
      } else {
        UILogicDevice.img = '../../imgs/dev_icon_light_off.png';
      }
    } else if (ld.profile == Const.Profile.SMART_PLUG) {
      if (UILogicDevice.checked) {
        UILogicDevice.img = '../../imgs/dev_icon_plug_on.png';
      } else {
        UILogicDevice.img = '../../imgs/dev_icon_plug_off.png';
      }
    } else if (ld.profile == Const.Profile.PIR_PANEL) {
      UILogicDevice.img = '../../imgs/dev_icon_pir_safe.png';
    } else if (ld.profile == Const.Profile.DOOR_CONTACT) {
      UILogicDevice.img = '../../imgs/dev_icon_dc_closed.png';
    } else if (ld.profile == Const.Profile.WINDOW_COVERING) {
      UILogicDevice.img = '../../imgs/icon_curtain.png';
    }
  },

  findAction: function(scene, uuid) {
    console.log(scene)
    console.log(uuid)
    if (scene != undefined){
      for (let action of scene.actions) {
        if (action.uuid == uuid) {
          return action;
        }
      }
    }
    
    return undefined;
  },

  findUIArea: function(UIAreas, areaUuid) {
    console.log(UIAreas)
    console.log(areaUuid)
    for (let UIArea of UIAreas) {
      if (UIArea.area.uuid == areaUuid) {
        return UIArea;
      }
    }
    
    return UIAreas[0];
  },

  onMqttMsg: function(message) {
    console.log(message);
    if (message.SceneUpdated) {
      console.log('Get a scene update event');
    } else if (message.EntityInfoConfigured) {
      let config = message.EntityInfoConfigured;
      // if (config.IsNew) {
      let tempDevices = this.data.editDevices;
      let name = config.Name;
      let areaUuid = config.AreaUUID;
      if (name == undefined) {
        name = config.UUID;
      }
      if (areaUuid == undefined) {
        areaUuid = 'area-0000';
      }
      for (let UIArea of tempDevices) {
        if (UIArea.area.uuid == areaUuid) {
          let UILogicDevice = {};
          let ld = HomeCenterManager.getDefaultHomeCenterCache().getEntity(config.UUID);
          ld.name = name;
          ld.areaUuid = areaUuid;
          UILogicDevice.logicDevice = ld;
          UILogicDevice.selected = false;
          UILogicDevice.selectImg = '../../imgs/scene_edit_icon_unselected.png';
          UILogicDevice.checkMode = 'unchecked';

          UILogicDevice.checked = false;

          this.setLogicDeviceIcon(UILogicDevice);

          UIArea.UILogicDevices.push(UILogicDevice);
        }
      }
      this.setData({
        editDevices: tempDevices
      });
      // }
    } else if (message.DeviceDeleted) {
      let cache = HomeCenterManager.getDefaultHomeCenterCache();
      if (cache) {
        let pd = cache.getDeletedDevice(message.DeviceDeleted.UUID);
        if (pd == undefined) {
          return;
        }
        if (pd.getEntityType() != Const.EntityType.PHYSIC_DEVICE) {
          return;
        }
        let tempDevices = this.data.editDevices;
        for (let UIArea of tempDevices) {
          console.log(UIArea);
          for (var i = 0; i < UIArea.UILogicDevices.length; i++) {
            let desLogicDevice = UIArea.UILogicDevices[i];
            console.log(desLogicDevice.logicDevice.uuid);
            if (pd.contains(desLogicDevice.logicDevice.uuid)) {
              UIArea.UILogicDevices.splice(i, 1);
            }
          }
        }
        this.setData({
          editDevices: tempDevices
        });
      }
    }
  },

  //点击场景选中或取消选中某个设备
  bindSelectClick: function(e) {
    let thisPage = this;
    console.log(e);
    let areaUuid = e.currentTarget.dataset.areauuid;
    let uuid = e.currentTarget.dataset.uuid;
    let tempDevices = thisPage.data.editDevices;
    for (let UIArea of tempDevices) {
      if (UIArea.area.uuid == areaUuid) {
        UIArea.isSelectAllText = true
        for (let UILogicDevice of UIArea.UILogicDevices) {
          if (UILogicDevice.logicDevice.uuid == uuid) {
            console.log(UILogicDevice);
            UILogicDevice.selected = !UILogicDevice.selected;
            if (UILogicDevice.selected) {
              UILogicDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
              UILogicDevice.checkMode = 'checked';
            } else {
              if (UILogicDevice.logicDevice.profile == Const.Profile.SMART_PLUG) {
                UILogicDevice.img = '../../imgs/dev_icon_plug_off.png';
              } else if (UILogicDevice.logicDevice.profile == Const.Profile.ON_OFF_LIGHT) {
                UILogicDevice.img = '../../imgs/dev_icon_light_off.png';
              }
              UILogicDevice.checked = false;
              UILogicDevice.selectImg = '../../imgs/scene_edit_icon_unselected.png';
              UILogicDevice.checkMode = 'unchecked';
            }
            break;
          }
        }
        console.log(UIArea.UILogicDevices)
        console.log()
        if (!thisPage.isAllSelect(UIArea.UILogicDevices)){
          UIArea.area.selectStatus = "选择全部"
        }else{
          UIArea.area.selectStatus = "取消全选"
        }
        break;
      }
      
    }

    thisPage.setData({
      editDevices: tempDevices
    });
  },

  bindSceneNameChanged: function(e) {
    let that = this;
    var substring = e.detail.value;
    for (var i = 0; i < substring.length; i++) {
      var hs = substring.charCodeAt(i);
      if (0xd800 <= hs && hs <= 0xdbff) {
        if (substring.length > 0) {
          let ls = substring.charCodeAt(i + 1);
          var uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
          if (0x1d000 <= uc && uc <= 0x1f77f) {
            return '';
          }
        }
      } else if (substring.length > 1) {
        let ls = substring.charCodeAt(i + 1);
        if (ls == 0x20e3) {
          return '';
        }
      } else {
        if (0x2100 <= hs && hs <= 0x27ff) {
          return '';
        } else if (0x2b05 <= hs && hs <= 0x2b07) {
          return '';
        } else if (0x2934 <= hs && hs <= 0x2935) {
          return '';
        } else if (0x3297 <= hs && hs <= 0x3299) {
          return '';
        } else if (
          hs == 0xa9 ||
          hs == 0xae ||
          hs == 0x303d ||
          hs == 0x3030 ||
          hs == 0x2b55 ||
          hs == 0x2b1c ||
          hs == 0x2b1b ||
          hs == 0x2b50
        ) {
          return '';
        }
      }
    }
    that.setData({
      sceneName: substring
    });
  },
  isAllSelect:function(itemSceneDevices){
    for (let device of itemSceneDevices){
      if (!device.selected){
        return false
      }
    }
    return true
    
  },
  bindSelectAll:function(e){
    console.log(e)
    let that = this
    for (let editScene of that.data.editDevices){
      if (editScene.area.uuid == e.currentTarget.dataset.id){
        that.isAllSelect(editScene.UILogicDevices)
        if (!that.isAllSelect(editScene.UILogicDevices)){
          for (let itemdevice of editScene.UILogicDevices){
            editScene.area.selectStatus = "取消全选"
            itemdevice.selected = true
            itemdevice.selectImg = '../../imgs/scene_edit_icon_select.png';
            itemdevice.checkMode = 'checked';
            
            
          }
          console.log(that.data.editDevices)
        } else if (that.isAllSelect(editScene.UILogicDevices)) {
          for (let itemdevice of editScene.UILogicDevices) {
            editScene.area.selectStatus = "选择全部"
            itemdevice.selected = false
            itemdevice.checked = false
            itemdevice.selectImg = '../../imgs/scene_edit_icon_unselected.png';
            itemdevice.checkMode = 'unchecked';

          }
          console.log(that.data.editDevices)
        }
        that.setData({
          editDevices: that.data.editDevices
        })
      }
    }
  },
  checkedAlls:function(e){
    console.log(e)
    let that = this
    for (let checkedRoom of that.data.editDevices) {
      if (checkedRoom.area.uuid == e.currentTarget.dataset.id) {
        checkedRoom.isSelectAllText = true
        for (let itemDevice of checkedRoom.UILogicDevices) {
          itemDevice.checked = true
          itemDevice.selected = true;
          itemDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
          itemDevice.checkMode = 'checked';
        }
        if (that.isAllSelect(checkedRoom.UILogicDevices)) {
          checkedRoom.area.selectStatus = '取消全选'
        } else {
          checkedRoom.area.selectStatus = '选择全部'
        }
        
      }
      
    }
    that.setData({
      editDevices: that.data.editDevices
    })
  },
  unCheckedAll:function(e){
    console.log(e)
    let that = this
    for (let checkedRooms of that.data.editDevices){
      if (checkedRooms.area.uuid == e.currentTarget.dataset.id){
        checkedRooms.isSelectAllText = true
        for (let itemDevice of checkedRooms.UILogicDevices){
          itemDevice.checked = false
          itemDevice.selected = true
          itemDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
          itemDevice.checkMode = 'checked';
        }
        if (that.isAllSelect(checkedRooms.UILogicDevices)) {
          checkedRooms.area.selectStatus = '取消全选'
        } else {
          checkedRooms.area.selectStatus = '选择全部'
        }
        console.log(that.data)
      }
    }
   
    that.setData({
      editDevices: that.data.editDevices
    })
  },
  bindCheckAll:function(e){
    console.log(e)
    let that = this
    console.log(that.data)
    for (let allScene of that.data.editDevices){
      if (allScene.area.uuid == e.currentTarget.dataset.id){
        allScene.isSelectAllText = false
      }
    }
    that.setData({
      editDevices: that.data.editDevices
    })
  },
  switchtap: function(e) {
    console.log(e);
    let thisPage = this;
    let areaUuid = e.currentTarget.dataset.areauuid;
    let uuid = e.currentTarget.dataset.uuid;

    let tempDevices = thisPage.data.editDevices;

    for (let UIArea of tempDevices) {
      if (UIArea.area.uuid == areaUuid) {
        UIArea.isSelectAllText = true
        for (let UILogicDevice of UIArea.UILogicDevices) {
          if (UILogicDevice.logicDevice.uuid == uuid) {
            UILogicDevice.checked = !UILogicDevice.checked;
            if (UILogicDevice.checked) {
              UILogicDevice.selected = true;
              UILogicDevice.selectImg = '../../imgs/scene_edit_icon_select.png';
              UILogicDevice.checkMode = 'checked';
              if (UILogicDevice.logicDevice.profile == Const.Profile.SMART_PLUG) {
                UILogicDevice.img = '../../imgs/dev_icon_plug_on.png';
              } else if (UILogicDevice.logicDevice.profile == Const.Profile.ON_OFF_LIGHT) {
                UILogicDevice.img = '../../imgs/dev_icon_light_on.png';
              }
              break;
            } else {
              if (UILogicDevice.logicDevice.profile == Const.Profile.SMART_PLUG) {
                UILogicDevice.img = '../../imgs/dev_icon_plug_off.png';
              } else if (UILogicDevice.logicDevice.profile == Const.Profile.ON_OFF_LIGHT) {
                UILogicDevice.img = '../../imgs/dev_icon_light_off.png';
              }
            }
          }
        }
        break;
      }
    }

    thisPage.setData({
      editDevices: tempDevices
    });
    console.log(this.data.editDevices)
  },
  createScene: function() {
    let that = this;
    console.log(that.data);
    let newActions = [];
    for (let UIArea of that.data.editDevices) {
      for (let UILogicDevice of UIArea.UILogicDevices) {
        if (UILogicDevice.selected) {
          let uuid = UILogicDevice.logicDevice.uuid;
          let key;
          let value;
          if (
            UILogicDevice.logicDevice.profile == Const.Profile.ON_OFF_LIGHT ||
            UILogicDevice.logicDevice.profile == Const.Profile.SMART_PLUG
          ) {
            key = Const.AttrKey.ON_OFF_STATUS;
            value = UILogicDevice.checked ? 1 : 0;
          } else if (
            UILogicDevice.logicDevice.profile == Const.Profile.PIR_PANEL ||
            UILogicDevice.logicDevice.profile == Const.Profile.DOOR_CONTACT
          ) {
            key = Const.AttrKey.ALERT_LEVEL;
            value = UILogicDevice.checked ? 1 : 0;
          } else if (UILogicDevice.logicDevice.profile == Const.Profile.WINDOW_COVERING) {
            key = Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT;
            value = UILogicDevice.checked ? 100 : 0;
          } else {
            continue;
          }
          let action = new newAction(uuid, key, value);
          newActions.push(action);
        }
      }
    }
    console.log(newActions);
    let boxname = 'message/' + HomeCenterManager.defaultHomeCenterUuid;
    MqttClient.sendRequest({
      client: app.getClient(),
      topic: boxname,
      req: MqttClient.buildCreateSceneRequest(app.globalData.username_, that.data.sceneName, newActions),
      success: function() {
        console.log('创建成功');
        wx.navigateBack({
          delta: 1
        });
      },
      error: function(req, rsp) {
        console.log(req, rsp);
        feedbackApi.showToast({
          title: '创建失败'
        });
      }
    });
  },

  saveScene: function() {
    var that = this;
    console.log(that.data);
    if (that.data.sceneName == '') {
      feedbackApi.showToast({
        title: '场景名称为空'
      });
      return;
    }
    let cache = HomeCenterManager.getDefaultHomeCenterCache();
    if (cache == undefined) {
      return;
    }
    if (that.data.addScene == true) {
      that.createScene();
      return;
    }
    let scene = cache.getEntity(that.data.sceneUuid);
    if (scene == undefined) {
      return;
    }

    let newScene = scene.getCopy();
    newScene.name = that.data.sceneName;
    let newActions = [];

    for (let UIArea of that.data.editDevices) {
      for (let UILogicDevice of UIArea.UILogicDevices) {
        if (UILogicDevice.selected) {
          let uuid = UILogicDevice.logicDevice.uuid;
          let key;
          let value;
          if (
            UILogicDevice.logicDevice.profile == Const.Profile.ON_OFF_LIGHT ||
            UILogicDevice.logicDevice.profile == Const.Profile.SMART_PLUG
          ) {
            key = Const.AttrKey.ON_OFF_STATUS;
            value = UILogicDevice.checked ? 1 : 0;
          } else if (
            UILogicDevice.logicDevice.profile == Const.Profile.PIR_PANEL ||
            UILogicDevice.logicDevice.profile == Const.Profile.DOOR_CONTACT
          ) {
            key = Const.AttrKey.ALERT_LEVEL;
            value = UILogicDevice.checked ? 1 : 0;
          } else if (UILogicDevice.logicDevice.profile == Const.Profile.WINDOW_COVERING) {
            key = Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT;
            value = UILogicDevice.checked ? 100 : 0;
          } else {
            continue;
          }
          let action = new Action(uuid, key, value);
          newActions.push(action);
        }
      }
    }
    newScene.actions = newActions;

    if (newScene.isSameScene(scene) && that.data.sceneName == that.data.oldScenename) {
      console.log('提交保存的场景跟原场景一致');
      feedbackApi.showToast({
        title: '没有修改'
      });
    } else {
      let sender = app.globalData.username_;
      let topic = 'message/' + HomeCenterManager.defaultHomeCenterUuid;
      let client = app.getClient();
      let reqActions = that.getRequestAction(newScene.actions);
      MqttClient.sendRequest({
        client: client,
        topic: topic,
        req: MqttClient.buildUpdateSceneRequest(sender, newScene, reqActions),
        success: function() {
          feedbackApi.showToast({
            title: '场景更新成功'
          });
          console.log('update scene success');
          wx.navigateBack({
            delta: 1
          });
        },
        error: function(req, rsp) {
          console.log(req, rsp);
          feedbackApi.showToast({
            title: '场景更新失败'
          });
        }
      });
    }
    //}
  },

  getRequestAction: function(actions) {
    let reqActions = [];
    for (let action of actions) {
      let reqAction = {};
      reqAction.UUID = action.uuid;
      reqAction.AttrID = action.key;
      reqAction.AttrValue = action.value;
      reqActions.push(reqAction);
    }
    return reqActions;
  },

  onLoad: function(options) {
    console.log(options);
    if (options.addScene) {
      this.setData({
        addScene: true //当前场景的uuid
      });
      return;
    }
    this.setData({
      sceneUuid: options.sceneUuid, //当前场景的uuid
      deleteScene: options.del
    });
  },
  deleteScene: function() {
    let that = this;
    let sender = app.globalData.username_;
    let topic = 'message/' + HomeCenterManager.defaultHomeCenterUuid;
    let client = app.getClient();
    wx.showModal({
      title: '删除',
      content: '确定删除该场景？',
      success: function(res) {
        if (res.confirm) {
          MqttClient.sendRequest({
            client: client,
            topic: topic,
            req: MqttClient.buildDeleteSceneRequest(sender, that.data.sceneUuid),
            success: function() {
              feedbackApi.showToast({
                title: '场景删除成功'
              });
              setTimeout(function() {
                wx.navigateBack({
                  delta: 1
                });
              }, 1000);
            },
            error: function(req, rsp) {
              console.log(req, rsp);
              feedbackApi.showToast({
                title: '场景删除失败'
              });
            }
          });
        }
      }
    });
  },
  onShow: function() {
    let that = this;
    that.initData();
    console.log(this.data);
  }
});
