//無料空跑測試用

const log4js = require("log4js");
log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/recipe.log",
      maxLogSize: 20000000, // 20 MB
      backups: 5,
      category: "normal",
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: { appenders: ["file", "out"], level: "trace" },
  },
});
const logger = log4js.getLogger("cake");

const mqtt = require("mqtt");
const delay = require("delay");
const waitUntil = require("async-wait-until");

const opt = {
  port: 1883,
  clientId: "recipeOriginal",
};

const waitRobotMotionDoneTimeout = 60000; //ms
const waitOvenTimeout = 60000; //ms
const waitBowloutTimeout = 60000; //ms
const waitTakeBowlTimeout = 3000000; //ms

let robotMotionDone = true;
let ovenFlipTrue = false;
let ovenFlipFalse = false;
let ovenOpenTrue = false;
let ovenOpenFalse = false;
let bucketStopTrue = false;

let latchArmStopTrue = false;
let latchArmStopFalse = false;
let latchCvtStopTrue = false;
let latchCvtStopFalse = false;
let latchSuckStopTrue = false;
let latchSuckStopFalse = false;
let latchBowlReadyTrue = false;
let latchBowlReadyFalse = false;
let latchGateOpenTrue = false;
let latchGateOpenFalse = false;
let latchFanOpenTrue = false;
let latchFanOpenFalse = false;
let cnt = 0;

let strBowlCnt = "0";
let strArmPos = "0";
let strCvtPos = "0";
let maxTimes = 1; ///總需求物件數量

let retry_waitBowlout = 0; ///物件未被取走次數累計
let retry_TakeBowl = 0; ///物件取得失敗次數累計
let cntTimes = 0; ///完成物件數

let latchTakeBowl_Start = false;

logger.trace(opt.clientId + " started");

const client = mqtt.connect("mqtt://localhost", opt);

client.on("connect", function () {
  logger.trace("connect to broker OK");
  client.subscribe("robot/status/stop");
  client.subscribe("oven/status/flip");
  client.subscribe("oven/status/open");
  client.subscribe("bucket/status/stop");
  client.subscribe("latch/status/arm/stop");
  client.subscribe("latch/status/cvt/stop");
  client.subscribe("latch/status/bowl/cnt");
  client.subscribe("latch/status/bowl/ready");
  client.subscribe("latch/status/arm/suck");
  client.subscribe("latch/status/arm/release");
  client.subscribe("latch/status/gate/open");
  client.subscribe("latch/status/fan/open");
  client.subscribe("latch/status/vibration");
  client.subscribe("latch/status/arm/pos");
  client.subscribe("latch/status/cvt/pos");
});

