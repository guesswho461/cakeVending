#include <Ethernet.h>
//#include <MQTT.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Servo.h>

#define MANUAL_SPD_PIN A15
#define MANUAL_ENA_PIN 2
#define MANUAL_SEL_A_PIN 5
#define MANUAL_SEL_B_PIN 6
#define MANUAL_DIR_PIN 7

#define MOTOR_X 0
#define MOTOR_X_ENA_PIN 22
#define MOTOR_X_DIR_PIN 24
#define MOTOR_X_PUL_PIN 26
#define MOTOR_X_POS_LIMIT_PIN 31
#define MOTOR_X_NEG_LIMIT_PIN 31
#define MOTOR_X_HOME_PIN 31

#define MOTOR_Y 1
#define MOTOR_Y_ENA_PIN 30
#define MOTOR_Y_DIR_PIN 32
#define MOTOR_Y_PUL_PIN 34
#define MOTOR_Y_POS_LIMIT_PIN 33
#define MOTOR_Y_NEG_LIMIT_PIN 33
#define MOTOR_Y_HOME_PIN 33

#define MOTOR_Z 2
#define MOTOR_Z_ENA_PIN 38
#define MOTOR_Z_DIR_PIN 40
#define MOTOR_Z_PUL_PIN 42
#define MOTOR_Z_POS_LIMIT_PIN 35
#define MOTOR_Z_NEG_LIMIT_PIN 35
#define MOTOR_Z_HOME_PIN 35

#define MOTOR_G_POS_PIN 3  // gripper

#define TOPIC_SUBSCRIBE "robot/cmd/#"

#define PAYLOAD_TRUE "true"
#define PAYLOAD_FALSE "false"
#define PAYLOAD_REMOTE "remote"
#define PAYLOAD_MANUAL "manual"
#define PAYLOAD_NORMAL "normal"
#define PAYLOAD_UNKNOWN_TOPIC "unknown topic or payload"

#define USEC_PER_SEC 1000000
#define PUBLISH_MSG(msg) client.publish(TOPIC_ROBOT_STATUS_ALARM, msg)
#define PUBLISH_NORMAL PUBLISH_MSG(PAYLOAD_NORMAL)

#define TOPIC_ROBOT_CMD_JOG_X "robot/cmd/jog/x"          // float, mm
#define TOPIC_ROBOT_CMD_JOG_Y "robot/cmd/jog/y"          // float, mm
#define TOPIC_ROBOT_CMD_JOG_Z "robot/cmd/jog/z"          // float, mm
#define TOPIC_ROBOT_CMD_JOG_FORK "robot/cmd/jog/fork"    // float, deg
#define TOPIC_ROBOT_CMD_JOG_VEL "robot/cmd/jog/vel"      // float, mm/s
#define TOPIC_ROBOT_CMD_STOP "robot/cmd/stop"            // string, true/false
#define TOPIC_ROBOT_CMD_HOME_X "robot/cmd/home/x"        // string, true/false
#define TOPIC_ROBOT_CMD_HOME_Y "robot/cmd/home/y"        // string, true/false
#define TOPIC_ROBOT_CMD_HOME_Z "robot/cmd/home/z"        // string, true/false
#define TOPIC_ROBOT_CMD_HOME_FORK "robot/cmd/home/fork"  // string, true/false
#define TOPIC_ROBOT_CMD_PAR_X_STEP_PER_MM "robot/cmd/par/x/stepPerMM"  // float
#define TOPIC_ROBOT_CMD_PAR_Y_STEP_PER_MM "robot/cmd/par/y/stepPerMM"  // float
#define TOPIC_ROBOT_CMD_PAR_Z_STEP_PER_MM "robot/cmd/par/z/stepPerMM"  // float

