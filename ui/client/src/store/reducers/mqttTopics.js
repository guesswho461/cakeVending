import companyInfo from "../../companyInfo";

const COIN_VALUE_DEC = "coin/value/dec";
const SET_PROCESSING_DLG_OPEN = "set/processingDlg/open";

const mqtt = require("mqtt");
const client = mqtt.connect(companyInfo.brokerURL);

const initState = {
  /* --------------------------------------------------------------- */
  robotStatusAlarm: "normal",
  robotStatusVol: "0",
  robotStatusJogX: "0",
  robotStatusJogY: "0",
  robotStatusJogZ: "0",
  robotStatusJogFork: "0",
  robotStatusJogVel: "0",
  robotStatusStop: "false",
  robotStatusHomeX: "false",
  robotStatusHomeY: "false",
  robotStatusHomeZ: "false",
  robotStatusHomeFork: "false",
  robotStatusParXStepPerMM: "0",
  robotStatusParYStepPerMM: "0",
  robotStatusParZStepPerMM: "0",
  robotStatusMode: "manual",
  /* --------------------------------------------------------------- */
  bucketStatusAlarm: "normal",
  bucketStatusVol: "0",
  bucketStatusMode: "mqtt",
  bucketStatusJogVol: "0",
  bucketStatusJogVel: "0",
  bucketStatusStop: "false",
  bucketStatusParJogCalibration: "0",
  bucketStatusParJogMicroStepPerStep: "0",
  bucketStatusParVolCalibrationA: "0",
  bucketStatusParVolCalibrationB: "0",
  /* --------------------------------------------------------------- */
  ovenStatusAlarm: "normal",
  ovenStatusTempature: "0",
  ovenStatusFlip: false,
  ovenStatusOpen: false,
  ovenStatusStop: "false",
  ovenStatusHomeFlip: "false",
  ovenStatusHomeOpen: "false",
  ovenStatusParFlipGearRatio: "0",
  ovenStatusParOpenGearRatio: "0",
  /* --------------------------------------------------------------- */
  latchStatusAlarm: "normal",
  latchStatusBagCnt: "0",
  latchStatusOpenDoor: false,
  latchStatusVibration: false,
  latchStatusOpenGate: false,
  latchStatusOpenFan: false,
  latchStatusRArmPos: "0",
  latchStatusRArmHome: "false",
  latchStatusRArmLen: "0",
  latchStatusRArmSuck: false,
  latchStatusLArmPos: "0",
  latchStatusLArmHome: "false",
  latchStatusLArmLen: "0",
  latchStatusLArmSuck: false,
  latchStatusParRArmPitch: "0",
  latchStatusParLArmPitch: "0",
  /* --------------------------------------------------------------- */
  coinValue: 0,
  processingDlgOpen: false,
  recipeDone: false
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    default:
      break;
    case companyInfo.topics.robot.cmd.jog.x:
    case companyInfo.topics.robot.cmd.jog.y:
    case companyInfo.topics.robot.cmd.jog.z:
    case companyInfo.topics.robot.cmd.jog.fork:
      client.publish(
        companyInfo.topics.robot.cmd.jog.vel,
        action.vel.toString()
      );
      client.publish(action.type, action.len.toString());
      break;
    case companyInfo.topics.bucket.cmd.jog.vol:
      client.publish(
        companyInfo.topics.bucket.cmd.jog.vel,
        action.vel.toString()
      );
      client.publish(action.type, action.vol.toString());
      break;
    case companyInfo.topics.robot.cmd.home.x:
    case companyInfo.topics.robot.cmd.home.y:
    case companyInfo.topics.robot.cmd.home.z:
    case companyInfo.topics.robot.cmd.home.fork:
    case companyInfo.topics.robot.cmd.stop:
    case companyInfo.topics.robot.cmd.par.x.stepPerMM:
    case companyInfo.topics.robot.cmd.par.y.stepPerMM:
    case companyInfo.topics.robot.cmd.par.z.stepPerMM:
    case companyInfo.topics.bucket.cmd.stop:
    case companyInfo.topics.bucket.cmd.par.jog.calibration:
    case companyInfo.topics.bucket.cmd.par.jog.microStepPerStep:
    case companyInfo.topics.bucket.cmd.par.vol.calibrationA:
    case companyInfo.topics.bucket.cmd.par.vol.calibrationB:
    case companyInfo.topics.oven.cmd.tempature:
    case companyInfo.topics.oven.cmd.flip:
    case companyInfo.topics.oven.cmd.open:
    case companyInfo.topics.oven.cmd.stop:
    case companyInfo.topics.oven.cmd.home.flip:
    case companyInfo.topics.oven.cmd.home.open:
    case companyInfo.topics.oven.cmd.par.flip.gearRatio:
    case companyInfo.topics.oven.cmd.par.open.gearRatio:
    case companyInfo.topics.latch.cmd.openDoor:
    case companyInfo.topics.latch.cmd.vibration:
    case companyInfo.topics.latch.cmd.openGate:
    case companyInfo.topics.latch.cmd.openFan:
    case companyInfo.topics.latch.cmd.rArm.pos:
    case companyInfo.topics.latch.cmd.rArm.home:
    case companyInfo.topics.latch.cmd.rArm.len:
    case companyInfo.topics.latch.cmd.rArm.suck:
    case companyInfo.topics.latch.cmd.lArm.pos:
    case companyInfo.topics.latch.cmd.lArm.home:
    case companyInfo.topics.latch.cmd.lArm.len:
    case companyInfo.topics.latch.cmd.lArm.suck:
    case companyInfo.topics.latch.cmd.par.rArm.pitch:
    case companyInfo.topics.latch.cmd.par.lArm.pitch:
      client.publish(action.type, action.payload.toString());
      break;
    /* --------------------------------------------------------------- */
    case companyInfo.topics.robot.status.mode:
      return {
        ...state,
        robotStatusMode: action.payload
      };
    case companyInfo.topics.robot.status.alarm:
      return {
        ...state,
        robotStatusAlarm: action.payload
      };
    case companyInfo.topics.robot.status.vol:
      return {
        ...state,
        robotStatusVol: action.payload
      };
    case companyInfo.topics.robot.status.home.x:
      return {
        ...state,
        robotStatusHomeX: action.payload
      };
    case companyInfo.topics.robot.status.home.y:
      return {
        ...state,
        robotStatusHomeY: action.payload
      };
    case companyInfo.topics.robot.status.home.z:
      return {
        ...state,
        robotStatusHomeZ: action.payload
      };
    case companyInfo.topics.robot.status.home.fork:
      return {
        ...state,
        robotStatusHomeFork: action.payload
      };
    case companyInfo.topics.robot.status.stop:
      return {
        ...state,
        robotStatusStop: action.payload
      };
    case companyInfo.topics.robot.status.jog.x:
      return {
        ...state,
        robotStatusJogX: action.payload
      };
    case companyInfo.topics.robot.status.jog.y:
      return {
        ...state,
        robotStatusJogY: action.payload
      };
    case companyInfo.topics.robot.status.jog.z:
      return {
        ...state,
        robotStatusJogZ: action.payload
      };
    case companyInfo.topics.robot.status.jog.fork:
      return {
        ...state,
        robotStatusJogFork: action.payload
      };
    case companyInfo.topics.robot.status.jog.vel:
      return {
        ...state,
        robotStatusJogVel: action.payload
      };
    case companyInfo.topics.robot.status.par.x.stepPerMM:
      return {
        ...state,
        robotStatusParXStepPerMM: action.payload
      };
    case companyInfo.topics.robot.status.par.y.stepPerMM:
      return {
        ...state,
        robotStatusParYStepPerMM: action.payload
      };
    case companyInfo.topics.robot.status.par.z.stepPerMM:
      return {
        ...state,
        robotStatusParZStepPerMM: action.payload
      };
    case companyInfo.topics.bucket.status.alarm:
      return {
        ...state,
        bucketStatusAlarm: action.payload
      };
    case companyInfo.topics.bucket.status.vol:
      return {
        ...state,
        bucketStatusVol: action.payload
      };
    case companyInfo.topics.bucket.status.mode:
      return {
        ...state,
        bucketStatusMode: action.payload
      };
    case companyInfo.topics.bucket.status.stop:
      return {
        ...state,
        bucketStatusStop: action.payload
      };
    case companyInfo.topics.bucket.status.jog.vol:
      return {
        ...state,
        bucketStatusJogVol: action.payload
      };
    case companyInfo.topics.bucket.status.jog.vel:
      return {
        ...state,
        bucketStatusJogVel: action.payload
      };
    case companyInfo.topics.bucket.status.par.jog.calibration:
      return {
        ...state,
        bucketStatusParJogCalibration: action.payload
      };
    case companyInfo.topics.bucket.status.par.jog.microStepPerStep:
      return {
        ...state,
        bucketStatusParJogMicroStepPerStep: action.payload
      };
    case companyInfo.topics.bucket.status.par.vol.calibrationA:
      return {
        ...state,
        bucketStatusParVolCalibrationA: action.payload
      };
    case companyInfo.topics.bucket.status.par.vol.calibrationB:
      return {
        ...state,
        bucketStatusParVolCalibrationB: action.payload
      };
    case companyInfo.topics.oven.status.alarm:
      return {
        ...state,
        ovenStatusAlarm: action.payload
      };
    case companyInfo.topics.oven.status.tempature:
      return {
        ...state,
        ovenStatusTempature: action.payload
      };
    case companyInfo.topics.oven.status.flip:
      return {
        ...state,
        ovenStatusFlip: action.payload === "true" ? true : false
      };
    case companyInfo.topics.oven.status.open:
      return {
        ...state,
        ovenStatusOpen: action.payload === "true" ? true : false
      };
    case companyInfo.topics.oven.status.stop:
      return {
        ...state,
        ovenStatusStop: action.payload
      };
    case companyInfo.topics.oven.status.home.flip:
      return {
        ...state,
        ovenStatusHomeFlip: action.payload
      };
    case companyInfo.topics.oven.status.home.open:
      return {
        ...state,
        ovenStatusHomeOpen: action.payload
      };
    case companyInfo.topics.oven.status.par.flip.gearRatio:
      return {
        ...state,
        ovenStatusParFlipGearRatio: action.payload
      };
    case companyInfo.topics.oven.status.par.open.gearRatio:
      return {
        ...state,
        ovenStatusParOpenGearRatio: action.payload
      };
    case companyInfo.topics.latch.status.openDoor:
      return {
        ...state,
        latchStatusOpenDoor: action.payload === "true" ? true : false
      };
    case companyInfo.topics.latch.status.vibration:
      return {
        ...state,
        latchStatusVibration: action.payload === "true" ? true : false
      };
    case companyInfo.topics.latch.status.openGate:
      return {
        ...state,
        latchStatusOpenGate: action.payload === "true" ? true : false
      };
    case companyInfo.topics.latch.status.openFan:
      return {
        ...state,
        latchStatusOpenFan: action.payload === "true" ? true : false
      };
    case companyInfo.topics.latch.status.rArm.pos:
      return {
        ...state,
        latchStatusRArmPos: action.payload
      };
    case companyInfo.topics.latch.status.rArm.home:
      return {
        ...state,
        latchStatusRArmHome: action.payload
      };
    case companyInfo.topics.latch.status.rArm.len:
      return {
        ...state,
        latchStatusRArmLen: action.payload
      };
    case companyInfo.topics.latch.status.rArm.suck:
      return {
        ...state,
        latchStatusRArmSuck: action.payload === "true" ? true : false
      };
    case companyInfo.topics.latch.status.lArm.pos:
      return {
        ...state,
        latchStatusLArmPos: action.payload
      };
    case companyInfo.topics.latch.status.lArm.home:
      return {
        ...state,
        latchStatusLArmHome: action.payload
      };
    case companyInfo.topics.latch.status.lArm.len:
      return {
        ...state,
        latchStatusLArmLen: action.payload
      };
    case companyInfo.topics.latch.status.lArm.suck:
      return {
        ...state,
        latchStatusLArmSuck: action.payload === "true" ? true : false
      };
    case companyInfo.topics.latch.status.par.rArm.pitch:
      return {
        ...state,
        latchStatusParRArmPitch: action.payload
      };
    case companyInfo.topics.latch.status.par.lArm.pitch:
      return {
        ...state,
        latchStatusParLArmPitch: action.payload
      };
    case companyInfo.topics.coin.status.inc:
      return {
        ...state,
        coinValue: state.coinValue + 10
      };
    case COIN_VALUE_DEC:
      return {
        ...state,
        coinValue: state.coinValue - action.payload
      };
    case SET_PROCESSING_DLG_OPEN:
      return {
        ...state,
        processingDlgOpen: true
      };
    case companyInfo.topics.recipe.done:
      return {
        ...state,
        recipeDone: true
      };
    case companyInfo.topics.recipe.takeIt:
      return {
        ...state,
        processingDlgOpen: false,
        recipeDone: true
      };
  }
  return state;
}

