#include <Ethernet.h>
#include <MQTT.h>

#define MANUAL_SPD_PIN A0
#define MANUAL_ENA_PIN 4
#define MANUAL_SEL_A_PIN 5
#define MANUAL_SEL_B_PIN 6
#define MANUAL_DIR_PIN 7

#define MOTOR_X 0
#define MOTOR_X_ENA_PIN 22
#define MOTOR_X_DIR_PIN 24
#define MOTOR_X_PUL_PIN 26

#define MOTOR_Y 1
#define MOTOR_Y_ENA_PIN 30
#define MOTOR_Y_DIR_PIN 32
#define MOTOR_Y_PUL_PIN 34

#define MOTOR_Z 2
#define MOTOR_Z_ENA_PIN 38
#define MOTOR_Z_DIR_PIN 40
#define MOTOR_Z_PUL_PIN 42

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

// #define SERIAL_DEBUG  // uncomment this define for enable the serial
// debugging
#define SERIAL_BAUDRATE 115200
#define CONNECT_RETRY_INTERERVAL 1000  // ms
#define PUBLISH_INTERVAL 500           // ms
#define MAX_DELAY 10000                // us
#define STOP_MOVING_THRESHOLD 9900     // us
#define CLIENT_ID "cakeVendingRobot"
#define CLIENT_USERNAME "try"
#define CLIENT_PASSWORD "try"
#define DECIMAL_PLACE 3
#define DEFAULT_STEP_PER_MM 55

const byte mac[] = {0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F};
const byte ip[] = {172, 16, 228, 117};
const char broker[] = "172.16.228.3";

struct sMotorPinCfg {
  uint8_t stepPin;
  uint8_t dirPin;
  float stepPerMM;
};

struct sMotorCmd {
  uint8_t dir;
  int32_t step;    // abs
  uint32_t delay;  // us
};

struct sMotorStatus {
  uint8_t dir;
  int32_t step;  // abs
  float pos;
  float vel;
  bool targetReach;
  bool lastTargetReach;
  float stepPerMM;
};

struct sMotor {
  struct sMotorPinCfg cfg;
  struct sMotorCmd cmd;
  struct sMotorStatus status;
};

EthernetClient socket;
MQTTClient client;
unsigned long lastMillis = 0;
struct sMotor motors[3];
uint8_t manualMode = HIGH;
uint8_t lastManualMode = HIGH;

void genFreqAtPin(uint8_t pin, uint32_t delay) {
  digitalWrite(pin, HIGH);
  delayMicroseconds(delay);
  digitalWrite(pin, LOW);
  delayMicroseconds(delay);
}

