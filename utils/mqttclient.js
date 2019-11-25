/** @format */

var gCachedRequests = null;

function sendRequest(arg) {
  console.log(arg);
  console.log(arg.client.hashcode);
  if (!gCachedRequests) {
    gCachedRequests = {};
  }
  if (arg.success || arg.error) {
    gCachedRequests[arg.req.MessageID] = {
      request: arg.req,
      success: arg.success,
      error: arg.error
    };
  }
  arg.client.publish(arg.topic, JSON.stringify(arg.req));
}

function onMqttMsg(msg) {
  if (gCachedRequests) {
    var correlationID = msg['CorrelationID'];
    if (correlationID) {
      var r = gCachedRequests[correlationID];
      if (r) {
        if (msg.Error && r.error) {
          r.error(r.request, msg);
        } else if (r.success) {
          r.success(r.request, msg);
        }
        delete gCachedRequests[correlationID];
      }
    }
  }
  return true;
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function buildGetEntityRequest(sender, type) {
  return {
    MessageID: guid(),
    Sender: sender,
    GetEntity: {
      Type: type,
      Commit: 0
    }
  };
}

function buildOnOffRequest(sender, uuid, command) {
  return {
    MessageID: guid(),
    Sender: sender,
    OnOff: {
      UUID: uuid,
      Command: command
    }
  };
}

function buildSetAlertLevelRequest(sender, uuid, level) {
  return {
    MessageID: guid(),
    Sender: sender,
    SetAlertLevel: {
      UUID: uuid,
      Level: level
    }
  };
}

function buildSetSceneOnOffRequest(sender, uuid, command) {
  return {
    MessageID: guid(),
    Sender: sender,
    SetSceneOnOff: {
      UUID: uuid,
      Command: command
    }
  };
}

function buildConfigEntityInfoRequest(sender, uuid, areaUUID, name) {
  return {
    MessageID: guid(),
    Sender: sender,
    ConfigEntityInfo: {
      UUID: uuid,
      AreaUUID: areaUUID,
      Name: name
    }
  };
}

function buildDeleteEntityRequest(sender, uuid) {
  return {
    MessageID: guid(),
    Sender: sender,
    DeleteEntity: {
      UUID: uuid
    }
  };
}

function buildSetBindingEnableRequest(sender, uuid, enabled) {
  return {
    MessageID: guid(),
    Sender: sender,
    SetBindingEnable: {
      UUID: uuid,
      Enabled: enabled
    }
  };
}

//app.getClient().publish(boxname, '{"MessageID":"' + app.guid() + '","Sender":"' + app.globalData.username_ + '","CreateBinding":{"Binding":' + '{"BaseType":2,"UUID":"","Name":"","AreaUUID":"area-0000","New":true,"DeleteState":0,"Attributes":[{"AttrID":0,"AttrValue":0},{"AttrID":15,"AttrValue":0}],"EntityBinding":' + '{"Type":' + 1 + ',"Enabled":' + true + ',"TriggerAddress":"' + that.data.TriggerAddress + '","Actions":' + strSelect + ',"Parameter":' + 1 + '}}}}')
function buildCreateBindingRequest(sender, binding, actions) {
  return {
    MessageID: guid(),
    Sender: sender,
    CreateBinding: {
      Binding: {
        BaseType: 6,
        UUID: '',
        Name: '',
        AreaUUID: 'area-0000',
        New: true,
        DeleteState: 0,
        EntityBinding: {
          Type: binding.types,
          Enabled: binding.enabled,
          TriggerAddress: binding.triggerAddress,
          Actions: actions,
          Parameter: binding.parameter
        }
      }
    }
  };
}

// 场景添加
function buildCreateSceneRequest(sender, sceneName, actions) {
  return {
    MessageID: guid(),
    Sender: sender,
    CreateScene: {
      Scene: {
        BaseType: 6,
        UUID: '',
        Name: sceneName,
        AreaUUID: 'area-0000',
        New: true,
        DeleteState: 0,
        EntityScene: {
          Actions: actions
        }
      }
    }
  };
}

// 场景删除
function buildDeleteSceneRequest(sender, uuid) {
  return {
    MessageID: guid(),
    Sender: sender,
    DeleteScene: {
      UUID: uuid
    }
  };
}
function buildDeleteAreaRequest(sender, uuid) {
  return {
    MessageID: guid(),
    Sender: sender,
    DeleteArea: {
      UUID: uuid
    }
  };
}
function buildCreateAreaRequest(sender, name) {
  return {
    MessageID: guid(),
    Sender: sender,
    CreateArea: {
      Name: name
    }
  };
}
//app.getClient().publish(boxname, '{"MessageID":"' + app.guid() + '","Sender":"' + app.globalData.username_ + '","UpdateBinding":{"Binding":' + arrs[0] + '{"Type":' + that.data.bindGather.EntityBinding.Type + ',"Enabled":' + that.data.bindGather.EntityBinding.Enabled + ',"TriggerAddress":"' + that.data.TriggerAddress + '","Actions":' + '[]' + ',"Parameter":' + that.data.lightTime + '}}}}')
function buildUpdateBindingRequest(sender, binding, actions) {
  return {
    MessageID: guid(),
    Sender: sender,
    UpdateBinding: {
      Binding: {
        UUID: binding.uuid,
        Name: binding.name,
        AreaUUID: binding.areaUuid,
        DeleteState: binding.deleteState,
        BaseType: binding.baseType,
        EntityBinding: {
          Type: binding.types,
          TriggerAddress: binding.triggerAddress,
          Enabled: binding.enabled,
          Actions: actions != undefined ? actions : [],
          Parameter: binding.parameter
        }
      }
    }
  };
}

//app.getClient().publish(boxname, '{"MessageID":"' + app.guid() + '","Sender":"' + app.globalData.username_ + '","UpdateScene":{"Scene":' + strScence2[0] + '"EntityScene":{"Actions":' + strSelect + '}}}}')
function buildUpdateSceneRequest(sender, scene, actions) {
  return {
    MessageID: guid(),
    Sender: sender,
    UpdateScene: {
      Scene: {
        UUID: scene.uuid,
        Name: scene.name,
        AreaUUID: scene.areaUuid,
        DeleteState: scene.deleteState,
        BaseType: scene.baseType,
        EntityScene: {
          Actions: actions != undefined ? actions : []
        }
      }
    }
  };
}

function buildSetPermitJoinRequest(sender, uuid, duration) {
  return {
    MessageID: guid(),
    Sender: sender,
    SetPermitJoin: {
      UUID: uuid,
      Duration: duration
    }
  };
}

function buildFirmwareUpgradeRequest(sender, firmwareUUID, uuid) {
  return {
    MessageID: guid(),
    Sender: sender,
    FirmwareUpgrade: {
      FirmwareUUID: firmwareUUID,
      Devices: uuid
    }
  };
}

function buildIdentifyRequest(sender, uuid, duration) {
  return {
    MessageID: guid(),
    Sender: sender,
    Identify: {
      UUID: uuid,
      Duration: duration
    }
  };
}

function buildControlWindowCoveringRequest(sender, uuid, percent) {
  return {
    MessageID: guid(),
    Sender: sender,
    ControlWindowCovering: {
      UUID: uuid,
      Percent: percent
    }
  };
}

function buildGetTimeRequest(sender, uuid) {
  return {
    MessageID: guid(),
    Sender: sender,
    GetTime: {
      UUID: uuid
    }
  };
}

function buildSetTimeRequest(sender, time, timezone) {
  return {
    MessageID: guid(),
    Sender: sender,
    SetTime: {
      Time: time,
      TimeZone: timezone
    }
  };
}

// function buildCheckNewVersionRequest(sender) {
//   return {
//     MessageID: guid(),
//     Sender: sender,
//     CheckNewVersion: {}
//   }
// }
function buildCheckNewVersionRequest(sender) {
  return {
    MessageID: guid(),
    Sender: sender,
    CheckNewVersion: {}
  };
}
function buildGetUpgradePolicyRequest(sender) {
  return {
    MessageID: guid(),
    Sender: sender,
    GetUpgradePolicy: {}
  };
}
function buildSetUpgradePolicyRequest(sender, channel, interval) {
  return {
    MessageID: guid(),
    Sender: sender,
    SetUpgradePolicy: {
      Channel: channel,
      Interval: interval
    }
  };
}
function buildWriteAttributeRequest(sender, uuid, attrID, value) {
  console.log(sender, uuid, attrID, value);
  return {
    MessageID: guid(),
    Sender: sender,
    WriteAttribute: {
      UUID: uuid,
      AttrID: attrID,
      Value: value
    }
  };
}
function buildIdentifyDeviceRequest(sender, uuid, duration) {
  return {
    MessageID: guid(),
    Sender: sender,
    IdentifyDevice: {
      UUID: uuid,
      Duration: duration
    }
  };
}

module.exports = {
  sendRequest: sendRequest,
  onMqttMsg: onMqttMsg,
  buildGetEntityRequest: buildGetEntityRequest,
  buildOnOffRequest: buildOnOffRequest,
  buildSetAlertLevelRequest: buildSetAlertLevelRequest,
  buildSetSceneOnOffRequest: buildSetSceneOnOffRequest,
  buildConfigEntityInfoRequest: buildConfigEntityInfoRequest,
  buildDeleteEntityRequest: buildDeleteEntityRequest,
  buildSetBindingEnableRequest: buildSetBindingEnableRequest,
  buildCreateBindingRequest: buildCreateBindingRequest,
  buildUpdateBindingRequest: buildUpdateBindingRequest,
  buildUpdateSceneRequest: buildUpdateSceneRequest,
  buildSetPermitJoinRequest: buildSetPermitJoinRequest,
  buildFirmwareUpgradeRequest: buildFirmwareUpgradeRequest,
  buildIdentifyRequest: buildIdentifyRequest,
  buildControlWindowCoveringRequest: buildControlWindowCoveringRequest,
  buildGetTimeRequest: buildGetTimeRequest,
  buildSetTimeRequest: buildSetTimeRequest,
  buildGetUpgradePolicyRequest: buildGetUpgradePolicyRequest,
  buildSetUpgradePolicyRequest: buildSetUpgradePolicyRequest,
  buildWriteAttributeRequest: buildWriteAttributeRequest,
  buildIdentifyDeviceRequest: buildIdentifyDeviceRequest,
  buildCheckNewVersionRequest: buildCheckNewVersionRequest,
  buildCreateSceneRequest: buildCreateSceneRequest,
  buildDeleteSceneRequest: buildDeleteSceneRequest,
  buildDeleteAreaRequest: buildDeleteAreaRequest,
  buildCreateAreaRequest: buildCreateAreaRequest
};
