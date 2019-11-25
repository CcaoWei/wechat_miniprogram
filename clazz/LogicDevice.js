/** @format */

import Const from '../data/Const.js';

module.exports = class LogicDevice {
  constructor(uuid, name, profile, areaUuid) {
    var that = this;
    that.uuid = uuid;
    that.name = name;
    that.profile = profile;
    that.areaUuid = areaUuid;
    if (name) {
      that.uiname = name;
    } else {
      that.uiname = uuid.substr(12, 7);
    }
  }

  setAttribute(attr) {
    var that = this;
    if (that.attributes) {
      for (let attribute of that.attributes) {
        if (attribute.key == attr.AttrID) {
          attribute.value = attr.AttrValue;
        }
      }
    }
  }

  infoConfiged(name, areaUuid) {
    var that = this;
    if (name != undefined && name != '') {
      that.setName(name);
    }
    if (areaUuid != undefined && areaUuid != '') {
      that.areaUuid = areaUuid;
    }
  }

  isWallSwitchButton() {
    var that = this;
    return that.profile == Const.Profile.YAN_BUTTON;
  }
  isPureInput() {
    var that = this;
    if (that.profile == Const.Profile.ON_OFF_LIGHT) {
      for (let attr of that.attributes) {
        if (attr.key == Const.AttrKey.CFG_SW_Pure_Input && attr.value == 1) {
          return true;
        } else if (attr.key == Const.AttrKey.CFG_SW_Pure_Input && attr.value != 1) {
          return false;
        }
      }
    }
    // return that.profile == Const.Profile.ON_OFF_LIGHT;
  }
  isWallSwitchLightChange() {
    var that = this;
    if (that.profile == Const.Profile.ON_OFF_LIGHT) {
      for (let attr of that.attributes) {
        if (attr.key == 26 && attr.value == 1) {
          return true;
        } else if (attr.key == 26 && attr.value != 1) {
          return false;
        }
      }
    }
    // return that.profile == Const.Profile.ON_OFF_LIGHT;
  }
  isZHHVRVGateway() {
    var that = this;
    return that.profile == Const.Profile.HA_ZHH_GATEWAY;
  }
  isVRVUnitMachine() {
    var that = this;
    return that.profile == Const.Profile.HA_ZHH_UNIT_MACHINE;
  }
  getName() {
    var that = this;
    if (that.name) {
      return that.name;
    }
    return that.uuid.subStr(12, 7);
  }

  setName(name) {
    var that = this;
    that.name = name;
    that.uiname = name;
  }

  getEntityType() {
    return Const.EntityType.LOGIC_DEVICE;
  }
};
