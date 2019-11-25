/** @format */

import Const from 'Const.js';
var Area = require('../clazz/Area.js');
var Scene = require('../clazz/Scene.js')
var Binding = require('../clazz/Binding.js')
var PhysicDevice = require('../clazz/PhysicDevice.js')
var Firmware = require('../clazz/Firmware.js')
var ZigbeeSystem = require('../clazz/ZigbeeSystem.js')
var HomeCenter = require('../clazz/HomeCenter.js')
var EntityParser = require('../utils/EntityParser.js');
module.exports = class HomeCenterCache {
  constructor(uuid) {
    let that = this;
    that.uuid = uuid;
    that.deletedDevices = new Map();
  }
  addEntity(entity) {
    let that = this;
    if (that.entities == undefined) {
      that.entities = new Map();
    }
    that.entities.set(entity.uuid, entity);
  }

  getDeletedDevice(uuid) {
    let that = this;
    if (that.deletedDevices.has(uuid)) {
      return that.deletedDevices.get(uuid);
    }
    return undefined;
  }

  getEntity(uuid) {
    let that = this;
    if (that.entities) {
      if (that.entities.has(uuid)) {
        return that.entities.get(uuid);
      } else {
        for (let entity of that.entities.values()) {
          // console.log(entity);
          if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
            if (entity.contains(uuid)) {
              return entity.getLogicDevice(uuid);
            }
          }
        }
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  toString() {
    let that = this;
    console.log(that.entities);
    for (let entity of that.entities.values()) {
      console.log(entity.getEntityType());
    }
  }

  processHomeCenterOffline() {
    let that = this;
    if (that.entities == undefined) {
      return;
    }
    for (let entity of that.entities.values()) {
      if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        entity.Available = false;
      }
      if (entity.getEntityType() == Const.EntityType.HOME_CENTER) {
        entity.online = false;
      }
    }
  }

  processDeviceDelete(uuid) {
    let that = this;
    if (that.entities && that.entities.has(uuid)) {
      console.log('删除了设备: ' + uuid);
      that.deletedDevices.set(uuid, that.entities.get(uuid));
      that.entities.delete(uuid);
      console.log(that.entities);
    }
  }

  processDeviceOffline(uuid) {
    let that = this;
    if (that.entities && that.entities.has(uuid)) {
      console.log('设备离线了: ' + uuid);
      let entity = that.entities.get(uuid);
      for (let logicD of entity.logicDevice) {
        logicD.Available = false;
      }
      entity.Available = false;
    }
  }

  processBindingEnable(uuid, enabled) {
    let that = this;
    if (that.entities && that.entities.has(uuid)) {
      console.log('Binding enable: ' + uuid + enabled);
      let binding = that.entities.get(uuid);
      binding.enabled = enabled;
    }
  }

  processGetEntityResult(result) {
    let that = this;
    let ents = result.Entities;
    if (ents && ents.length > 0) {
      if (ents[0].BaseType == 1) {
        for (let i = 0; i < ents.length; i++) {
          let entity = ents[i];
          let area = EntityParser.parseArea(entity);
          that.addEntity(area);
        }
        that.addEntity(new Area('area-0000', '默认房间'));
      } else if (ents[0].BaseType == 2) {
        for (let i = 0; i < ents.length; i++) {
          let entity = ents[i];
          let model = entity.Model;
          if (model == 'TERNCY-GW01') {
            console.log(entity);
            let homeCenter = EntityParser.parseHomeCenter(entity);
            that.addEntity(homeCenter);
          } else {
            let physicDevice = EntityParser.parsePhysicDevice(entity);
            that.addEntity(physicDevice);
          }
        }
      } else if (ents[0].BaseType == 3) {
        console.log('暂时不作处理');
      } else if (ents[0].BaseType == 4) {
        for (let i = 0; i < ents.length; i++) {
          let entity = ents[i];
          let zigbeeSystem = EntityParser.parseZigbeeSystem(entity);
          that.addEntity(zigbeeSystem);
        }
      } else if (ents[0].BaseType == 5) {
        for (let i = 0; i < ents.length; i++) {
          let entity = ents[i];
          let firmware = EntityParser.parseFirmware(entity);
          that.addEntity(firmware);
        }
      } else if (ents[0].BaseType == 6) {
        for (let i = 0; i < ents.length; i++) {
          let entity = ents[i];
          if (entity.EntityBinding) {
            let binding = EntityParser.parseBinding(entity);
            that.addEntity(binding);
          }
          if (entity.EntityScene) {
            let scene = EntityParser.parseScene(entity);
            that.addEntity(scene);
          }
        }
      }
    }
  }

  processDeviceAttrReport(uuid, attr, rssi) {
    let that = this;
    if (that.entities) {
      if (that.entities.has(uuid)) {
        let entity = that.entities.get(uuid);
        entity.setAttribute(attr);
        if (rssi) {
          entity.rssi = rssi;
        }
      } else {
        for (let entity of that.entities.values()) {
          if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE && entity.contains(uuid)) {
            entity.setChildAttribute(uuid, attr);
            if (rssi) {
              entity.rssi = rssi;
            }
          }
        }
      }
    }
  }

  processEntityAvailable(entity) {
    let that = this;
    if (entity.EntityDevice) {
      let physicDevice = EntityParser.parsePhysicDevice(entity);
      that.addEntity(physicDevice);
    } else if (entity.EntityZigbeeSystem) {
      let zigbeeSystem = EntityParser.parseZigbeeSystem(entity);
      that.addEntity(zigbeeSystem);
    } else if (entity.EntityFirmware) {
      let firmware = EntityParser.parseFirmware(entity);
      that.addEntity(firmware);
    } else {
      console.log('Entity available');
      console.log(entity);
    }
  }

  processBindingCreated(entity) {
    let that = this;
    if (entity.EntityBinding) {
      let binding = EntityParser.parseBinding(entity);
      that.addEntity(binding);
    }
  }
  // 添加场景
  processSceneCreated(entity) {
    let that = this;
    console.log(entity);
    if (entity.EntityScene) {
      let scene = EntityParser.parseScene(entity);
      that.addEntity(scene);
    }
  }
  processRoomCreated(entity) {
    let that = this;
    console.log(entity);
    if (entity.EntityArea) {
      let room = EntityParser.parseArea(entity);
      that.addEntity(room);
    }
  }
  // 删除场景
  processSceneDeleted(entity) {
    let that = this;
    console.log(entity);
    if (entity.BindingDeleted) {
      let uuid = entity.BindingDeleted.UUID;
      if (that.entities == undefined) {
        that.entities = new Map();
      }
      that.entities.delete(uuid);
    }
  }
  processBindingUpdated(entity) {
    let that = this;
    if (entity.EntityBinding) {
      let binding = EntityParser.parseBinding(entity);
      that.addEntity(binding);
    }
  }

  processSceneUpdated(entity) {
    let that = this;
    if (entity.EntityScene) {
      let scene = EntityParser.parseScene(entity);
      that.addEntity(scene);
    }
  }

  processEntityInfoConfiged(config) {
    console.log(config);
    let that = this;
    if (that.entities) {
      let uuid = config.UUID;
      let name = config.Name;
      let areaUuid = config.AreaUUID;
      if (that.entities.has(uuid)) {
        let entity = that.entities.get(uuid);
        if (config.IsNew) {
          entity.isNew = false;
        }
        if (name != undefined && name != '') {
          entity.setName(name);
        }
        if (areaUuid != undefined && areaUuid != '') {
          entity.areaUuid = areaUuid;
        }
      } else {
        for (let entity of this.entities.values()) {
          if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
            if (entity.contains(uuid)) {
              if (config.IsNew) {
                entity.isNew = false;
              }
              entity.childInfoConfiged(uuid, name, areaUuid);
            }
          }
        }
      }
    }
  }

  // processEntityInfoConfiged(config) {
  //   if (this.entities) {
  //     let uuid = config.UUID
  //     let name = config.Name
  //     let areaUuid = config.AreaUUID
  //     var presentuuid = uuid.substr(0, 16) + '-00'
  //     if (this.entities.has(presentuuid)) {
  //       let entity = this.entities.get(presentuuid)
  //       if (config.IsNew) {
  //         entity.isNew = false
  //       }
  //       for (var logcD of entity.logicDevice) {
  //         if (logcD.uuid == uuid) {
  //           if (name != '') {
  //             logcD.name = name
  //           }
  //           if (areaUuid != '') {
  //             logcD.areaUuid = areaUuid
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  processFirmwareUpgradeComplete(version, uuid) {
    console.log(version, uuid);
    let that = this;
    if (that.entities && that.entities.has(uuid)) {
      let entity = that.entities.get(uuid);
      if (entity.getEntityType() == Const.EntityType.PHYSIC_DEVICE) {
        entity.setVersion(version);
      }
    }
  }

  processDeviceKeyPressed(uuid, rssi) {
    let that = this;
    if (that.entities && that.entities.has(uuid)) {
      let entity = that.entities.get(uuid);
      if (rssi) {
        entity.rssi = rssi;
      }
    }
  }
};
