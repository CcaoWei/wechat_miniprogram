/** @format */

//表示设备类型
const EntityType = {
  PHYSIC_DEVICE: 0,
  SCENE: 1,
  AREA: 2,
  BINDING: 3,
  FIRMWARE: 4,
  ZIGBEE_SYSTEM: 5,
  HOME_CENTER: 6,
  LOGIC_DEVICE: 7
};

//表示家庭中心的关联状态
const AssociationState = {
  NONE: 0,
  REQUESTED: 1,
  SHARED: 2,
  ASSOCIATED: 3
};

//表示DeviceAssociation中ActionType
const ActionType = {
  SHARE: 0,
  REQUEST: 1,
  ACCEPT: 2,
  DECLINE: 3,
  APPROVE: 4,
  REJECT: 5,
  CANCELSHARE: 6,
  CANCELREQUEST: 7,
  REMOVE: 8
};

//表示DeviceAssociation中的SubscriptionType
const SubscriptionType = {
  UNKNOWN: 0,
  FROM: 1,
  TO: 2,
  BOTH: 3
};

//表示AttrKey
const AttrKey = {
  ON_OFF_STATUS: 0,
  TOTAL_POWER: 1,
  ACTIVE_POWER: 2,
  INSERT_EXTRACT_STATUS: 3,
  OCCUPANCY: 4,
  LUMINANCE: 5,
  TEMPERATURE: 6,
  BINARY_INPUT_STATUS: 7,
  BATTERY_PERCENT: 8,
  FIRMWARE_VERSION: 9,
  PERMIT_JOIN: 10,
  WINDOW_COVERING_DIRECTION: 11,
  WINDOW_TARGET_LIFT_PERCENT: 12, //去掉啦
  WINDOW_CURRENT_LIFT_PERCENT: 13,
  SUPPORT_OTA: 14,
  ALERT_LEVEL: 15,
  WINDOW_COVERING_MOTOR_STATUS: 16,
  WINDOW_COVERING_MOTOR_TRIP_CONFUGURED: 17,
  WINDOW_COVERING_MOTOR_USER_TYPE: 18,
  Window_Covering_Motor_Trip_Adjusting: 19,
  Entity_IsNew: 20,
  Device_Joined_Time: 21,
  Device_Connected_Time: 22,
  Occupancy_Left: 23,
  Occupancy_Right: 24,
  Cfg_Indicator_LED: 25,
  Cfg_Disable_Relay: 26,
  Cfg_Button_Binding_Type: 27,
  Cfg_LED_Illum_Threshold: 28,
  Firmware_Upgrading_Version: 29,
  Firmware_Upgrading_Percent: 30,
  Enable_Keep_OnOff_Status: 31,
  Firmware_Recommand_Version: 32,
  Last_Knob_Angle: 33,
  Last_Knob_Used_Ms: 34,
  Auto_Enabled: 35,
  Auto_Render_Type: 36,
  Autoset_ID: 37,
  CFG_SW_Pure_Input: 38,
  CFG_SW_Input_Mode: 39,
  CFG_SW_Polarity: 40,
  CFG_Button_LED_Status: 41,
  CFG_Auto_Version: 42,
  CFG_LC_Target_Level: 43,
  CFG_LC_Current_Level: 44,
  Disabled_Relay_Status: 45,
  Num_Of_Timeout_Controls: 46,
  ZHH_Is_Online: 47,
  ZHH_Is_Running: 48,
  AC_Target_Temperature: 49,
  AC_Current_Temperature: 50,
  AC_Fan_Speed: 51,
  AC_Work_Mode: 52,
  ZHH_Error_Code: 53,
  CFG_Mutexed_Index: 54,
  CFG_Mutexed_DelayMS: 55,
  CFG_Button_LED_Polarity: 56,
  CFG_Loop_Has_Relay: 57,
  CFG_Self_Binding_ID: 58,
  AutoSet_Class: 59,
  Window_Covering_Motor_Type: 60,
  Color_Temperature: 61,
  Color_Current_X: 62,
  Color_Current_Y: 63,
  Color_CIE_XY: 64,
};

const Profile = {
  PIR_PANEL: 0,
  SMART_PLUG: 1,
  ON_OFF_LIGHT: 2,
  DOOR_CONTACT: 3,
  ON_OFF_SWITCH: 4,
  WINDOW_COVERING: 5,
  YAN_BUTTON: 6,//有此属性，则为可编程开关，否则为固定控灯开关
  SMART_DIAL: 7,
  COLOR_LIGHT: 8,
  HA_ZHH_GATEWAY: 9,
  HA_ZHH_UNIT_MACHINE: 10,
  HA_DOOR_LOCK: 11,
  EXTENDED_COLOR_LIGHT: 12,
  COLOR_TEMPERATURE_LIGHT: 13
};

const BindingType = {
  KEY_PRESS: 1, //无线开关
  OPEN_CLOSE: 2, //门磁
  PIR_PANEL: 3, //智能灯控
  ROTARY: 4, //旋钮控窗
  USWALLSWITCH:5
};

const DeviceModel = {
  GATEWAY: 'TERNCY-GW01',
  LIGHT_SOCKET: 'TERNCY-LS01',
  SMART_PLUG: 'TERNCY-SP01',
  WIRELESS_SWITCH: 'TERNCY-PP01',
  DOOR_SENSOR: 'TERNCY-DC01',
  CURTAIN: 'TERNCY-CM01',
  WALL_SWITCH_S1: 'TERNCY-WS01-S1',
  WALL_SWITCH_S2: 'TERNCY-WS01-S2',
  WALL_SWITCH_S3: 'TERNCY-WS01-S3',//d单火
  WALL_SWITCH_S4: 'TERNCY-WS01-S4',
  WALL_SWITCH_D1: 'TERNCY-WS01-D1',//零火
  WALL_SWITCH_D2: 'TERNCY-WS01-D2',
  WALL_SWITCH_D3: 'TERNCY-WS01-D3',
  WALL_SWITCH_D4: 'TERNCY-WS01-D4',
  WALL_SWITCH_X1: "TERNCY-WS01-US-X1",
  SMART_DIAL:"TERNCY-SD01",
  SWITCH_MODULE:"TERNCY-SM01-D2",
  HA_ZHH_GATEWAY: "TERNCY-VG01",
  
};

const Luminance = {
  VERY_DARK: 30,
  LITTLE_DARK: 100,
  LIGHT: 300,
  VERY_LIGHT: 6000,
  VERY_VERY_LIGHT: 10000,
  UPPER_LIMIT: 10000
};
const SceneUuid = {
  SCENE_01: 'scene-000001',
  SCENE_02: 'scene-000002',
  SCENE_03: 'scene-000003',
  SCENE_04: 'scene-000004'
};

const SUPPORT_AUTOMATION = 0;

module.exports = {
  EntityType: EntityType,
  AssociationState: AssociationState,
  ActionType: ActionType,
  SubscriptionType: SubscriptionType,
  AttrKey: AttrKey,
  Profile: Profile,
  BindingType: BindingType,
  DeviceModel: DeviceModel,
  Luminance: Luminance,
  SceneUuid: SceneUuid,
  SUPPORT_AUTOMATION
};