#define TOPIC_ROBOT_STATUS_MODE "robot/status/mode"    // string, remote/manual
#define TOPIC_ROBOT_STATUS_ALARM "robot/status/alarm"  // string, normal
#define TOPIC_ROBOT_STATUS_JOG_X "robot/status/jog/x"  // float, mm
#define TOPIC_ROBOT_STATUS_JOG_Y "robot/status/jog/y"  // float, mm
#define TOPIC_ROBOT_STATUS_JOG_Z "robot/status/jog/z"  // float, mm
#define TOPIC_ROBOT_STATUS_JOG_FORK "robot/status/jog/fork"  // float, deg
#define TOPIC_ROBOT_STATUS_JOG_VEL "robot/status/jog/vel"    // float, mm/s
#define TOPIC_ROBOT_STATUS_STOP "robot/status/stop"      // string, true/false
#define TOPIC_ROBOT_STATUS_HOME_X "robot/status/home/x"  // string, true/false
#define TOPIC_ROBOT_STATUS_HOME_Y "robot/status/home/y"  // string, true/false
#define TOPIC_ROBOT_STATUS_HOME_Z "robot/status/home/z"  // string, true/false
#define TOPIC_ROBOT_STATUS_HOME_FORK \
  "robot/status/home/fork"  // string, true/false
#define TOPIC_ROBOT_STATUS_PAR_X_STEP_PER_MM \
  "robot/status/par/x/stepPerMM"  // float
#define TOPIC_ROBOT_STATUS_PAR_Y_STEP_PER_MM \
  "robot/status/par/y/stepPerMM"  // float
#define TOPIC_ROBOT_STATUS_PAR_Z_STEP_PER_MM \
  "robot/status/par/z/stepPerMM"  // float

//#define SERIAL_DEBUG  // uncomment this define for enable the serial
//#define SERIAL_DEBUG_FULL  // uncomment this define for enable the serial
//#define SERVO_ON_BEFORE_MOVED  //uncomment this define to disable this
// function
// debugging
#define SERIAL_BAUDRATE 9600
#define CONNECT_RETRY_INTERERVAL 1000  // ms
#define PUBLISH_INTERVAL 500           // ms
#define MAX_DELAY 10000                // us
#define MIN_DELAY 200                  // us
#define STOP_MOVING_THRESHOLD 9900     // us
#define CLIENT_ID "cakeVendingRobot"
#define CLIENT_USERNAME "try"
#define CLIENT_PASSWORD "try"
#define DECIMAL_PLACE 3
#define DEFAULT_STEP_PER_MM 28
#define MAX_RETRY 3
#define MOTOR_G_HOME_POS 0
#define MOTOR_HOMING_VEL 500
#define DEFAULT_STEP_PER_MM_Z 50

const byte mac[] = {0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F};
const IPAddress ip(192, 168, 1, 25);
const IPAddress server(192, 168, 1, 99);  // pi 99 laptop 19
// 設定用戶端ID
const char clientID[] = "Arduino01";

struct sMotorPinCfg {
  uint8_t enaPin;
  uint8_t stepPin;
  uint8_t dirPin;
  float stepPerMM;
  uint8_t posLimitPin;
  uint8_t negLimitPin;
  uint8_t homePin;
  uint8_t homingDir;
};

struct sMotorCmd {
  uint8_t dir;
  int32_t step;    // abs
  uint32_t delay;  // us
  bool home;
};

struct sMotorStatus {
  uint8_t dir;
  int32_t step;  // abs
  float pos;
  float vel;
  bool targetReach;
  bool lastTargetReach;
  float stepPerMM;
  bool home;
};

struct sMotor {
  struct sMotorPinCfg cfg;
  struct sMotorCmd cmd;
  struct sMotorStatus status;
};

// EthernetClient socket;
// MQTTClient client;
EthernetClient ethClient;        // 建立乙太網路前端物件
PubSubClient client(ethClient);  // 基於乙太網路物件，建立MQTT前端物件
unsigned long lastMillis = 0;
struct sMotor motors[3];
uint8_t manualMode = HIGH;
uint8_t lastManualMode = HIGH;
Servo gripper;
int gripperPosCmd = 0;

void genFreqAtPin(uint8_t pin, uint32_t delay) {
  digitalWrite(pin, HIGH);
  delayMicroseconds(delay);
  digitalWrite(pin, LOW);
  delayMicroseconds(delay);
}

