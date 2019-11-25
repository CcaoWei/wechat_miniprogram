/** @format */

// pages/bindDevice/bindDevice.js
import Const from '../../data/Const.js';
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var MqttClient = require('../../utils/mqttclient.js');
var Binding = require('../../clazz/Binding.js');
var Action = require('../../clazz/Action.js');
var app = getApp();
var feedbackApi = require('../../utils/showToast.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSave: false, // 是否显示保存按钮
    triggerAddress: '', //表示此绑定属于哪个设备(逻辑设备)
    bindingType: '', //这个判断是那个绑定入口进来的 1无线开关 2智能控灯 3门磁
    bindingUuid: '', //当前绑定的uuid
    bindingItems: [],
    bindingImage: [], //表示绑定上部图片
    doublebind: false, //是否是双键绑定
    curtain: null,
    uiScrollTop:false,
  },
  getEntityResult: function() {},
  hasSettingItem: function() {
    if (this.data.bindingType == Const.BindingType.KEY_PRESS) {
      return true;
    }
    let tempItems = this.data.bindingItems;
    let settingGroup = this.getSettingGroup(tempItems);
    if (settingGroup == undefined) {
      return true;
    }
    for (let settingItem of settingGroup.items) {
      if (settingItem.selected) {
        return true;
      }
    }
    return false;
  },

  // 保存提交
  saveSubmit: function() {
    let thisPage = this;
    let sender = app.globalData.username_;
    let client = app.getClient();
    let topic = 'message/' + HomeCenterManager.defaultHomeCenterUuid;
    let newBinding = thisPage.getNewBinding();
    let currentBinding = thisPage.getCurrentBinding();

    if (!this.hasSettingItem()) {
      if (this.data.bindingType == Const.BindingType.OPEN_CLOSE) {
        wx.showToast({
          title: '请设置门窗动作'
        });
      } else if (this.data.bindingType == Const.BindingType.PIR_PANEL) {
        wx.showToast({
          title: '请选择何时开灯'
        });
      }
      return;
    }

    let reqActions = thisPage.getRequestActions();
    console.log(reqActions);
    if (currentBinding) {
      if (reqActions.length == 0) {
        feedbackApi.showToast({ title: '请至少选择一个设备' }); //调用
        return;
      }
      //当前绑定存在, update
      MqttClient.sendRequest({
        client: client,
        topic: topic,
        req: MqttClient.buildUpdateBindingRequest(sender, newBinding, reqActions),
        success: function() {
          wx.showToast({
            title: '更新成功'
          });
          console.log('update binding success');
          wx.navigateBack({
            delta: 1
          });
        },
        error: function(req, rsp) {
          wx.showToast({
            title: '更新失败'
          });
          console.log('update binding failed');
          console.log(rsp);
        }
      });
    } else {
      //当前绑定不存在, create
      MqttClient.sendRequest({
        client: client,
        topic: topic,
        req: MqttClient.buildCreateBindingRequest(sender, newBinding, reqActions),
        success: function() {
          wx.showToast({
            title: '创建成功'
          });
          console.log('create binding success');
          wx.navigateBack({
            delta: 1
          });
        },
        error: function(req, rsp) {
          wx.showToast({
            title: '创建失败'
          });
          console.log('create binding failed');
          console.log(rsp);
        }
      });
    }
  },

  onMqttMsg: function(message) {
    if (message.DeviceDeleted) {
      let uuid = message.DeviceDeleted.UUID;
      let cache = HomeCenterManager.getDefaultHomeCenterCache();
      if (cache == undefined) {
        return;
      }
      let physicDevice = cache.getDeletedDevice(uuid);
      if (physicDevice == undefined || physicDevice.getEntityType() != Const.EntityType.PHYSIC_DEVICE) {
        return;
      }
      let tempItems = this.data.bindingItems;
      let bindingGroup = this.getBindingGroup(tempItems);
      for (let i = 0; i < bindingGroup.bindingAreas.length; i++) {
        let bindingArea = bindingGroup.bindingAreas[i];
        for (let j = 0; j < bindingArea.items.length; j++) {
          let bindingItem = bindingArea.items[j];
          if (physicDevice.contains(bindingItem.logicDevice.uuid)) {
            bindingArea.items.splice(j, 1);
            //如果该房间内没有设备 删除
            if (bindingArea.items.length == 0) {
              bindingGroup.bindingAreas.splice(i, 1);
            }
          }
        }
      }
      console.log(tempItems);
      this.setData({
        bindingItems: tempItems
      });
    } else if (message.EntityInfoConfigured) {
      let config = message.EntityInfoConfigured;
      console.log(config);
      // if (!config.IsNew) {
      //   return;
      // }
      let tempItems = this.data.bindingItems;
      let name = config.Name;
      if (name == undefined) {
        name = config.UUID;
      }
      let cache = HomeCenterManager.getDefaultHomeCenterCache();
      if (cache == undefined) {
        return;
      }

      let entity = cache.getEntity(config.UUID);
      if (entity == undefined) {
        return;
      }
      let bindingGroup = this.getBindingGroup(tempItems);

      if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        //墙壁开关
        let pd = entity;
        if (config.AreaUUID) {
          pd.areaUuid = config.AreaUUID;
        }
        let lds = pd.logicDevice;
        if (lds) {
          for (let ld of lds) {
            if (ld.profile == Const.Profile.ON_OFF_LIGHT) {
              let bindingItem = {
                logicDevice: ld,
                selected: false
              };
              this.setBindingItemImage(bindingItem);

              let bindingAreaExist = false;
              for (let bindingArea of bindingGroup.bindingArea) {
                //新添加的墙壁开关，默认逻辑设备的房间时没有配置的，所以其房间与其物理设备的房间一致
                if (bindingArea.area.uuid == pd.areaUuid) {
                  bindingArea.items.push(bindingItem);
                  bindingAreaExist = true;
                  break;
                }
              }
              if (!bindingAreaExist) {
                let area = cache.getEntity(ld.areaUuid);
                if (area == undefined) {
                  return;
                }
                let bindingArea = {
                  area: area,
                  items: []
                };
                bindingArea.items.push(bindingItem);
                bindingGroup.bindingAreas.push(bindingArea);
              }
            }
          }
        }
      } else if (entity.getEntityType() == Const.EntityType.LOGIC_DEVICE) {
        //灯座或者插座
        let ld = entity;
        ld.name = name;
        if (config.AreaUUID) {
          ld.areaUuid = config.AreaUUID;
        }

        let bindingItem = {
          logicDevice: ld,
          selected: false
        };
        this.setBindingItemImage(bindingItem);

        let bindingAreaExist = false;
        for (let bindingArea of bindingGroup.bindingAreas) {
          if (bindingArea.area.uuid == ld.areaUuid) {
            bindingArea.items.push(bindingItem);
            bindingAreaExist = true;
            break;
          }
        }
        if (!bindingAreaExist) {
          let area = cache.getEntity(ld.areaUuid);
          if (area == undefined) {
            return;
          }
          let bindingArea = {
            area: area,
            items: []
          };
          bindingArea.items.push(bindingItem);
          bindingGroup.bindingAreas.push(bindingArea);
        }
      }

      this.setData({
        bindingItems: tempItems
      });
    }
  },

  //判断某个灯座或插座是否在当前的绑定中
  bindingContainsAction: function(binding, uuid, bindingItem) {
    console.log(binding);
    if (binding == undefined) {
      return false;
    }
    if (binding.actions == undefined){
      return false
    }
    for (let action of binding.actions) {
      if (this.data.curtain == 'curtain') {
        if (action.value >= 50) {
          bindingItem.btn = true;
        } else if (action.value < 50) {
          bindingItem.btn = false;
        }
      }

      if (action.uuid == uuid) {
        return true;
      }
    }
    return false;
  },

  setBindingItemImage: function(bindingItem) {
    console.log(bindingItem);
    if (bindingItem.logicDevice.profile == Const.Profile.ON_OFF_LIGHT) {
      if (bindingItem.selected) {
        bindingItem.mode = 'selected-binding';
        bindingItem.deviceImage = '../../imgs/dev_icon_light_on.png';
        bindingItem.checkImage = '../../imgs/scene_edit_icon_select.png';
      } else {
        bindingItem.mode = 'unselected-binding';
        bindingItem.deviceImage = '../../imgs/dev_icon_light_off.png';
        bindingItem.checkImage = '../../imgs/scene_edit_icon_unselected.png';
      }
    } else if (bindingItem.logicDevice.profile == Const.Profile.SMART_PLUG) {
      if (bindingItem.selected) {
        bindingItem.mode = 'selected-binding';
        bindingItem.deviceImage = '../../imgs/dev_icon_plug_on.png';
        bindingItem.checkImage = '../../imgs/scene_edit_icon_select.png';
      } else {
        bindingItem.mode = 'unselected-binding';
        bindingItem.deviceImage = '../../imgs/dev_icon_plug_off.png';
        bindingItem.checkImage = '../../imgs/scene_edit_icon_unselected.png';
      }
    } else if (bindingItem.logicDevice.profile == Const.Profile.WINDOW_COVERING) {
      console.log(bindingItem);
      console.log(this.data);
      if (bindingItem.selected) {
        bindingItem.mode = 'selected-binding';
        bindingItem.deviceImage = '../../imgs/icon_curtain.png';
        bindingItem.checkImage = '../../imgs/scene_edit_icon_select.png';
      } else {
        console.log('>>>3');
        bindingItem.btn = false;
        bindingItem.mode = 'unselected-binding curtainunselect';
        bindingItem.deviceImage = '../../imgs/icon_curtain.png';
        bindingItem.checkImage = '../../imgs/scene_edit_icon_unselected.png';
      }
    }
  },

  setSettingItemImage: function(settingItem) {
    if (settingItem.selected) {
      settingItem.mode = 'selected-setting';
      settingItem.checkImage = '../../imgs/scene_edit_icon_select.png';
    } else {
      settingItem.mode = 'unselected-setting';
      settingItem.checkImage = '../../imgs/scene_edit_icon_unselected.png';
    }
  },

  getBindingGroup: function(bindingItems) {
    if (bindingItems == undefined) {
      return undefined;
    }
    for (let group of bindingItems) {
      if (group.groupIndex == 1) {
        return group;
      }
    }
    return undefined;
  },

  getSettingGroup: function(bindingItems) {
    if (bindingItems == undefined) {
      return undefined;
    }
    for (let group of bindingItems) {
      if (group.groupIndex == 2) {
        return group;
      }
    }
    return undefined;
  },

  getActions: function() {
    let actions = [];
    let bindingItems = this.data.bindingItems;
    let bindingGroup = this.getBindingGroup(bindingItems);
    for (let bindingArea of bindingGroup.bindingAreas) {
      for (let bindingItem of bindingArea.items) {
        if (!bindingItem.selected) {
          continue;
        }
        if (bindingItem.logicDevice.profile == Const.Profile.WINDOW_COVERING) {
          let uuid = bindingItem.logicDevice.uuid;
          let action = new Action(uuid, Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT, 100);
          actions.push(action);
        } else {
          let uuid = bindingItem.logicDevice.uuid;
          let action = new Action(uuid, Const.AttrKey.ON_OFF_STATUS, 1);
          actions.push(action);
        }
      }
    }
    console.log(actions);
    return actions;
  },

  getRequestActions: function() {
    let reqActions = [];
    let bindingItems = this.data.bindingItems;
    let bindingGroup = this.getBindingGroup(bindingItems);
    for (let bindingArea of bindingGroup.bindingAreas) {
      for (let bindingItem of bindingArea.items) {
        if (!bindingItem.selected) {
          continue;
        }
        console.log(this.data);
        if (bindingItem.logicDevice.profile == Const.Profile.WINDOW_COVERING) {
          let uuid = bindingItem.logicDevice.uuid;
          let reqAction = {
            UUID: uuid,
            AttrID: Const.AttrKey.WINDOW_CURRENT_LIFT_PERCENT,
            AttrValue: bindingItem.btn == true ? 100 : 0
          };
          reqActions.push(reqAction);
        } else {
          let uuid = bindingItem.logicDevice.uuid;
          let reqAction = {
            UUID: uuid,
            AttrID: Const.AttrKey.ON_OFF_STATUS,
            AttrValue: 1
          };
          reqActions.push(reqAction);
        }
      }
    }
    console.log(reqActions);
    return reqActions;
  },

  getBindingItem: function(bindingGroup, uuid) {
    if (bindingGroup == undefined || uuid == undefined) {
      return undefined;
    }
    for (let bindingArea of bindingGroup.bindingAreas) {
      for (let bindingItem of bindingArea.items) {
        if (bindingItem.logicDevice.uuid == uuid) {
          return bindingItem;
        }
      }
    }
    return undefined;
  },

  getNewBinding: function() {
    console.log(this.data.bindingUuid);
    let currentBinding = this.getCurrentBinding();
    console.log(currentBinding)
    if (currentBinding == undefined) {
      let uuid = this.data.bindingUuid;
      let triggerAddress = this.data.triggerAddress;
      let types = Number(this.data.bindingType);
      let binding;
      if (this.data.doublebind == true) {
        binding = new Binding(uuid, triggerAddress, types, 2, true);
      } else {
        binding = new Binding(uuid, triggerAddress, types, 1, true);
      }

      let actions = this.getActions();
      binding.actions = actions;
      console.log(binding);
      if (types == Const.BindingType.OPEN_CLOSE || types == Const.BindingType.PIR_PANEL) {
        let bindingItems = this.data.bindingItems;
        let settingGroup = this.getSettingGroup(bindingItems);
        for (let settingItem of settingGroup.items) {
          if (settingItem.selected) {
            binding.parameter = settingItem.para;
            break;
          }
        }
      }
      return binding;
    } else {
      let binding = currentBinding.getCopy();
      let actions = this.getActions();
      binding.actions = actions;
      console.log(binding);
      let types = this.data.bindingType;
      if (types == Const.BindingType.OPEN_CLOSE || types == Const.BindingType.PIR_PANEL) {
        let bindingItems = this.data.bindingItems;
        let settingGroup = this.getSettingGroup(bindingItems);
        for (let settingItem of settingGroup.items) {
          if (settingItem.selected) {
            binding.parameter = settingItem.para;
            break;
          }
        }
      }
      return binding;
    }
  },

  getCurrentBinding: function() {
    let cache = HomeCenterManager.getDefaultHomeCenterCache();
    if (cache == undefined) {
      return undefined;
    }
    let binding = cache.getEntity(this.data.bindingUuid);
    return binding;
  },
  curtainChange: function(newaction, oldaction) {
    for (let newa of newaction) {
      for (let olda of oldaction) {
        if (newa.AttrValue != olda.value && newa.UUID == olda.uuid) {
          return true;
        }
      }
    }
  },
  isSameBinding: function(currentBinding, newBinding) {
    console.log(currentBinding, newBinding);
    if (currentBinding == undefined) {
      if (newBinding.actions.length == 0) {
        return true;
      } else {
        return false;
      }
    } else {
      if (currentBinding.parameter != newBinding.parameter) {
        return false;
      }
      if (this.data.curtain == 'curtain') {
        let entites = HomeCenterManager.getDefaultHomeCenterCache().entities;
        let oldactions = entites.get(this.data.bindingUuid).actions;
        if (currentBinding.actions.length == newBinding.actions.length) {
          if (this.curtainChange(this.getRequestActions(), oldactions) == true) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else {
        if (
          currentBinding.actions.length != newBinding.actions.length &&
          currentBinding.actions.length == 0
        ) {
          return true;
        } else if (
          currentBinding.actions.length != newBinding.actions.length &&
          currentBinding.actions.length != 0
        ) {
          return false;
        }
      }

      //在Actions数量相同的情况下，如果新的Binding中的每个Action都存在于当前Binding中，则认为两个Binding是一样的，反之两个Binding是不一样的
      for (let newAction of newBinding.actions) {
        if (!this.newBindingActionsExistInCurrentBinding(newAction, currentBinding)) {
          return false;
        }
      }
      return true;
    }
  },

  //新建Binding的某个Action是否在当前绑定中已存在
  newBindingActionsExistInCurrentBinding: function(newAction, currentBinding) {
    for (let currentAction of currentBinding.actions) {
      if (newAction.uuid == currentAction.uuid && newAction.value == currentAction.value) {
        return true;
      }
    }
    return false;
  },

  bindBindingItemClicked: function(e) {
    let thisPage = this;
    console.log(e);
    let uuid = e.currentTarget.dataset.uuid;

    let tempItems = thisPage.data.bindingItems;
    let bindingGroup = thisPage.getBindingGroup(tempItems);
    let bindingItem = thisPage.getBindingItem(bindingGroup, uuid);
    // if (e.currentTarget.dataset.btn != 'undefined'){
    //   bindingItem.btn = e.currentTarget.dataset.btn
    // }else{
    bindingItem.selected = !bindingItem.selected;
    // }

    thisPage.setBindingItemImage(bindingItem);

    let currentBinding = thisPage.getCurrentBinding();
    let newBidning = thisPage.getNewBinding();
    let isSame = thisPage.isSameBinding(currentBinding, newBidning);
    console.log(isSame);

    thisPage.setData({
      bindingItems: tempItems,
      isSave: !isSame
    });
  },

  bindSettingItemClicked: function(e) {
    let thisPage = this;
    console.log(e);
    let para = e.currentTarget.dataset.para;

    if (para == -1) {
      wx.showToast({
        title: '暂不支持'
      });
      return;
    }
    let tempItems = thisPage.data.bindingItems;
    let settingGroup = thisPage.getSettingGroup(tempItems);
    for (let settingItem of settingGroup.items) {
      settingItem.selected = settingItem.para == para;
      thisPage.setSettingItemImage(settingItem);
    }
    let currentBinding = thisPage.getCurrentBinding();
    let newBidning = thisPage.getNewBinding();
    let isSame = thisPage.isSameBinding(currentBinding, newBidning);
    console.log(isSame);
    thisPage.setData({
      bindingItems: tempItems,
      isSave: !isSame
    });
  },
  switchtap: function(e) {
    let thisPage = this;
    console.log(e);
    let uuid = e.currentTarget.dataset.uuid;
    let tempItems = thisPage.data.bindingItems;
    let bindingGroup = thisPage.getBindingGroup(tempItems);
    let bindingItem = thisPage.getBindingItem(bindingGroup, uuid);
    bindingItem.selected = true;
    bindingItem.btn = e.currentTarget.dataset.btn;
    thisPage.setBindingItemImage(bindingItem);
    let currentBinding = thisPage.getCurrentBinding();
    let newBidning = thisPage.getNewBinding();
    let isSame = thisPage.isSameBinding(currentBinding, newBidning);
    thisPage.setData({
      bindingItems: tempItems,
      isSave: !isSame
    });
  },
  // 设备匹配自己的区域
  matchingArea: function (area, areaUuid, logDevice) {
    console.log(area)
    console.log(areaUuid)
    console.log(logDevice)
    for (var s of area) {
      if (s.area.uuid == areaUuid) {
        s.items.push(logDevice);
        return
      }
    }
    area[0].items.push(logDevice)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  initData: function() {
    let cache = HomeCenterManager.getDefaultHomeCenterCache();
    if (cache == undefined) {
      return;
    }
    let currentBinding = cache.getEntity(this.data.bindingUuid);
    console.log(currentBinding);
    if (currentBinding == undefined) {
      console.log('current binding is undefined');
    }

    let entities = cache.entities;
    console.log(entities);

    let bindings = [];
    let physicDevices = [];
    let areas = [];
    for (let entity of entities.values()) {
      if (entity.getEntityType() == Const.EntityType.BINDING) {
        //绑定
        bindings.push(entity);
      } else if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        // if (entity.isNew) {
        //   continue;
        // }
        // if (that.data.bindingType == Const.BindingType.ROTARY) {
        //   if (
        //     (entity.logicDevice[0].profile == 1 ||
        //       entity.logicDevice[0].profile == 5 ||
        //       entity.logicDevice[0].profile == 2) &&
        //     entity.Available == true
        //   ) {
        //     physicDevices.push(entity);
        //   }
        //   return
        // }
        if (entity.logicDevice.length > 0) {
          if (
            (entity.logicDevice[0].profile == 1 ||
              entity.logicDevice[0].profile == 5 ||
              entity.logicDevice[0].profile == 2) &&
            entity.Available == true
          ) {
            physicDevices.push(entity);
          }
          
        }
      } else if (entity.getEntityType() == Const.EntityType.AREA) {
        areas.push(entity);
      }
    }

    let UIGroups = [];
    let bindingGroup = {};
    let settingGroup = {};

    bindingGroup.name = '请选择想要打开的设备';
    bindingGroup.groupIndex = 1;
    settingGroup.groupIndex = 2;

    console.log(this.data.bindingType);
    if (this.data.bindingType == Const.BindingType.KEY_PRESS) {
      UIGroups.push(bindingGroup);
    } else if (this.data.bindingType == Const.BindingType.OPEN_CLOSE) {
      settingGroup.name = '设置门窗动作';
      settingGroup.description = '当门窗打开或关闭时触发';
      settingGroup.type = 0;

      let settingItems = [];

      let settingItem1 = {
        title: '打开',
        para: 1,
        selected: currentBinding == undefined ? false : currentBinding.parameter == 1
      };
      this.setSettingItemImage(settingItem1);
      settingItems.push(settingItem1);

      let settingItem2 = {
        title: '关闭',
        para: 0,
        selected: currentBinding == undefined ? false : currentBinding.parameter == 0
      };
      this.setSettingItemImage(settingItem2);
      settingItems.push(settingItem2);

      let settingItem3 = {
        title: '打开或关闭',
        para: 2,
        selected: currentBinding == undefined ? false : currentBinding.parameter == 2
      };
      this.setSettingItemImage(settingItem3);
      settingItems.push(settingItem3);

      settingGroup.items = settingItems;
      UIGroups.push(bindingGroup);
      UIGroups.push(settingGroup);
    } else if (this.data.bindingType == Const.BindingType.PIR_PANEL) {
      settingGroup.name = '请设置照度的条件阈值';
      settingGroup.description = '当环境照度低于此阈值才可触发';
      settingGroup.type = 1;

      let settingItems = [];

      let settingItem1 = {
        title: '光线强,如烈日',
        para: Const.Luminance.VERY_VERY_LIGHT,
        icon: '../../imgs/very_very_light.png',
        selected:
          currentBinding == undefined
            ? false
            : currentBinding.parameter > Const.Luminance.VERY_LIGHT &&
              currentBinding.parameter <= Const.Luminance.VERY_VERY_LIGHT
      };
      this.setSettingItemImage(settingItem1);
      settingItems.push(settingItem1);

      let settingItem2 = {
        title: '光线亮,如阅读',
        para: Const.Luminance.VERY_LIGHT,
        icon: '../../imgs/very_light.png',
        selected:
          currentBinding == undefined
            ? false
            : currentBinding.parameter <= Const.Luminance.VERY_LIGHT &&
              currentBinding.parameter > Const.Luminance.LITTLE_DARK
      };
      this.setSettingItemImage(settingItem2);
      settingItems.push(settingItem2);

      let settingItem3 = {
        title: '光线微亮,如夜灯',
        para: Const.Luminance.LITTLE_DARK,
        icon: '../../imgs/little_dark.png',
        selected:
          currentBinding == undefined
            ? false
            : currentBinding.parameter <= Const.Luminance.LITTLE_DARK &&
              currentBinding.parameter > Const.Luminance.VERY_DARK
      };
      this.setSettingItemImage(settingItem3);
      settingItems.push(settingItem3);

      let settingItem4 = {
        title: '光线较暗,如夜晚',
        para: Const.Luminance.VERY_DARK,
        icon: '../../imgs/very_dark.png',
        selected:
          currentBinding == undefined ? false : currentBinding.parameter <= Const.Luminance.VERY_DARK
      };
      this.setSettingItemImage(settingItem4);
      settingItems.push(settingItem4);

      let settingItem5 = {
        title: '自定义',
        para: -1,
        icon: '../../imgs/defined.png',
        selected: false
      };
      this.setSettingItemImage(settingItem5);
      settingItems.push(settingItem5);

      settingGroup.items = settingItems;
      UIGroups.push(bindingGroup);
      UIGroups.push(settingGroup);
    } else if (this.data.bindingType == Const.BindingType.ROTARY) {
      UIGroups.push(bindingGroup);
    }

    let bindingAreas = [];
    for (let area of areas) {
      let bindingArea = {};
      bindingArea.area = area;
      bindingArea.items = [];
      bindingAreas.push(bindingArea);
    }
    // let undefinedBindingArea = {}
    // undefinedBindingArea.area = new Area('area-0000', '未定义区域')
    // undefinedBindingArea.items = []
    // bindingAreas.push(undefinedBindingArea)
    if (this.data.curtain == 'curtain') {
      for (let pd of physicDevices) {
        if (pd.isCurtain() && pd.isNew == false) {
          let lds = pd.logicDevice;
          console.log(lds);
          if (lds) {
            for (let ld of lds) {
              let bindingItem = {};
              bindingItem.logicDevice = ld;
              bindingItem.selected = this.bindingContainsAction(currentBinding, ld.uuid, bindingItem);
              this.setBindingItemImage(bindingItem);
              this.matchingArea(bindingAreas, ld.areaUuid, bindingItem)
              console.log(bindingAreas)
              // for (let bindingArea of bindingAreas) {
              //   if (bindingArea.area.uuid == ld.areaUuid) {
              //     bindingArea.items.push(bindingItem);
              //     break
              //   }
              // }
              // bindingAreas[0].items.push(bindingItem)
            }
          }
        }
      }
      console.log(this.data);
    } else {
      for (let pd of physicDevices) {
        if (this.data.bindingType == Const.BindingType.ROTARY){
          console.log("??!@!@12")
          if (pd.logicDevice[0].profile == 1 || pd.logicDevice[0].profile == 2 || pd.logicDevice[0].profile == 5) {
            let lds = pd.logicDevice;
            if (lds) {
              for (let ld of lds) {
                if (ld.profile == Const.Profile.ON_OFF_LIGHT || ld.profile == 1 || ld.profile == 5) {
                  if (ld.isWallSwitchLightChange() != true) {
                    let bindingItem = {};
                    bindingItem.logicDevice = ld;
                    bindingItem.selected = this.bindingContainsAction(currentBinding, ld.uuid);
                    this.setBindingItemImage(bindingItem);
                    this.matchingArea(bindingAreas, ld.areaUuid, bindingItem)
                    console.log(bindingAreas)
                  }
                }
              }
            }
          }
        }else{
          if (pd.logicDevice[0].profile == 1 || pd.logicDevice[0].profile == 2) {
            let lds = pd.logicDevice;
            if (lds) {
              for (let ld of lds) {
                if (ld.profile == Const.Profile.ON_OFF_LIGHT || ld.profile == 1) {
                  // for (let attr of ld.attributes){
                  console.log(ld.isWallSwitchLightChange());
                  if (ld.isWallSwitchLightChange() != true) {
                    let bindingItem = {};
                    bindingItem.logicDevice = ld;
                    bindingItem.selected = this.bindingContainsAction(currentBinding, ld.uuid);
                    this.setBindingItemImage(bindingItem);
                    this.matchingArea(bindingAreas, ld.areaUuid, bindingItem)
                    console.log(bindingAreas)
                  }
                }
              }
            }
          }
        }
       
      }
    }

    let bindingAreasWithActions = [];
    for (let bindingArea of bindingAreas) {
      if (bindingArea.items.length > 0) {
        bindingAreasWithActions.push(bindingArea);
      }
    }

    bindingGroup.bindingAreas = bindingAreasWithActions;

    console.log(UIGroups);

    this.setData({
      bindingItems: UIGroups
    });
    console.log(this.data.bindingItems);
  },

  onLoad: function(options) {
    let that = this;
    console.log(options)
    that.setData({
      bindingType: options.bindingType,
      bindingUuid: options.bindingUuid,
      triggerAddress: options.triggerAddress,
      curtain: options.curtain
    });

    console.log(that.data);
    let entities = HomeCenterManager.getDefaultHomeCenterCache().entities;
    let physicd = entities.get(options.parentuuid);
    if (that.data.bindingType == Const.BindingType.KEY_PRESS) {
      if (physicd.isWallSwitch() != true && physicd.isUsWallSwitch() != true && physicd.isSmartDial() != true) {
        if (options.curtain == 'curtain') {
          //窗帘上图
          this.setData({
            bindingImage: '../../imgs/swbindcurtain.gif'
          });
        } else if (options.curtain == 'undefined') {
          //设备上图
          // console.log('>>>>>2');
          this.setData({
            bindingImage: '../../imgs/swbinddevice.gif'
          });
        }
      } else if (physicd.isUsWallSwitch() == true) {
        if (options.curtain == 'curtain') {
          //窗帘上图
          this.setData({
            bindingImage: '../../imgs/usSwbindcurtain.gif'
          });
        } else if (options.curtain == 'undefined') {
          //设备上图
          // console.log('>>>>>2');
          this.setData({
            bindingImage: '../../imgs/usSwbinddevice.gif'
          });
        }
      } else if (physicd.isWallSwitch() == true) {
        if (options.curtain == 'curtain') {
          //窗帘上图
          // console.log('>>>>>3');
          this.setData({
            bindingImage: '../../imgs/wsbindcurtain.gif'
          });
        } else if (options.curtain == 'undefined') {
          //设备上图
          console.log('>>>>>4');
          this.setData({
            bindingImage: '../../imgs/wsbinddevice.gif'
          });
        }
      } else if (physicd.isSmartDial() == true) {
        if (options.curtain == 'curtain') {
          //窗帘上图
          this.setData({
            bindingImage: '../../imgs/press_rotary_knob_light.gif'
          });
        } else if (options.curtain == 'undefined') {
          //设备上图
          // console.log('>>>>>2');
          this.setData({
            bindingImage: '../../imgs/press_rotary_knob_urtain.gif'
          });
        }
      } 
      if (options.doublebind == 'true') {
        wx.setNavigationBarTitle({
          title: '快速双击 控制设备'
        });
        
        
      } else {
        wx.setNavigationBarTitle({
          title: '所有事情 一键搞定'
        });
      }
    } else if (that.data.bindingType == Const.BindingType.OPEN_CLOSE) {
      wx.setNavigationBarTitle({
        title: '门开 灯亮'
      });
      this.setData({
        bindingImage: '../../imgs/dooropen_light.gif'
      });
    } else if (that.data.bindingType == Const.BindingType.PIR_PANEL) {
      wx.setNavigationBarTitle({
        title: '有人经过 自动亮灯'
      });
      that.setData({
        bindingImage: '../../imgs/pirpeople_pass.gif'
      });
      console.log(that.data.bindingImage);
    } else if (that.data.bindingType == Const.BindingType.ROTARY) {
      wx.setNavigationBarTitle({
        title: '左旋右旋，精准控制'
      });
      that.setData({
        bindingImage: '../../imgs/rotary_knob_curtain.gif'
      });
      console.log(that.data.bindingImage);
    }
    if (options.doublebind == 'true') {
      this.setData({
        doublebind: true
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    that.initData();
    console.log(this.data);
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    // clearInterval(timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // clearInterval(timer)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  onPageScroll: function (e) {
    if (e.scrollTop >= 290){
      this.setData({
        uiScrollTop:true
      })
    }else{
      this.setData({
        uiScrollTop: false
      })
    }
  }
});
