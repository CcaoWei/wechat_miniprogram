/** @format */

import Const from '../data/Const.js';

module.exports = class PhysicDevice {
  constructor(uuid, available, isNew, version, model, areaUuid, name) {
    let that = this;
    that.uuid = uuid;
    that.Available = available;
    that.isNew = isNew;
    that.version = version;
    that.model = model;
    that.areaUuid = areaUuid;
    that.name = name;
    if (name) {
      that.uiname = name;
    } else {
      that.uiname = uuid.substr(12, 7);
    }
  }

  getEntityType() {
    return Const.EntityType.PHYSIC_DEVICE;
  }

  setVersion(version) {
    let that = this;
    console.log(that);
    that.version = Number(version);
    for (let attribute of that.attributes) {
      if (attribute.key == Const.AttrKey.FIRMWARE_VERSION) {
        attribute.value = Number(version);
      }
    }
  }

  //设置Attribute, 主要用于DeviceAttrReport时更新attr
  setAttribute(attr) {
    let that = this;
    if (that.attributes) {
      for (let attribute of that.attributes) {
        if (attribute.key == attr.AttrID) {
          attribute.value = attr.AttrValue;
        }
      }
    }
  }

  //设置物理设备里某个逻辑设备的attr
  setChildAttribute(uuid, attr) {
    if (this.logicDevice) {
      for (let ld of this.logicDevice) {
        if (ld.uuid == uuid) {
          ld.setAttribute(attr);
        }
      }
    }
  }

  childInfoConfiged(uuid, name, areaUuid) {
    let that = this;
    if (that.logicDevice) {
      for (let ld of that.logicDevice) {
        if (ld.uuid == uuid) {
          ld.infoConfiged(name, areaUuid);
        }
      }
    }
  }
  setAvailable() {
    let that = this;
    that.Available = false;
  }

  //判断物理设备是否包含某个逻辑设备
  contains(uuid) {
    let that = this;
    if (that.uuid == uuid) {
      return true;
    }
    for (let ld of that.logicDevice) {
      if (ld.uuid == uuid) {
        return true;
      }
    }
    return false;
  }

  getLogicDevice(uuid) {
    let that = this;
    for (let ld of that.logicDevice) {
      if (ld.uuid == uuid) {
        return ld;
      }
    }
    return undefined;
  }

  getName() {
    let that = this;
    if (that.name) {
      return that.name;
    }
    return that.getName.substr(12, 7);
  }

  setName(name) {
    let that = this;
    that.name = name;
    that.uiname = name;
  }

  isWallSwitch() {
    let that = this;
    return (
      that.model == Const.DeviceModel.WALL_SWITCH_S1 ||
      that.model == Const.DeviceModel.WALL_SWITCH_S2 ||
      that.model == Const.DeviceModel.WALL_SWITCH_S3 ||
      that.model == Const.DeviceModel.WALL_SWITCH_S4 ||
      that.model == Const.DeviceModel.WALL_SWITCH_D1 ||
      that.model == Const.DeviceModel.WALL_SWITCH_D2 ||
      that.model == Const.DeviceModel.WALL_SWITCH_D3 ||
      that.model == Const.DeviceModel.WALL_SWITCH_D4 
    );
  }
  isSwitchModule() {
    let that = this;
    return (
      that.model == Const.DeviceModel.SWITCH_MODULE
    );
  }
  // ||
  // that.model == Const.DeviceModel.WALL_SWITCH_X1
  isUsWallSwitch() {
    let that = this;
    return (
      that.model == Const.DeviceModel.WALL_SWITCH_X1
    );
  }
  isLightSocket() {
    let that = this;
    return that.model == Const.DeviceModel.LIGHT_SOCKET;
  }

  isSmartPlug() {
    let that = this;
    return that.model == Const.DeviceModel.SMART_PLUG;
  }
  isCurtain() {
    let that = this;
    return that.model == Const.DeviceModel.CURTAIN;
  }
  isSmartDial(){
    let that = this;
    return that.model == Const.DeviceModel.SMART_DIAL;
  }
  isZHHVRVGateway() {
    let that = this;
    return that.model == Const.DeviceModel.HA_ZHH_GATEWAY 
  }
};