void controlTheMotor(struct sMotor& motor) {
  if (motor.cmd.home == true) {  //回home模式

    int32_t homeReached = digitalRead(motor.cfg.homePin);
    if (homeReached == HIGH) {  //還沒被觸發
#ifdef SERIAL_DEBUG
      Serial.println("In Homing...");
#endif
      motor.cmd.dir = motor.cfg.homingDir;
      motor.status.targetReach = false;
      motor.status.home = false;
      motor.cmd.delay = MOTOR_HOMING_VEL;
    } else {
      motor.cmd.step = 0;
      motor.status.step = 0;
      motor.status.targetReach = true;
      motor.status.home = true;
      motor.cmd.home = false;
      motor.cmd.delay = MAX_DELAY;
    }
  } else {
    if (manualMode == LOW) {  //手動模式

#ifdef SERIAL_DEBUG
      Serial.println("In manualMode");
#endif
      // velocity mode
      if (motor.cmd.delay < STOP_MOVING_THRESHOLD) {
        motor.status.targetReach = false;
      } else {
        motor.status.targetReach = true;
      }
    } else {  // MQTT Mode

      // position mode
#ifdef SERIAL_DEBUG
      Serial.println("In MQTT Mode");
#endif
      if (motor.cmd.dir == HIGH) {
        if (motor.status.step < motor.cmd.step) {
          motor.status.targetReach = false;
        } else {
          motor.status.targetReach = true;
        }
      } else {
        if (motor.status.step > motor.cmd.step) {
          motor.status.targetReach = false;
        } else {
          motor.status.targetReach = true;
        }
      }
    }
  }

  if (motor.status.targetReach == false) {  //還沒到target

#ifdef SERVO_ON_BEFORE_MOVED
    digitalWrite(motor.cfg.enaPin, HIGH);  // Servo ON
#endif
    digitalWrite(motor.cfg.dirPin, motor.cmd.dir);     // Dir Update
    genFreqAtPin(motor.cfg.stepPin, motor.cmd.delay);  //走一步
    if (motor.cmd.dir == HIGH) {
      motor.status.step++;
    } else {
      motor.status.step--;
    }
  } else {
#ifdef SERVO_ON_BEFORE_MOVED
    digitalWrite(motor.cfg.enaPin, LOW);  // Servo OFF
#endif
  }
#ifdef SERIAL_DEBUG_FULL
  Serial.print("target reach: ");
  Serial.print(motor.status.targetReach);
  Serial.print(", cmd.delay: ");
  Serial.print(motor.cmd.delay);
  Serial.print(", step: ");
  Serial.println(motor.status.step);
#endif
}

int32_t getManualCmd(struct sMotor* pMotors) {
  int32_t idx = MOTOR_X;
  int32_t selA = digitalRead(MANUAL_SEL_A_PIN);
  int32_t selB = digitalRead(MANUAL_SEL_B_PIN);
  int32_t dir = digitalRead(MANUAL_DIR_PIN);
  int32_t delay = map(analogRead(MANUAL_SPD_PIN), 0, 1023, MAX_DELAY, 1);

  if (selA == 1 && selB == 0) {
    idx = MOTOR_X;
  } else if (selA == 1 && selB == 1) {
    idx = MOTOR_Y;
  } else if (selA == 0 && selB == 1) {
    idx = MOTOR_Z;
  } else {
    idx = MOTOR_X;
  }
  (pMotors + idx)->cmd.dir = dir;
  (pMotors + idx)->cmd.delay = delay;

#ifdef SERIAL_DEBUG_FULL
  Serial.print("selA=");
  Serial.println(selA);
  Serial.print("selB=");
  Serial.println(selB);
  Serial.print("dir=");
  Serial.println(dir);
  Serial.print("delay=");
  Serial.println(delay);
  Serial.print("idx=");
  Serial.println(idx);
#endif
  return idx;
}

int32_t posToStep(float pos, float stepPerMM) {
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  return (int32_t)(pos * stepPerMM);
}

float stepToPos(int32_t step, float stepPerMM) {
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  return (float)(step / stepPerMM);
}

