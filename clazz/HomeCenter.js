/** @format */

import Const from '../data/Const.js';

module.exports = class HomeCenter {
  constructor(uuid, name, version, online, model, types, isNew) {
    console.log(online);
    var that = this;
    that.uuid = uuid;
    that.name = name;
    that.version = version;
    if (online == undefined && types == 3) {
      online = false;
    }
    that.online = online;
    that.model = model;
    that.types = types;
    that.isNew = isNew;
    console.log(that);
  }

  getEntityType() {
    return Const.EntityType.HOME_CENTER;
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

  setName(name) {
    var that = this;
    that.name = name;
  }
};
