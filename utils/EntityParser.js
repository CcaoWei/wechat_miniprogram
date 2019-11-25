/** @format */

var HomeCenter = require('../clazz/HomeCenter.js');
var PhysicDevice = require('../clazz/PhysicDevice.js');
var LogicDevice = require('../clazz/LogicDevice.js');
var Attribute = require('../clazz/Attribute.js');
var Scene = require('../clazz/Scene.js');
var Action = require('../clazz/Action.js');
var Binding = require('../clazz/Binding.js');
var Area = require('../clazz/Area.js');
var Firmware = require('../clazz/Firmware.js');
var ZigbeeSystem = require('../clazz/ZigbeeSystem.js');
function parseHomeCenter(entity) {
  let uuid = entity.UUID;
  let name = entity.Name;
  let version = entity.version;
  let isNew = entity.New;
  let entityDevice = entity.EntityDevice;
  let online = entityDevice.Online;
  let model = entityDevice.Model;

  let homeCenter = new HomeCenter(uuid, name, version, online, model, isNew);
  return homeCenter;
}

function parsePhysicDevice(entity) {
  let uuid = entity.UUID;
  let version;
  for (var attrVersion of entity.Attributes) {
    if (attrVersion.AttrID == 9) {
      version = attrVersion.AttrValue;
    }
  }
  let entityDevice = entity.EntityDevice;
  let Available = entityDevice.Available;
  let isNew = entityDevice.IsNew;
  let model = entityDevice.Model;
  let areaUuid = entity.AreaUUID;
  let name = entity.Name;
  let physicDevice = new PhysicDevice(uuid, Available, isNew, version, model, areaUuid, name);
  var logicDevices = [];
  for (var i = 0; i < entityDevice.LogicDevices.length; i++) {
    let logicDevice = parseLogicDevice(entityDevice.LogicDevices[i]);
    logicDevice.parentUuid = uuid;
    logicDevice.Available = Available;
    logicDevices.push(logicDevice);
  }
  physicDevice.logicDevice = logicDevices;
  physicDevice.attributes = parseAttibute(entity.Attributes);
  return physicDevice;
}

function parseLogicDevice(entity) {
  let uuid = entity.UUID;
  let name = entity.Name;
  let profile = entity.Profile;
  let areaUuid = entity.AreaUUID;
  var logicDevice = new LogicDevice(uuid, name, profile, areaUuid);
  logicDevice.attributes = parseAttibute(entity.Attributes);
  return logicDevice;
}
//参数为包含Attibutes的数组
function parseAttibute(attrs) {
  var attributes = [];
  for (var i = 0; i < attrs.length; i++) {
    let attribute = attrs[i];
    let key = attribute.AttrID;
    let value = attribute.AttrValue;
    attributes.push(new Attribute(key, value));
  }
  return attributes;
}

function parseScene(entity) {
  let uuid = entity.UUID;
  let name = entity.Name;
  let scene = new Scene(uuid, name);
  scene.areaUuid = entity.AreaUUID;
  scene.baseType = entity.BaseType;
  scene.deleteState = entity.DeleteState;
  scene.actions = parseActions(entity.EntityScene.Actions);
  scene.attributes = parseAttibute(entity.Attributes);
  return scene;
}
// 区域
function parseArea(entity) {
  let uuid = entity.UUID;
  let name = entity.Name;
  let area = new Area(uuid, name);
  area.attibutes = parseAttibute(entity.Attributes);
  return area;
}
//升级包
function parseFirmware(entity) {
  // uuid, ImageModel, SystemUUID, Version
  let uuid = entity.UUID;
  let ImageModel = entity.EntityFirmware.ImageModel;
  let SystemUUID = entity.EntityFirmware.SystemUUID;
  let Version = entity.EntityFirmware.Version;
  let firmware = new Firmware(uuid, ImageModel, SystemUUID, Version);
  firmware.attributes = parseAttibute(entity.Attributes);
  return firmware;
}
//zigbee
function parseZigbeeSystem(entity) {
  let uuid = entity.UUID;
  let available = entity.EntityZigbeeSystem.Available;
  let channel = entity.EntityZigbeeSystem.Channel;
  let version = entity.EntityZigbeeSystem.Version;
  let zigbeeSystem = new ZigbeeSystem(uuid, available, channel, version);
  zigbeeSystem.attributes = parseAttibute(entity.Attributes);
  return zigbeeSystem;
}

function parseBinding(entity) {
  let uuid = entity.UUID;
  let triggerAddress = entity.EntityBinding.TriggerAddress;
  let types = entity.EntityBinding.Type;
  let parameter = entity.EntityBinding.Parameter;
  let enabled = entity.EntityBinding.Enabled;
  let binding = new Binding(uuid, triggerAddress, types, parameter, enabled);
  binding.name = entity.Name;
  binding.areaUuid = entity.AreaUUID;
  binding.deleteState = entity.DeleteState;
  binding.baseType = entity.BaseType;
  binding.actions = parseActions(entity.EntityBinding.Actions);
  binding.attributes = parseAttibute(entity.Attributes);
  return binding;
}

//参数为Actions数组
function parseActions(actions) {
  let tempActions = [];
  for (var i = 0; i < actions.length; i++) {
    let uuid = actions[i].UUID;
    let key = actions[i].AttrID;
    let value = actions[i].AttrValue;
    let action = new Action(uuid, key, value);
    tempActions.push(action);
  }
  return tempActions;
}

module.exports = {
  parseHomeCenter: parseHomeCenter,
  parsePhysicDevice: parsePhysicDevice,
  parseBinding: parseBinding,
  parseScene: parseScene,
  parseFirmware: parseFirmware,
  parseZigbeeSystem: parseZigbeeSystem,
  parseArea: parseArea
};