uint32_t velToDelay(float vel, float stepPerMM) {
  if (vel < 0.0f) vel = 1.0f;
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  float temp = ((USEC_PER_SEC / (vel * stepPerMM)) * 0.5f);
  if (temp < MIN_DELAY) temp = MIN_DELAY;
  return (uint32_t)temp;
}

float delayToVel(
    uint32_t delay,
    float stepPerMM) {  //這邊還有問題，不論input是甚麼，output都一樣
  if (delay < 1) delay = 1;
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  float temp = ((USEC_PER_SEC / (delay * 2.0f)) / stepPerMM);
#ifdef SERIAL_DEBUG
  Serial.print("delayToVel:");
  Serial.println(temp);
#endif
  return temp;
}

void setStepPerMM(struct sMotor* pMotor, float stepPerMM) {
  if (stepPerMM < 0.0f) {
    pMotor->cfg.stepPerMM = DEFAULT_STEP_PER_MM;
    pMotor->status.stepPerMM = DEFAULT_STEP_PER_MM;
  } else {
    pMotor->cfg.stepPerMM = stepPerMM;
    pMotor->status.stepPerMM = stepPerMM;
  }
}

void setCmdPulse(struct sMotor* pMotor, float step) {
  pMotor->cmd.step = posToStep(step, pMotor->cfg.stepPerMM);
#ifdef SERIAL_DEBUG
  Serial.print("pMotor->cmd.step:");
  Serial.println(pMotor->cmd.step);
#endif
  //  if ((pMotor->cmd.step) >= 0) {
  if ((pMotor->status.step - pMotor->cmd.step) <= 0) {
    pMotor->cmd.dir = HIGH;
  } else {
    pMotor->cmd.dir = LOW;
  }
}

int32_t getEdge(uint8_t now, uint8_t last) {
  int32_t edge = 0;
  if (last > now) {
    // falling edge
    edge = -1;
  } else if (last < now) {
    // rising edge
    edge = 1;
  } else {
    edge = 0;
  }
  return edge;
}

void publishTheStatus(struct sMotor* pMotors) {
  if (manualMode == LOW) {
    client.publish(TOPIC_ROBOT_STATUS_MODE, PAYLOAD_MANUAL);
  } else {
    client.publish(TOPIC_ROBOT_STATUS_MODE, PAYLOAD_REMOTE);
  }

  bool allTargetReach = (pMotors + MOTOR_X)->status.targetReach == true &&
                        (pMotors + MOTOR_Y)->status.targetReach == true &&
                        (pMotors + MOTOR_Z)->status.targetReach == true;
  if (allTargetReach) {
    client.publish(TOPIC_ROBOT_STATUS_STOP, PAYLOAD_TRUE);
  } else {
    client.publish(TOPIC_ROBOT_STATUS_STOP, PAYLOAD_FALSE);
  }

  for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
    (pMotors + i)->status.pos =
        stepToPos((pMotors + i)->status.step, (pMotors + i)->cfg.stepPerMM);
    (pMotors + i)->status.lastTargetReach = (pMotors + i)->status.targetReach;
  }

  client.publish(
      TOPIC_ROBOT_STATUS_JOG_X,
      String((pMotors + MOTOR_X)->status.pos, DECIMAL_PLACE).c_str());
  client.publish(
      TOPIC_ROBOT_STATUS_JOG_Y,
      String((pMotors + MOTOR_Y)->status.pos, DECIMAL_PLACE).c_str());
  client.publish(
      TOPIC_ROBOT_STATUS_JOG_Z,
      String((pMotors + MOTOR_Z)->status.pos, DECIMAL_PLACE).c_str());

  client.publish(TOPIC_ROBOT_STATUS_HOME_X, (pMotors + MOTOR_X)->status.home
                                                ? PAYLOAD_TRUE
                                                : PAYLOAD_FALSE);
  client.publish(TOPIC_ROBOT_STATUS_HOME_Y, (pMotors + MOTOR_Y)->status.home
                                                ? PAYLOAD_TRUE
                                                : PAYLOAD_FALSE);
  client.publish(TOPIC_ROBOT_STATUS_HOME_Z, (pMotors + MOTOR_Z)->status.home
                                                ? PAYLOAD_TRUE
                                                : PAYLOAD_FALSE);
}