void controlTheMotor(struct sMotor& motor) {
  if (manualMode == HIGH) {
    // velocity mode
    if (motor.cmd.delay < STOP_MOVING_THRESHOLD) {
      motor.status.targetReach = false;
    } else {
      motor.status.targetReach = true;
    }
  } else {
    // position mode
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
  if (motor.status.targetReach == false) {
    if (motor.cmd.dir == HIGH) {
      digitalWrite(motor.cfg.dirPin, HIGH);
    } else {
      digitalWrite(motor.cfg.dirPin, LOW);
    }
    genFreqAtPin(motor.cfg.stepPin, motor.cmd.delay);
    if (motor.cmd.dir == HIGH) {
      motor.status.step++;
    } else {
      motor.status.step--;
    }
  }
}

int32_t getManualCmd(struct sMotor* pMotors) {
  int32_t idx = MOTOR_X;
  int32_t selA = digitalRead(MANUAL_SEL_A_PIN);
  int32_t selB = digitalRead(MANUAL_SEL_B_PIN);
  int32_t dir = digitalRead(MANUAL_DIR_PIN);
  int32_t delay = map(analogRead(MANUAL_SPD_PIN), 0, 1023, MAX_DELAY, 1);
  if (selA == 1 && selB == 0) {
    idx = MOTOR_X;
  } else if (selA == 0 && selB == 0) {
    idx = MOTOR_Y;
  } else if (selA == 0 && selB == 1) {
    idx = MOTOR_Z;
  } else {
    idx = MOTOR_X;
  }
  (pMotors + idx)->cmd.dir = dir;
  (pMotors + idx)->cmd.delay = delay;
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

int32_t velToDelay(float vel, float stepPerMM) {
  if (vel < 0.0f) vel = 1.0f;
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  return (int32_t)((USEC_PER_SEC / (vel * stepPerMM)) * 0.5f);
}

float delayToVel(uint32_t delay, float stepPerMM) {
  if (delay < 1) delay = 1;
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  return (float)((USEC_PER_SEC / (delay * 2.0f)) / stepPerMM);
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
  if (pMotor->cmd.step >= 0) {
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
  if (manualMode == HIGH) {
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
}

int32_t getMQTTCmd(String topic, String payload, struct sMotor* pMotors) {
  int32_t idx = 0;
  if (topic.equals(TOPIC_ROBOT_CMD_JOG_X)) {
    idx = MOTOR_X;
    setCmdPulse((pMotors + idx), payload.toFloat());
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_Y)) {
    idx = MOTOR_Y;
    setCmdPulse((pMotors + idx), payload.toFloat());
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_Z)) {
    idx = MOTOR_Z;
    setCmdPulse((pMotors + idx), payload.toFloat());
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_FORK)) {
  } else if (topic.equals(TOPIC_ROBOT_CMD_JOG_VEL)) {
    float vel = payload.toFloat();
    int32_t delay = 1;
    for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
      int32_t delay = velToDelay(vel, (pMotors + i)->cfg.stepPerMM);
      (pMotors + i)->cmd.delay = delay;
    }
    client.publish(TOPIC_ROBOT_STATUS_JOG_VEL,
                   String(delayToVel(delay, (pMotors + MOTOR_X)->cfg.stepPerMM),
                          DECIMAL_PLACE)
                       .c_str());
  } else if (topic.equals(TOPIC_ROBOT_CMD_STOP)) {
    if (payload.equals(PAYLOAD_TRUE)) {
      for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
        (pMotors + i)->cmd.step = (pMotors + i)->status.step;
      }
    }
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_X)) {
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_Y)) {
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_Z)) {
  } else if (topic.equals(TOPIC_ROBOT_CMD_HOME_FORK)) {
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

void messageReceived(String& topic, String& payload) {
#ifdef SERIAL_DEBUG
  Serial.println("topic " + topic + " - " + payload);
#endif
  if (manualMode == LOW) {
    if (getMQTTCmd(topic, payload, motors) < 0) {
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

void connect() {
#ifdef SERIAL_DEBUG
  Serial.print("connecting to broker...");
#endif
  while (!client.connect(CLIENT_ID, CLIENT_USERNAME, CLIENT_PASSWORD)) {
#ifdef SERIAL_DEBUG
    Serial.print(".");
#endif
    delay(CONNECT_RETRY_INTERERVAL);
  }
#ifdef SERIAL_DEBUG
  Serial.println("\nconnected!");
#endif
  client.subscribe(TOPIC_SUBSCRIBE);
  PUBLISH_MSG("topic robot/cmd/# subscribed");
}

void setPinsMode(uint8_t* pPins, uint8_t mode) {
  for (uint8_t* pPin = pPins; *pPin != 0; pPin++) {
    pinMode(*pPin, mode);
  }
}

void setup() {
#ifdef SERIAL_DEBUG
  Serial.begin(SERIAL_BAUDRATE);
#endif
  uint8_t outputPins[] = {MOTOR_X_ENA_PIN, MOTOR_X_DIR_PIN,
                          MOTOR_X_PUL_PIN, MOTOR_Y_ENA_PIN,
                          MOTOR_Y_DIR_PIN, MOTOR_Y_PUL_PIN,
                          MOTOR_Z_ENA_PIN, MOTOR_Z_DIR_PIN,
                          MOTOR_Z_PUL_PIN, 0};
  uint8_t inputPins[] = {MANUAL_ENA_PIN, MANUAL_SEL_A_PIN, MANUAL_SEL_B_PIN,
                         MANUAL_DIR_PIN, 0};
  setPinsMode(outputPins, OUTPUT);
  setPinsMode(inputPins, INPUT);
  for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
    motors[i].status.step = 0;
    motors[i].status.targetReach = 0;
    motors[i].cfg.stepPerMM = DEFAULT_STEP_PER_MM;
  }
  motors[MOTOR_X].cfg.stepPin = MOTOR_X_PUL_PIN;
  motors[MOTOR_X].cfg.dirPin = MOTOR_X_DIR_PIN;
  motors[MOTOR_Y].cfg.stepPin = MOTOR_Y_PUL_PIN;
  motors[MOTOR_Y].cfg.dirPin = MOTOR_Y_DIR_PIN;
  motors[MOTOR_Z].cfg.stepPin = MOTOR_Z_PUL_PIN;
  motors[MOTOR_Z].cfg.dirPin = MOTOR_Z_DIR_PIN;
  digitalWrite(MOTOR_X_ENA_PIN, HIGH);
  digitalWrite(MOTOR_Y_ENA_PIN, HIGH);
  digitalWrite(MOTOR_Z_ENA_PIN, HIGH);
  digitalWrite(MOTOR_X_DIR_PIN, HIGH);
  digitalWrite(MOTOR_Y_DIR_PIN, HIGH);
  digitalWrite(MOTOR_Z_DIR_PIN, HIGH);
  Ethernet.begin(mac, ip);
  client.begin(broker, socket);
  client.onMessage(messageReceived);
  connect();
}

void loop() {
  client.loop();
  if (!client.connected()) {
    connect();
  }
  manualMode = digitalRead(MANUAL_ENA_PIN);
  if (getEdge(manualMode, lastManualMode) < 0) {
    client.publish(TOPIC_ROBOT_STATUS_MODE, PAYLOAD_REMOTE);
#ifdef SERIAL_DEBUG
    Serial.println("switch to remote mode");
#endif
  } else if (getEdge(manualMode, lastManualMode) > 0) {
    client.publish(TOPIC_ROBOT_STATUS_MODE, PAYLOAD_MANUAL);
#ifdef SERIAL_DEBUG
    Serial.println("switch to manual mode");
#endif
  } else {
    // do nothing
  }
  lastManualMode = manualMode;
  if (manualMode == HIGH) {
    getManualCmd(motors);
  }
  for (int32_t i = MOTOR_X; i < (MOTOR_Z + 1); i++) {
    controlTheMotor(motors[i]);
  }
  if (millis() - lastMillis > PUBLISH_INTERVAL) {
    lastMillis = millis();
    publishTheStatus(motors);
  }
}
