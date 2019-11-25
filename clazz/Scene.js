/** @format */

import Const from '../data/Const.js';

module.exports = class Scene {
  constructor(uuid, name) {
    var that = this;
    that.uuid = uuid;
    if (name == '') {
      that.name = that.getSceneName(uuid)
    } else {
      that.name = name;
    }
  }

  getEntityType() {
    return Const.EntityType.SCENE;
  }

  setAttribute(attr) {
    var that = this;
    console.log(attr);
    if (that.attributes) {
      for (let attribute of that.attributes) {
        if (attribute.key == attr.AttrID) {
          attribute.value = attr.AttrValue;
        }
      }
    }
  }

  isSameScene(desScene) {
    var that = this;
    if (that.uuid != desScene.uuid) {
      return false;
    }
    if (that.actions.length != desScene.actions.length) {
      return false;
    }
    for (let action of desScene.actions) {
      let existAction = that.getAction(action.uuid);
      if (existAction == undefined) {
        return false;
      }
      if (existAction.key != action.key || existAction.value != action.value) {
        return false;
      }
    }
    return true;
  }

  getAction(uuid) {
    var that = this;
    for (let action of that.actions) {
      if (action.uuid == uuid) {
        return action;
      }
    }
    return undefined;
  }

  getCopy() {
    var that = this;
    let scene = new Scene(this.uuid, this.name);

    scene.areaUuid = that.areaUuid;
    scene.deleteState = that.deleteState;
    scene.baseType = that.baseType;

    scene.attributes = that.attributes;

    scene.actions = that.actions;

    return scene;
  }

  setName(name) {
    var that = this;
    that.name = name;
  }
  getSceneName(uuid){
    if (uuid == "scene-000001"){
        return '回家'
    } else if(uuid == "scene-000002"){
        return '离家'
    } else if (uuid == "scene-000003") {
      return '起床'
    } else if (uuid == "scene-000004") {
      return '睡觉'
    }
  }
};