int32_t getMQTTCmd(String topic, String payload,
                   struct sMotor* pMotors) {  // MQTT callback

  int32_t idx = 0;
  if (topic.equals(TOPIC_ROBOT_CMD_JOG_FORK)) {
    gripperPosCmd = payload.toInt();
    gripper.write(gripperPosCmd);
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_X)) {
    idx = MOTOR_X;
    setCmdPulse((pMotors + idx), payload.toFloat());
#ifdef SERIAL_DEBUG
    Serial.print("JOG_X");
#endif
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_Y)) {
    idx = MOTOR_Y;
    setCmdPulse((pMotors + idx), payload.toFloat());
#ifdef SERIAL_DEBUG
    Serial.print("JOG_Y");
#endif
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_Z)) {
    idx = MOTOR_Z;
    setCmdPulse((pMotors + idx), payload.toFloat());
#ifdef SERIAL_DEBUG
    Serial.print("JOG_Z");
#endif
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_VEL)) {  // vel
    float vel = payload.toFloat();

    uint32_t delay = 1000;
    for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
      int32_t delay = velToDelay(vel, (pMotors + i)->cfg.stepPerMM);
      (pMotors + i)->cmd.delay = delay;
#ifdef SERIAL_DEBUG
      Serial.print("(pMotors + i)->cmd.delay =");
      Serial.println((pMotors + i)->cmd.delay);
#endif
    }
    client.publish(TOPIC_ROBOT_STATUS_JOG_VEL,
                   String(delayToVel(delay, (pMotors + MOTOR_X)->cfg.stepPerMM),
                          DECIMAL_PLACE)
                       .c_str());
#ifdef SERIAL_DEBUG
    Serial.print("JOG_VEL");
#endif
  } else if (topic.equals(TOPIC_ROBOT_CMD_STOP)) {
    if (payload.equals(PAYLOAD_TRUE)) {
      for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
        (pMotors + i)->cmd.step = (pMotors + i)->status.step;
      }
    }
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_X)) {
    idx = MOTOR_X;
    (pMotors + idx)->cmd.home = true;
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_Y)) {
    idx = MOTOR_Y;
    (pMotors + idx)->cmd.home = true;
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_Z)) {
    idx = MOTOR_Z;
    (pMotors + idx)->cmd.home = true;
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_FORK)) {
    gripper.write(MOTOR_G_HOME_POS);
  } else if (topic.equals(TOPIC_ROBOT_CMD_PAR_X_STEP_PER_MM)) {
    idx = MOTOR_X;
    setStepPerMM((pMotors + idx), payload.toFloat());
    client.publish(
        TOPIC_ROBOT_STATUS_PAR_X_STEP_PER_MM,
        String((pMotors + idx)->status.stepPerMM, DECIMAL_PLACE).c_str());
  } else if (topic.equals(TOPIC_ROBOT_CMD_PAR_Y_STEP_PER_MM)) {
    idx = MOTOR_Y;
    setStepPerMM((pMotors + idx), payload.toFloat());
    client.publish(
        TOPIC_ROBOT_STATUS_PAR_Y_STEP_PER_MM,
        String((pMotors + idx)->status.stepPerMM, DECIMAL_PLACE).c_str());
  } else if (topic.equals(TOPIC_ROBOT_CMD_PAR_Z_STEP_PER_MM)) {
    idx = MOTOR_Z;
    setStepPerMM((pMotors + idx), payload.toFloat());
    client.publish(
        TOPIC_ROBOT_STATUS_PAR_Z_STEP_PER_MM,
        String((pMotors + idx)->status.stepPerMM, DECIMAL_PLACE).c_str());
  } else {
    idx = -1;
  }
  return idx;
}

