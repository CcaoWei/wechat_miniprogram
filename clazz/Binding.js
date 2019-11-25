/** @format */

import Const from '../data/Const.js';

module.exports = class Binding {
  constructor(uuid, triggerAddress, types, parameter, enabled) {
    var that = this;
    that.uuid = uuid;
    that.triggerAddress = triggerAddress;
    that.types = types;
    that.parameter = parameter;
    that.enabled = enabled;
  }

  getEntityType() {
    return Const.EntityType.BINDING;
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

  getCopy() {
    var that = this;
    let binding = new Binding(that.uuid, that.triggerAddress, that.types, that.parameter, that.enabled);

    binding.name = that.name;
    binding.areaUuid = that.areaUuid;
    binding.deleteState = that.deleteState;
    binding.baseType = that.baseType;

    binding.attributes = that.attributes;

    binding.actions = that.actions;

    return binding;
  }
};
