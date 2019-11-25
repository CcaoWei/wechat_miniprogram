/** @format */

import Const from '../data/Const.js';

module.exports = class Firmware {
  constructor(uuid, ImageModel, SystemUUID, Version) {
    var that = this;
    that.uuid = uuid;
    that.ImageModel = ImageModel;
    that.SystemUUID = SystemUUID;
    that.Version = Version;
  }

  getEntityType() {
    return Const.EntityType.FIRMWARE;
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
};
