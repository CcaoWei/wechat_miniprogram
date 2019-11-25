/** @format */

module.exports = class Action {
  constructor(uuid, key, value) {
    var that = this;
    that.uuid = uuid;
    that.key = key;
    that.value = value;
  }
};
