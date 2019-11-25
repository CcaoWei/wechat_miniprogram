/** @format */

module.exports = class newAction {
  constructor(uuid, key, value) {
    var that = this;
    that.UUID = uuid;
    that.AttrID = key;
    that.AttrValue = value;
  }
};
