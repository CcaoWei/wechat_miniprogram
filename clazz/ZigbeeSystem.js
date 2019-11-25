/** @format */

import Const from '../data/Const.js';

module.exports = class ZigbeeSystem {
  constructor(uuid, available, channel, version) {
    var that = this;
    that.uuid = uuid;
    that.available = available;
    that.channel = channel;
    that.version = version;
  }

  getEntityType() {
    return Const.EntityType.ZIGBEE_SYSTEM;
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