client.on("message", function (topic, msg) {
  //logger.trace('topic ' + topic + ' - ' + msg);
  if (topic === "robot/status/stop") {
    if (msg.toString() === "true") {
      robotMotionDone = true;
    } else {
      robotMotionDone = false;
    }
  } else if (topic === "oven/status/flip") {
    if (msg.toString() === "true") {
      ovenFlipTrue = true;
      ovenFlipFalse = false;
    } else {
      ovenFlipTrue = false;
      ovenFlipFalse = true;
    }
  } else if (topic === "oven/status/open") {
    if (msg.toString() === "true") {
      ovenOpenTrue = true;
      ovenOpenFalse = false;
    } else {
      ovenOpenTrue = false;
      ovenOpenFalse = true;
    }
  } else if (topic === "bucket/status/stop") {
    if (msg.toString() === "true") {
      bucketStopTrue = true;
      bucketStopFalse = false;
    } else {
      bucketStopTrue = false;
      bucketStopFalse = true;
    }
  } else if (topic === "latch/status/arm/stop") {
    if (msg.toString() === "true") {
      latchArmStopTrue = true;
      latchArmStopFalse = false;
    } else {
      latchArmStopTrue = false;
      latchArmStopFalse = true;
    }
  } else if (topic === "latch/status/cvt/stop") {
    if (msg.toString() === "true") {
      latchCvtStopTrue = true;
      latchCvtStopFalse = false;
    } else {
      latchCvtStopTrue = false;
      latchCvtStopFalse = true;
    }
  } else if (topic === "latch/status/arm/suck") {
    if (msg.toString() === "true") {
      latchSuckStopTrue = true;
      latchSuckStopFalse = false;
    } else {
      latchSuckStopTrue = false;
      latchSuckStopFalse = true;
    }
  } else if (topic === "latch/status/bowl/cnt") {
    strBowlCnt = msg.toString();
  } else if (topic === "latch/status/bowl/ready") {
    if (msg.toString() === "true") {
      latchBowlReadyTrue = true;
      latchBowlReadyFalse = false;
      //logger.trace('Ready:true');
    } else {
      latchBowlReadyTrue = false;
      latchBowlReadyFalse = true;
      //logger.trace('Ready:false');
    }
  } else if (topic === "latch/status/gate/open") {
    if (msg.toString() === "true") {
      latchGateOpenTrue = true;
      latchGateOpenFalse = false;
      //logger.trace('gateCmd:true');
    } else {
      latchGateOpenTrue = false;
      latchGateOpenFalse = true;
      //logger.trace('gateCmd:false');
    }
  } else if (topic === "latch/status/fan/open") {
    if (msg.toString() === "true") {
      latchFanOpenTrue = true;
      latchFanOpenFalse = false;
      //logger.trace('fanCmd:true');
    } else {
      latchFanOpenTrue = false;
      latchFanOpenFalse = true;
      //logger.trace('fanCmd:false');
    }
  } else if (topic === "latch/status/vibration") {
    if (msg.toString() === "true") {
      latchVibrationTrue = true;
      latchVibrationFalse = false;
      //logger.trace('vCmd:true');
    } else {
      latchVibrationTrue = false;
      latchVibrationFalse = true;
      //logger.trace('vCmd:false');
    }
  } else if (topic === "latch/status/arm/pos") {
    strArmPos = msg.toString();
    //logger.trace(strArmPos);
  } else if (topic === "latch/status/cvt/pos") {
    strCvtPos = msg.toString();
    //logger.trace(strCvtPos);
  } else if (topic === "latch/status/arm/release") {
    if (msg.toString() === "true") {
      latchArmReleaseTrue = true;
      latchArmReleaseFalse = false;
    } else {
      latchArmReleaseTrue = false;
      latchArmReleaseFalse = true;
    }
  }
});

async function waitRobotMotionDone(waitTime) {
  await delay(waitTime);
  robotMotionDone = false;
  const result = await waitUntil(() => {
    return robotMotionDone;
  }, waitRobotMotionDoneTimeout);
}

async function waitOvenOpenTrue(waitTime) {
  await delay(waitTime);
  ovenOpenTrue = false;
  const result = await waitUntil(() => {
    return ovenOpenTrue;
  }, waitOvenTimeout);
}

async function waitOvenOpenFalse(waitTime) {
  await delay(waitTime);
  ovenOpenFalse = false;
  const result = await waitUntil(() => {
    return ovenOpenFalse;
  }, waitOvenTimeout);
}

async function waitOvenFlipTrue(waitTime) {
  await delay(waitTime);
  ovenFlipTrue = false;
  const result = await waitUntil(() => {
    return ovenFlipTrue;
  }, waitOvenTimeout);
}

async function waitOvenFlipFalse(waitTime) {
  await delay(waitTime);
  ovenFlipFalse = false;
  const result = await waitUntil(() => {
    return ovenFlipFalse;
  }, waitOvenTimeout);
}

async function waitbucketStopTrue(waitTime) {
  await delay(waitTime);
  bucketStopTrue = false;
  const result = await waitUntil(() => {
    return bucketStopTrue;
  }, waitOvenTimeout);
}

async function waitbucketStopFalse(waitTime) {
  await delay(waitTime);
  bucketStopFalse = false;
  const result = await waitUntil(() => {
    return bucketStopFalse;
  }, waitOvenTimeout);
}

async function waitlatchArmStopTrue(waitTime) {
  await delay(waitTime);
  latchArmStopTrue = false;
  const result = await waitUntil(() => {
    return latchArmStopTrue;
  }, waitOvenTimeout);
}

async function waitlatchArmStopFalse(waitTime) {
  await delay(waitTime);
  latchArmStopFalse = false;
  const result = await waitUntil(() => {
    return latchArmStopFalse;
  }, waitOvenTimeout);
}