void messageReceived(char* topic, byte* payload, unsigned int length) {
  String myTopic = String((char*)topic);
  String myPayload = String((char*)payload);
  String msg = charToStringJ(payload, length);
#ifdef SERIAL_DEBUG
  Serial.println("----Message arrived!----");
  Serial.print("topic:");
  Serial.println(topic);
  Serial.print("Message:");
  Serial.println(msg);
  Serial.println("------------------------");
#endif
  if (manualMode == HIGH) {
    if (getMQTTCmd(myTopic, msg, motors) < 0) {
      //    if (getMQTTCmd(topic, payload, motors) < 0) {
      PUBLISH_MSG(PAYLOAD_UNKNOWN_TOPIC);
#ifdef SERIAL_DEBUG
      Serial.println(PAYLOAD_UNKNOWN_TOPIC);
#endif
    } else {
      PUBLISH_NORMAL;
#ifdef SERIAL_DEBUG
      Serial.println(PAYLOAD_NORMAL);
#endif
    }
  }
}

void setPinsMode(uint8_t* pPins, uint8_t mode) {
  for (uint8_t* pPin = pPins; *pPin != 0; pPin++) {
    pinMode(*pPin, mode);
  }
}

String charToStringJ(const char S[], unsigned int length) {
  byte at = 0;
  String D = "";

  for (int i = 0; i < length; i++) {
    D.concat(S[at++]);
  }
  return D;
}

void setup() {
#ifdef SERIAL_DEBUG
  Serial.begin(SERIAL_BAUDRATE);
#endif
  // uint8_t outputPins[] = {MOTOR_X_ENA_PIN, MOTOR_X_DIR_PIN,
  //                         MOTOR_X_PUL_PIN, MOTOR_Y_ENA_PIN,
  //                         MOTOR_Y_DIR_PIN, MOTOR_Y_PUL_PIN,
  //                         MOTOR_Z_ENA_PIN, MOTOR_Z_DIR_PIN,
  //                         MOTOR_Z_PUL_PIN, 0};
  // uint8_t inputPins[] = {
  //     MANUAL_ENA_PIN,
  //     MANUAL_SEL_A_PIN,
  //     MANUAL_SEL_B_PIN,
  //     MANUAL_DIR_PIN,
  //     /*MOTOR_X_POS_LIMIT_PIN, MOTOR_X_NEG_LIMIT_PIN,*/ MOTOR_X_HOME_PIN,
  //     /*MOTOR_Y_POS_LIMIT_PIN, MOTOR_Y_NEG_LIMIT_PIN,*/ MOTOR_Y_HOME_PIN,
  //     /*MOTOR_Z_POS_LIMIT_PIN, MOTOR_Z_NEG_LIMIT_PIN,*/ MOTOR_Z_HOME_PIN,
  //     0};
  // setPinsMode(outputPins, OUTPUT);
  // setPinsMode(inputPins, INPUT_PULLUP);

  // motors[MOTOR_X].cfg.enaPin = MOTOR_X_ENA_PIN;
  // motors[MOTOR_X].cfg.stepPin = MOTOR_X_PUL_PIN;
  // motors[MOTOR_X].cfg.dirPin = MOTOR_X_DIR_PIN;
  // motors[MOTOR_X].cfg.posLimitPin = MOTOR_X_POS_LIMIT_PIN;
  // motors[MOTOR_X].cfg.negLimitPin = MOTOR_X_NEG_LIMIT_PIN;
  // motors[MOTOR_X].cfg.homePin = MOTOR_X_HOME_PIN;
  // motors[MOTOR_X].cfg.stepPerMM = DEFAULT_STEP_PER_MM;

  // motors[MOTOR_Y].cfg.enaPin = MOTOR_Y_ENA_PIN;
  // motors[MOTOR_Y].cfg.stepPin = MOTOR_Y_PUL_PIN;
  // motors[MOTOR_Y].cfg.dirPin = MOTOR_Y_DIR_PIN;
  // motors[MOTOR_Y].cfg.posLimitPin = MOTOR_Y_POS_LIMIT_PIN;
  // motors[MOTOR_Y].cfg.negLimitPin = MOTOR_Y_NEG_LIMIT_PIN;
  // motors[MOTOR_Y].cfg.homePin = MOTOR_Y_HOME_PIN;
  // motors[MOTOR_Y].cfg.stepPerMM = DEFAULT_STEP_PER_MM;

  // motors[MOTOR_Z].cfg.enaPin = MOTOR_Z_ENA_PIN;
  // motors[MOTOR_Z].cfg.stepPin = MOTOR_Z_PUL_PIN;
  // motors[MOTOR_Z].cfg.dirPin = MOTOR_Z_DIR_PIN;
  // motors[MOTOR_Z].cfg.posLimitPin = MOTOR_Z_POS_LIMIT_PIN;
  // motors[MOTOR_Z].cfg.negLimitPin = MOTOR_Z_NEG_LIMIT_PIN;
  // motors[MOTOR_Z].cfg.homePin = MOTOR_Z_HOME_PIN;
  // motors[MOTOR_Z].cfg.stepPerMM = DEFAULT_STEP_PER_MM_Z;

  // for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
  //   motors[i].status.step = 0;
  //   motors[i].status.targetReach = 0;
  //   motors[i].cfg.homingDir = HIGH;
  //   digitalWrite(motors[i].cfg.dirPin, HIGH);
  //   digitalWrite(motors[i].cfg.enaPin, HIGH);
  //   motors[i].cmd.home = true;
  // }

  // gripper.attach(MOTOR_G_POS_PIN);
  // gripper.write(0);

  // //先回Home
  // while (1) {
  //   for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
  //     controlTheMotor(motors[i]);  //執行cmd內容
  //   }

  //   if (motors[0].status.home == true && motors[1].status.home == true &&
  //       motors[2].status.home == true)
  //     break;
  // }

  //--MQTT Setup------------------
  Ethernet.begin(mac, ip);
  // 設定MQTT代理人的網址和埠號
  client.setServer(server, 1883);
  // 留點時間給乙太網路卡進行初始化
  delay(1000);
  reconnect();
  //----------------------------
}

