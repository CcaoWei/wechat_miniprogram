/** @format */

import Const from '../data/Const.js';

module.exports = class Area {
  constructor(uuid, name) {
    var that = this;
    that.uuid = uuid;
    if(name == ''){
      that.name = that.getRoomName(uuid)
    }else{
      that.name = name;
    }
  }
  getEntityType() {
    return Const.EntityType.AREA;
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
  getRoomName(uuid){
    if (uuid == "area-0000"){
        return '默认房间'
    } else if (uuid == "area-0001") {
      return '客厅'
    } else if (uuid == "area-0002") {
      return '主卧'
    } else if (uuid == "area-0003") {
      return '次卧'
    } else if (uuid == "area-0004") {
      return '餐厅'
    } else if (uuid == "area-0005") {
      return '厨房'
    } else if (uuid == "area-0006") {
      return '阳台'
    } else if (uuid == "area-0007") {
      return '书房'
    } else if (uuid == "area-0008") {
      return '玄关'
    } else if (uuid == "area-0009") {
      return '洗手间'
    } 
  }
};