async function waitlatchCvtStopTrue(waitTime) {
  await delay(waitTime);
  latchCvtStopTrue = false;
  const result = await waitUntil(() => {
    return latchCvtStopTrue;
  }, waitOvenTimeout);
}

async function waitlatchCvtStopFalse(waitTime) {
  await delay(waitTime);
  latchCvtStopFalse = false;
  const result = await waitUntil(() => {
    return latchCvtStopFalse;
  }, waitOvenTimeout);
}

async function waitlatchSuckStopTrue(waitTime) {
  await delay(waitTime);
  latchSuckStopTrue = false;
  const result = await waitUntil(() => {
    return latchSuckStopTrue;
  }, waitOvenTimeout);
}

async function waitlatchSuckStopFalse(waitTime) {
  await delay(waitTime);
  latchSuckStopFalse = false;
  const result = await waitUntil(() => {
    return latchSuckStopFalse;
  }, waitOvenTimeout);
}

async function waitlatchGateOpenTrue(waitTime) {
  await delay(waitTime);
  latchGateOpenTrue = false;
  const result = await waitUntil(() => {
    //logger.trace(latchGateOpenTrue);
    return latchGateOpenTrue;
  }, waitOvenTimeout);
}

async function waitlatchGateOpenFalse(waitTime) {
  await delay(waitTime);
  latchGateOpenFalse = false;
  const result = await waitUntil(() => {
    //logger.trace(latchGateOpenFalse);
    return latchGateOpenFalse;
  }, waitOvenTimeout);
}

async function waitlatchFanOpenTrue(waitTime) {
  await delay(waitTime);
  latchFanOpenTrue = false;
  const result = await waitUntil(() => {
    //logger.trace(latchFanOpenTrue);
    return latchFanOpenTrue;
  }, waitOvenTimeout);
}

async function waitlatchFanOpenFalse(waitTime) {
  await delay(waitTime);
  latchFanOpenFalse = false;
  const result = await waitUntil(() => {
    return latchFanOpenFalse;
  }, waitOvenTimeout);
}

async function waitTakeBowl(waitTime) {
  await delay(waitTime);
  latchBowlReadyTrue = false;
  const result = await waitUntil(() => {
    return latchBowlReadyTrue;
  }, waitTakeBowlTimeout);
}

async function waitBowlout(waitTime) {
  await delay(waitTime);
  latchBowlReadyFalse = false;
  const result = await waitUntil(() => {
    return latchBowlReadyFalse;
  }, waitBowloutTimeout);
}

async function waitlatchTakeBowlStart(waitTime) {
  await delay(waitTime);
  //latchTakeBowl_Start = false;
  const result = await waitUntil(() => {
    return latchTakeBowl_Start;
  }, waitTakeBowlTimeout);
}

async function waitlatchStockBowlStart(waitTime) {
  await delay(waitTime);
  //latchStockBowl_Start = false;
  const result = await waitUntil(() => {
    return latchStockBowl_Start;
  }, waitRobotMotionDoneTimeout);
}

async function chkArmPos(pos) {
  if (Number(pos) === Number(strArmPos)) return true;
  else return false;
}

async function chkCvtPos(pos) {
  if (Number(pos) === Number(strCvtPos)) return true;
  else return false;
}

async function robotDropCake(waitTime) {
  client.publish("robot/cmd/jog/x", "0");
  client.publish("robot/cmd/jog/y", "-130");
  client.publish("robot/cmd/jog/z", "-70");
  await waitRobotMotionDone(waitTime);
  client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
}

async function Unloading(waitTime) {
  await waitTakeBowl();

  ///開啟散熱風扇
  client.publish("latch/cmd/fan/open", "true");
  logger.trace("10");
  await waitlatchFanOpenTrue(waitTime);

  ///開啟物料閘門
  client.publish("latch/cmd/gate/open", "true");
  logger.trace("11");
  await waitlatchGateOpenTrue(waitTime);
  await delay(4000);
  logger.trace("12");

  client.publish("latch/cmd/gate/open", "false");
  await waitlatchGateOpenFalse(waitTime);
  await delay(1500);
  logger.trace("13");

  ///關閉散熱風扇
  client.publish("latch/cmd/fan/open", "false");
  await waitlatchFanOpenFalse(waitTime);
  await delay(500);
  logger.trace("14");

  ///剩餘物件數量
  logger.trace(strBowlCnt);

  logger.trace("Stock Bowl Process finish!");
}