export function handleSubscribeTopics(root, topic, msg) {
  var actionType = "";
  if (typeof topic === "string") {
    var topicArr = topic.split("/");
    if (topicArr[0] === root) {
      actionType = topic;
    }
  }
  return {
    type: actionType,
    payload: msg.toString()
  };
}

export function robotCmdJog(dir, len, vel) {
  var actionType = "";
  switch (dir) {
    default:
      break;
    case "x":
      actionType = companyInfo.topics.robot.cmd.jog.x;
      break;
    case "y":
      actionType = companyInfo.topics.robot.cmd.jog.y;
      break;
    case "z":
      actionType = companyInfo.topics.robot.cmd.jog.z;
      break;
    case "fork":
      actionType = companyInfo.topics.robot.cmd.jog.fork;
      break;
  }
  return {
    type: actionType,
    len: len,
    vel: vel
  };
}

export function bucketCmdJogVol(vol, vel) {
  return {
    type: companyInfo.topics.bucket.cmd.jog.vol,
    vol: vol,
    vel: vel
  };
}

export function publishMsgToTopic(topic, msg) {
  return {
    type: topic,
    payload: msg
  };
}

export function coinValueDec(data) {
  return {
    type: COIN_VALUE_DEC,
    payload: data
  };
}

export function setProcessingDlgOpen() {
  return {
    type: SET_PROCESSING_DLG_OPEN
  };
}