void reconnect() {
  // 若目前沒有和伺服器相連，則反覆執行直到連結成功…
  int i = 0;
  while (!client.connected()) {
    // 指定用戶端ID並連結MQTT伺服器
    if (client.connect(clientID)) {
#ifdef SERIAL_DEBUG
      // 若連結成功，在序列埠監控視窗顯示「已連線」。
      Serial.println("connected");
#endif
      client.setCallback(messageReceived);
      client.subscribe(TOPIC_SUBSCRIBE);
    } else {
#ifdef SERIAL_DEBUG
      // 若連線不成功，則顯示錯誤訊息
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
#endif
      // 等候5秒，再重新嘗試連線。
      delay(500);
    }
    i++;
    if (i > 2) break;  // retry2次
  }
}

void loop() {
  // 確認用戶端是否已連上伺服器
  if (!client.connected()) {  // 若沒有連上，則重連。
    reconnect();
  }
  client.loop();

  manualMode = digitalRead(MANUAL_ENA_PIN);
#ifdef SERIAL_DEBUG_FULL
  Serial.print("manualMode=");
  Serial.println(manualMode);
#endif
  if (getEdge(manualMode, lastManualMode) > 0) {
    client.publish(TOPIC_ROBOT_STATUS_MODE, PAYLOAD_REMOTE);
#ifdef SERIAL_DEBUG
    Serial.println("switch to remote mode");
#endif
  } else if (getEdge(manualMode, lastManualMode) < 0) {
    client.publish(TOPIC_ROBOT_STATUS_MODE, PAYLOAD_MANUAL);
#ifdef SERIAL_DEBUG
    Serial.println("switch to manual mode");
#endif
  } else {
    // do nothing
  }
  lastManualMode = manualMode;  // mode update

  if (manualMode == LOW) {  // into manualMode
    for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
      motors[i].cmd.delay = MAX_DELAY;
    }
    getManualCmd(motors);  //產生cmd內容
  }
  for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
    controlTheMotor(motors[i]);  //執行cmd內容
  }

  //
  if (millis() - lastMillis > PUBLISH_INTERVAL) {
    lastMillis = millis();
    publishTheStatus(motors);
  }
}