(async () => {
  let waitTime = 50; ///預留cmd傳遞時間

  //while (true) {
    latchTakeBowl_Start = true;

    logger.trace("main script start!");

    client.publish("robot/cmd/jog/vel", "300 ");
    client.publish("bucket/cmd/jog/vel", "300");

    client.publish("oven/cmd/open", "true");
    logger.trace("oven first close");
    await delay(1500);

    client.publish("robot/cmd/jog/x", "240");
    client.publish("robot/cmd/jog/y", "-15");
    client.publish("robot/cmd/jog/z", "-110");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move to P1");

    //client.publish('bucket/cmd/jog/vol', '99');
    //await waitbucketStopTrue(waitTime);

    client.publish("bucket/cmd/jog/vol", "30");
    await waitbucketStopTrue(waitTime);
    logger.trace("Spit to P1");

    client.publish("robot/cmd/jog/y", "-61");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move to P2");

    client.publish("bucket/cmd/jog/vol", "33");
    await waitbucketStopTrue(waitTime);
    logger.trace("Spit to P2");

    client.publish("robot/cmd/jog/y", "-107");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move to P3");

    client.publish("bucket/cmd/jog/vol", "33");
    await waitbucketStopTrue(waitTime);
    logger.trace("Spit to P3");

    client.publish("robot/cmd/jog/y", "-153");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move to P4");

    client.publish("bucket/cmd/jog/vol", "33");
    await waitbucketStopTrue(waitTime);
    logger.trace("Spit to P4");

    client.publish("robot/cmd/jog/y", "-199");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move to P5");

    client.publish("bucket/cmd/jog/vol", "33");
    await waitbucketStopTrue(waitTime);
    logger.trace("Spit to P5");

    client.publish("robot/cmd/jog/y", "-245");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move to P6");

    client.publish("bucket/cmd/jog/vol", "33");
    await waitbucketStopTrue(waitTime);
    logger.trace("Spit to P6");

    client.publish("bucket/cmd/jog/vol", "-10"); //suck back
    await waitbucketStopTrue(waitTime);
    logger.trace("pump suck back");

    client.publish("robot/cmd/jog/x", "150");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to avoid point");

    client.publish("robot/cmd/jog/x", "0");
    client.publish("robot/cmd/jog/y", "0");
    client.publish("robot/cmd/jog/z", "0");
    logger.trace("robot go to 000");
    //await waitRobotMotionDone();

    //------開始烤蛋糕程序------

    client.publish("oven/cmd/open", "false");
    await waitOvenOpenFalse(waitTime);
    logger.trace("oven close");

    client.publish("oven/cmd/flip", "true");
    await waitOvenFlipTrue();
    logger.trace("oven flip true");

    //await delay(75000); //bake 1 min 15s
    await delay(1000);

    client.publish("oven/cmd/flip", "false");
    await waitOvenFlipFalse();
    logger.trace("oven flip false");

    //await delay(120000); //bake 2 min
    await delay(1000);

    // for(i=0;i<1;i++)   //12
    // {
    //   //one loop  3+5+3+5=16s
    //   client.publish('oven/cmd/flip', 'true');
    //   await waitOvenFlipTrue(waitTime);
    //   await delay(1000); //bake 5s

    //   client.publish('oven/cmd/flip', 'false');
    //   await waitOvenFlipFalse(waitTime);
    //   await delay(1000); ////bake 5s
    // }

    client.publish("robot/cmd/home/z", "true");
    client.publish("robot/cmd/home/y", "true");
    client.publish("robot/cmd/home/x", "true");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot go home");

    client.publish("oven/cmd/open", "true");
    logger.trace("oven open");
    await delay(1500);

    //   //------開始夾蛋糕程序------
    //   //-----開始第一顆放料----------
    client.publish("robot/cmd/jog/x", "210");
    client.publish("robot/cmd/jog/y", "-20");
    client.publish("robot/cmd/jog/z", "-105");
    client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to Upper P1");

    //   //P7-1下 夾起
    //client.publish('robot/cmd/jog/z', '-105');
    client.publish("robot/cmd/jog/fork", "50"); //gripper CLOSE
    await waitRobotMotionDone(waitTime);
    logger.trace("robot grip at P1");

    //   //P7-2上 夾起
    client.publish("robot/cmd/jog/z", "-70");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move up at P1");

    await robotDropCake(waitTime);
    logger.trace("robot Drop Cake");
    //   //-----完成第一顆放料----------

    //   //-----開始第二顆放料----------
    client.publish("robot/cmd/jog/x", "210");
    client.publish("robot/cmd/jog/y", "-66");
    client.publish("robot/cmd/jog/z", "-105");
    client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to Upper P2");

    //   //P7-1下 夾起
    //client.publish('robot/cmd/jog/z', '-105');
    client.publish("robot/cmd/jog/fork", "50"); //gripper CLOSE
    await waitRobotMotionDone(waitTime);
    logger.trace("robot grip at P2");

    //   //P7-2上 夾起
    client.publish("robot/cmd/jog/z", "-70");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move up at P2");

    await robotDropCake(waitTime);
    logger.trace("robot Drop Cake");
    //  //-----完成第二顆放料----------

    //   //-----開始第三顆放料----------
    client.publish("robot/cmd/jog/x", "210");
    client.publish("robot/cmd/jog/y", "-113");
    client.publish("robot/cmd/jog/z", "-105");
    client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to Upper P3");

    //   //P7-1下 夾起
    //client.publish('robot/cmd/jog/z', '-105');
    client.publish("robot/cmd/jog/fork", "50"); //gripper CLOSE
    await waitRobotMotionDone(waitTime);
    logger.trace("robot grip at P3");

    //   //P7-2上 夾起
    client.publish("robot/cmd/jog/z", "-70");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move up at P3");

    await robotDropCake(waitTime);
    logger.trace("robot Drop Cake");
    //  //-----完成第三顆放料----------

    //  //-----開始第四顆放料----------
    client.publish("robot/cmd/jog/x", "210");
    client.publish("robot/cmd/jog/y", "-158");
    client.publish("robot/cmd/jog/z", "-105");
    client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to Upper P4");

    //   //P7-1下 夾起
    //client.publish('robot/cmd/jog/z', '-105');
    client.publish("robot/cmd/jog/fork", "50"); //gripper CLOSE
    await waitRobotMotionDone(waitTime);
    logger.trace("robot grip at P4");

    //   //P7-2上 夾起
    client.publish("robot/cmd/jog/z", "-70");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move up at P4");

    await robotDropCake(waitTime);
    logger.trace("robot Drop Cake");
    //  //-----完成第四顆放料----------

    //   //-----開始第五顆放料----------
    client.publish("robot/cmd/jog/x", "210");
    client.publish("robot/cmd/jog/y", "-204");
    client.publish("robot/cmd/jog/z", "-105");
    client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to Upper P5");

    //   //P7-1下 夾起
    //client.publish('robot/cmd/jog/z', '-105');
    client.publish("robot/cmd/jog/fork", "50"); //gripper CLOSE
    await waitRobotMotionDone(waitTime);
    logger.trace("robot grip at P5");

    //   //P7-2上 夾起
    client.publish("robot/cmd/jog/z", "-70");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move up at P5");

    await robotDropCake(waitTime);
    logger.trace("robot Drop Cake");
    //  //-----完成第五顆放料----------

    //   //-----開始第六顆放料----------
    client.publish("robot/cmd/jog/x", "210");
    client.publish("robot/cmd/jog/y", "-250");
    client.publish("robot/cmd/jog/z", "-105");
    client.publish("robot/cmd/jog/fork", "0"); //gripper OPEN
    await waitRobotMotionDone(waitTime);
    logger.trace("robot to Upper P6");

    //   //P7-1下 夾起
    //client.publish('robot/cmd/jog/z', '-105');
    client.publish("robot/cmd/jog/fork", "50"); //gripper CLOSE
    await waitRobotMotionDone(waitTime);
    logger.trace("robot grip at P6");

    //   //P7-2上 夾起
    client.publish("robot/cmd/jog/z", "-70");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot move up at P6");

    await robotDropCake(waitTime);
    logger.trace("robot Drop Cake");
    //  //-----完成第六顆放料----------

    client.publish("robot/cmd/jog/x", "0");
    client.publish("robot/cmd/jog/y", "0");
    client.publish("robot/cmd/jog/z", "0");
    logger.trace("robot go to 000");

    client.publish("oven/cmd/open", "false");
    await waitOvenOpenFalse(waitTime);
    logger.trace("oven close");

    await Unloading(waitTime);
    logger.trace("drop cake to bowl");

    client.publish("robot/cmd/home/z", "true");
    client.publish("robot/cmd/home/y", "true");
    client.publish("robot/cmd/home/x", "true");
    await waitRobotMotionDone(waitTime);
    logger.trace("robot go home");

    ///確認物件是否被取走
    ///await waitBowlout();

    logger.trace("Process finish!!!!!!!!!!!!!");
    client.end();
  //}
})();

(async () => {
  ///取碗part
  let waitTime = 100; ///預留cmd傳遞時間
  logger.trace("sub script start!");

  ///設定arm移動速度
  client.publish("latch/cmd/arm/vel", "40"); //vel:23 -> delay:200
  await delay(waitTime);

  ///設定cv移動速度
  client.publish("latch/cmd/cvt/vel", "130"); //vel:125 -> delay:800
  await delay(waitTime);

  latchTakeBowl_Start = true;

  do {
    await waitlatchTakeBowlStart();

    retry_TakeBowl = 0;

    do {
      logger.trace("01");
      ///cv移動到取物件位置
      client.publish("latch/cmd/cvt/pos", "-202");
      await delay(2000);
      await waitlatchCvtStopTrue();
      logger.trace("02");

      ///arm上伸到取物件位置
      switch (
        retry_TakeBowl % 3 ///調整arm上伸到取物件位置
      ) {
        case 0:
          client.publish("latch/cmd/arm/pos", "110");
          break;
        case 1:
          client.publish("latch/cmd/arm/pos", "112");
          break;
        case 2:
          client.publish("latch/cmd/arm/pos", "115");
          break;
      }

      //await delay(waitTime);
      await delay(3000);
      await waitlatchArmStopTrue();
      logger.trace("03");

      ///吸取物件
      client.publish("latch/cmd/arm/suck", "true");
      await delay(300);
      //await delay(waitTime);
      await waitlatchSuckStopTrue();
      logger.trace("04");

      ///arm下降到cv平台位置
      client.publish("latch/cmd/arm/pos", "22");
      await delay(2000);
      //await delay(waitTime);
      await waitlatchArmStopTrue();
      logger.trace("05");

      ///釋放物件
      client.publish("latch/cmd/arm/suck", "false");
      await delay(4000);
      //await delay(waitTime);
      await waitlatchSuckStopFalse();
      logger.trace("06");

      ///arm下降到原點位置
      client.publish("latch/cmd/arm/pos", "0");
      await delay(1500);
      //await delay(waitTime);
      await waitlatchArmStopTrue();
      logger.trace("07");

      ///cv移動到放物料位置
      client.publish("latch/cmd/cvt/pos", "0");
      await delay(2000);
      //await delay(waitTime);
      await waitlatchCvtStopTrue();
      logger.trace("08");

      await delay(500);
      retry_TakeBowl++;
      ///確認是否取得物件
      logger.trace("latchBowlReadyTrue: " + latchBowlReadyTrue);
      logger.trace("retry_TakeBowl: " + retry_TakeBowl);
    } while (latchBowlReadyTrue == false && retry_TakeBowl < 10);

    if (retry_TakeBowl >= 10) {
      ///Err:多次物件取得失敗
      logger.trace("Take Bowl Error!");
      break;
    }

    logger.trace("before latchTakeBowl_Start");

    latchTakeBowl_Start = false;
    cntTimes = cntTimes + 1;
  } while (cntTimes < maxTimes);

  logger.trace("cntTimes: " + cntTimes);

  logger.trace("Take Bowl Process finish!");
})();
