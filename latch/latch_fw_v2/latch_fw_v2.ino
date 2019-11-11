//#define SERIAL_DEBUG
//#define FULL
//#define INFO
//#define SERVO_ON_BEFORE_MOVED

#include <Ethernet.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Servo.h>

#define MOTOR_ARM 0
#define MOTOR_CVT 1
#define MOTOR_GATE 2
#define MOTOR_FAN 3
#define MOTOR_VIBRATOR 4

#define MOTOR_ARM_ENA_PIN 31
#define MOTOR_ARM_DIR_PIN 33
#define MOTOR_ARM_STEP_PIN 35
#define MOTOR_ARM_HOME_PIN 37
#define MOTOR_ARM_POS_LIMIT_PIN 39
#define MOTOR_ARM_NEG_LIMIT_PIN 41

#define MOTOR_CVT_ENA_PIN 43
#define MOTOR_CVT_DIR_PIN 45
#define MOTOR_CVT_STEP_PIN 47
#define MOTOR_CVT_HOME_PIN 49
#define MOTOR_CVT_POS_LIMIT_PIN 51
#define MOTOR_CVT_NEG_LIMIT_PIN 53

#define MOTOR_GATE_PIN 22
#define MOTOR_FAN_PIN 24
#define MOTOR_VIBRATOR_PIN 26
#define ARM_SUCK_PIN 28
#define ARM_RELEASE_PIN 30
#define BOWL_READY_PIN 32
#define BOWL_CNT_PIN 1  // analog

#define TOPIC_SUBSCRIBE "latch/cmd/#"

#define TOPIC_LATCH_CMD_VIBRATION "latch/cmd/vibration"  // string, true/false
#define TOPIC_LATCH_CMD_GATE_OPEN "latch/cmd/gate/open"  // string, true/false
#define TOPIC_LATCH_CMD_FAN_OPEN "latch/cmd/fan/open"    // string, true/false
#define TOPIC_LATCH_CMD_ARM_POS "latch/cmd/arm/pos"      // string, float, mm
#define TOPIC_LATCH_CMD_ARM_VEL "latch/cmd/arm/vel"      // string, float, mm/s
#define TOPIC_LATCH_CMD_ARM_HOME "latch/cmd/arm/home"    // string, true/false
#define TOPIC_LATCH_CMD_ARM_STOP "latch/cmd/arm/stop"    // string, true/false
#define TOPIC_LATCH_CMD_ARM_SUCK "latch/cmd/arm/suck"    // string, true/false
#define TOPIC_LATCH_CMD_CVT_POS "latch/cmd/cvt/pos"      // string, float, mm
#define TOPIC_LATCH_CMD_CVT_VEL "latch/cmd/cvt/vel"      // string, float, mm/s
#define TOPIC_LATCH_CMD_CVT_HOME "latch/cmd/cvt/home"    // string, true/false
#define TOPIC_LATCH_CMD_CVT_STOP "latch/cmd/cvt/stop"    // string, true/false
#define TOPIC_LATCH_CMD_CVT_SUCK "latch/cmd/cvt/suck"    // string, true/false
#define TOPIC_LATCH_CMD_PAR_ARM_PITCH \
  "latch/cmd/par/arm/pitch"  // string,
                             // float
#define TOPIC_LATCH_CMD_PAR_CVT_PITCH \
  "latch/cmd/par/cvt/pitch"  // string,
                             // float

#define TOPIC_LATCH_STATUS_ALARM "latch/status/alarm"        // string, normal
#define TOPIC_LATCH_STATUS_BOWL_CNT "latch/status/bowl/cnt"  // string, int
#define TOPIC_LATCH_STATUS_BOWL_READY \
  "latch/status/bowl/ready"  // string, true/false
#define TOPIC_LATCH_STATUS_VIBRATION \
  "latch/status/vibration"  // string, true/false
#define TOPIC_LATCH_STATUS_GATE_OPEN \
  "latch/status/gate/open"  // string, true/false
#define TOPIC_LATCH_STATUS_FAN_OPEN \
  "latch/status/fan/open"                                  // string, true/false
#define TOPIC_LATCH_STATUS_ARM_POS "latch/status/arm/pos"  // string, float, mm
#define TOPIC_LATCH_STATUS_ARM_VEL \
  "latch/status/arm/vel"  // string, float,                          // mm/s
#define TOPIC_LATCH_STATUS_ARM_HOME \
  "latch/status/arm/home"  // string, true/false
#define TOPIC_LATCH_STATUS_ARM_STOP \
  "latch/status/arm/stop"  // string, true/false
#define TOPIC_LATCH_STATUS_ARM_SUCK \
  "latch/status/arm/suck"                                  // string, true/false
#define TOPIC_LATCH_STATUS_CVT_POS "latch/status/cvt/pos"  // string, float, mm
#define TOPIC_LATCH_STATUS_CVT_VEL \
  "latch/status/cvt/vel"  // string, float,
                          // mm/s
#define TOPIC_LATCH_STATUS_CVT_HOME \
  "latch/status/cvt/home"  // string, true/false
#define TOPIC_LATCH_STATUS_CVT_STOP \
  "latch/status/cvt/stop"  // string, true/false
#define TOPIC_LATCH_STATUS_PAR_ARM_PITCH \
  "latch/status/par/arm/pitch"  // string, float
#define TOPIC_LATCH_STATUS_PAR_CVT_PITCH \
  "latch/status/par/cvt/pitch"  // string, float

#define PAYLOAD_TRUE "true"
#define PAYLOAD_FALSE "false"
#define PAYLOAD_REMOTE "remote"
#define PAYLOAD_MANUAL "manual"
#define PAYLOAD_NORMAL "normal"
#define PAYLOAD_UNKNOWN_TOPIC "unknown topic or payload"
#define PUBLISH_MSG(msg) client.publish(TOPIC_LATCH_STATUS_ALARM, msg)
#define PUBLISH_NORMAL PUBLISH_MSG(PAYLOAD_NORMAL)

#define USEC_PER_SEC 1000000
#define SERIAL_BAUDRATE 9600
#define CONNECT_RETRY_INTERERVAL 1000  // ms
#define PUBLISH_INTERVAL 500           // ms
#define MAX_DELAY 10000                // us
#define MIN_DELAY 200                  // us
#define STOP_MOVING_THRESHOLD 9900     // us
#define CLIENT_ID "latchV2"
#define CLIENT_USERNAME "try"
#define CLIENT_PASSWORD "try"
#define DECIMAL_PLACE 3
#define MAX_RETRY 3
#define MOTOR_HOMING_VEL 500
#define DEFAULT_STEP_PER_MM 28
#define DEFAULT_STEP_PER_MM_ARM 28
#define DEFAULT_STEP_PER_MM_CVT 28
#define MOTOR_GATE_HOME_POS 0
#define MAX_BOWL_CNT 128

const byte mac[] = {0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED};
const IPAddress ip(172, 16, 228, 9);
const IPAddress server(172, 16, 228, 2);  // pi 99 laptop 19

enum eMotorType { STEPPER, RC_SERVOR, IO };

struct sMotorPinCfg {
  enum eMotorType type;
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
  Servo rcServo;
};

EthernetClient ethClient;
PubSubClient client(ethClient);
unsigned long lastMillis = 0;
struct sMotor motors[5];

void genFreqAtPin(uint8_t pin, uint32_t delay) {
  digitalWrite(pin, HIGH);
  delayMicroseconds(delay);
  digitalWrite(pin, LOW);
  delayMicroseconds(delay);
}

void controlTheMotor(struct sMotor& motor) {
  switch (motor.cfg.type) {
    default:
      break;
    case STEPPER: {
      if (motor.cmd.home == true) {
        int32_t homeReached = digitalRead(motor.cfg.homePin);
        if (homeReached == HIGH) {
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
        if (motor.cmd.dir == HIGH) {
          if (motor.status.step < motor.cmd.step) {
#if defined(SERIAL_DEBUG) && defined(FULL)
      Serial.print("motor.status.step: ");
      Serial.println(motor.status.step);
      Serial.print("motor.cmd.step: ");
      Serial.println(motor.cmd.step);
      Serial.print("motor.cmd.delay: ");
      Serial.println(motor.cmd.delay);
#endif
            motor.status.targetReach = false;
          } else {
            motor.status.targetReach = true;
          }
        } else {
          if (motor.status.step > motor.cmd.step) {
#if defined(SERIAL_DEBUG) && defined(FULL)
      Serial.print("motor.status.step: ");
      Serial.println(motor.status.step);
      Serial.print("motor.cmd.step: ");
      Serial.println(motor.cmd.step);
      Serial.print("motor.cmd.delay: ");
      Serial.println(motor.cmd.delay);
#endif
            motor.status.targetReach = false;
          } else {
            motor.status.targetReach = true;
          }
        }
      }
      if (motor.status.targetReach == false) {
#ifdef SERVO_ON_BEFORE_MOVED
        digitalWrite(motor.cfg.enaPin, HIGH);
#endif
        digitalWrite(motor.cfg.dirPin, motor.cmd.dir);
        genFreqAtPin(motor.cfg.stepPin, motor.cmd.delay);
        if (motor.cmd.dir == HIGH) {
          motor.status.step++;
        } else {
          motor.status.step--;
        }
      } else {
#ifdef SERVO_ON_BEFORE_MOVED
        digitalWrite(motor.cfg.enaPin, LOW);
#endif
      }
    } break;
    case RC_SERVOR: {
#if defined(SERIAL_DEBUG) && defined(FULL)
if(motor.cmd.step != motor.status.step){
      Serial.print("rc servo cmd: ");
      Serial.println(motor.cmd.step);
}
#endif
//      motor.rcServo.write(motor.cmd.step); // keep writing will cause servo not moving, dont know why
      motor.status.step = motor.cmd.step;
    } break;
    case IO: {
      digitalWrite(motor.cfg.stepPin, !motor.cmd.step);
      motor.status.step = motor.cmd.step;
    } break;
  }
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

float delayToVel(uint32_t delay, float stepPerMM) {
  if (delay < 1) delay = 1;
  if (stepPerMM < 0.0f) stepPerMM = 1.0f;
  float temp = ((USEC_PER_SEC / (delay * 2.0f)) / stepPerMM);
  return temp;
}

void setCmdPulse(struct sMotor* pMotor, float step) {
  pMotor->cmd.step = posToStep(step, pMotor->cfg.stepPerMM);
  if ((pMotor->status.step - pMotor->cmd.step) <= 0) {
    pMotor->cmd.dir = HIGH;
  } else {
    pMotor->cmd.dir = LOW;
  }
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

void publishTheStatus() {
  if (motors[MOTOR_ARM].status.targetReach == true) {
    client.publish(TOPIC_LATCH_STATUS_ARM_STOP, PAYLOAD_TRUE);
  } else {
    client.publish(TOPIC_LATCH_STATUS_ARM_STOP, PAYLOAD_FALSE);
  }

  if (motors[MOTOR_CVT].status.targetReach == true) {
    client.publish(TOPIC_LATCH_STATUS_CVT_STOP, PAYLOAD_TRUE);
  } else {
    client.publish(TOPIC_LATCH_STATUS_CVT_STOP, PAYLOAD_FALSE);
  }

  motors[MOTOR_ARM].status.lastTargetReach =
      motors[MOTOR_ARM].status.targetReach;
  motors[MOTOR_CVT].status.lastTargetReach =
      motors[MOTOR_CVT].status.targetReach;

  motors[MOTOR_ARM].status.pos =
      stepToPos(motors[MOTOR_ARM].status.step, motors[MOTOR_ARM].cfg.stepPerMM);
  motors[MOTOR_CVT].status.pos =
      stepToPos(motors[MOTOR_CVT].status.step, motors[MOTOR_CVT].cfg.stepPerMM);

  client.publish(TOPIC_LATCH_STATUS_ARM_POS,
                 String(motors[MOTOR_ARM].status.pos, DECIMAL_PLACE).c_str());
  client.publish(TOPIC_LATCH_STATUS_CVT_POS,
                 String(motors[MOTOR_CVT].status.pos, DECIMAL_PLACE).c_str());

  client.publish(TOPIC_LATCH_STATUS_ARM_HOME,
                 motors[MOTOR_ARM].status.home ? PAYLOAD_TRUE : PAYLOAD_FALSE);
  client.publish(TOPIC_LATCH_STATUS_CVT_HOME,
                 motors[MOTOR_CVT].status.home ? PAYLOAD_TRUE : PAYLOAD_FALSE);

  client.publish(TOPIC_LATCH_STATUS_GATE_OPEN,
                 motors[MOTOR_GATE].status.step ? PAYLOAD_TRUE : PAYLOAD_FALSE);
  client.publish(TOPIC_LATCH_STATUS_FAN_OPEN,
                 motors[MOTOR_FAN].status.step ? PAYLOAD_TRUE : PAYLOAD_FALSE);
  client.publish(
      TOPIC_LATCH_STATUS_VIBRATION,
      motors[MOTOR_VIBRATOR].status.step ? PAYLOAD_TRUE : PAYLOAD_FALSE);

  uint8_t bowlReady = digitalRead(BOWL_READY_PIN);
  client.publish(TOPIC_LATCH_STATUS_BOWL_READY,
                 bowlReady ? PAYLOAD_TRUE : PAYLOAD_FALSE);

  int32_t bowlCnt = map(analogRead(BOWL_CNT_PIN), 0, 1023, MAX_BOWL_CNT, 0);
  client.publish(TOPIC_LATCH_STATUS_BOWL_CNT, String(bowlCnt, 10).c_str());
}

void setArmSuck(String en) {
  if (en == "true") {
    digitalWrite(ARM_SUCK_PIN, HIGH);
    delay(1000);
    digitalWrite(ARM_RELEASE_PIN, LOW);
  } else {
    digitalWrite(ARM_SUCK_PIN, LOW);
    delay(1000);
    digitalWrite(ARM_RELEASE_PIN, HIGH);
    delay(5000);
    digitalWrite(ARM_RELEASE_PIN, LOW);
  }
}

int32_t getMQTTCmd(String topic, String payload, struct sMotor* pMotors) {
  int32_t ret = 0;
  if (topic.equals(TOPIC_LATCH_CMD_VIBRATION)) {
    if (payload == "true") {
      (pMotors + MOTOR_VIBRATOR)->cmd.step = HIGH;
    } else {
      (pMotors + MOTOR_VIBRATOR)->cmd.step = LOW;
    }
  } else if (topic.equals(TOPIC_LATCH_CMD_GATE_OPEN)) {
    if (payload == "true") {
      (pMotors + MOTOR_GATE)->cmd.step = 0;
    } else {
      (pMotors + MOTOR_GATE)->cmd.step = 90;
    }
    (pMotors + MOTOR_GATE)->rcServo.write((pMotors + MOTOR_GATE)->cmd.step);
  } else if (topic.equals(TOPIC_LATCH_CMD_FAN_OPEN)) {
    if (payload == "true") {
      (pMotors + MOTOR_FAN)->cmd.step = HIGH;
    } else {
      (pMotors + MOTOR_FAN)->cmd.step = LOW;
    }
  } else if (topic.equals(TOPIC_LATCH_CMD_ARM_POS)) {
    setCmdPulse((pMotors + MOTOR_ARM), payload.toFloat());
  } else if (topic.equals(TOPIC_LATCH_CMD_ARM_VEL)) {
    (pMotors + MOTOR_ARM)->cmd.delay =
        velToDelay(payload.toFloat(), (pMotors + MOTOR_ARM)->cfg.stepPerMM);
    client.publish(TOPIC_LATCH_STATUS_ARM_VEL,
                   String(delayToVel((pMotors + MOTOR_ARM)->cmd.delay,
                                     (pMotors + MOTOR_ARM)->cfg.stepPerMM),
                          DECIMAL_PLACE)
                       .c_str());
  } else if (topic.equals(TOPIC_LATCH_CMD_ARM_HOME)) {
    (pMotors + MOTOR_ARM)->cmd.home = true;
  } else if (topic.equals(TOPIC_LATCH_CMD_ARM_STOP)) {
    (pMotors + MOTOR_ARM)->cmd.step = (pMotors + MOTOR_ARM)->status.step;
  } else if (topic.equals(TOPIC_LATCH_CMD_ARM_SUCK)) {
    setArmSuck(payload);
  } else if (topic.equals(TOPIC_LATCH_CMD_CVT_POS)) {
    setCmdPulse((pMotors + MOTOR_CVT), payload.toFloat());
  } else if (topic.equals(TOPIC_LATCH_CMD_CVT_VEL)) {
    (pMotors + MOTOR_CVT)->cmd.delay =
        velToDelay(payload.toFloat(), (pMotors + MOTOR_CVT)->cfg.stepPerMM);
    client.publish(TOPIC_LATCH_STATUS_CVT_VEL,
                   String(delayToVel((pMotors + MOTOR_CVT)->cmd.delay,
                                     (pMotors + MOTOR_CVT)->cfg.stepPerMM),
                          DECIMAL_PLACE)
                       .c_str());
  } else if (topic.equals(TOPIC_LATCH_CMD_CVT_HOME)) {
    (pMotors + MOTOR_CVT)->cmd.home = true;
  } else if (topic.equals(TOPIC_LATCH_CMD_CVT_STOP)) {
    (pMotors + MOTOR_CVT)->cmd.step = (pMotors + MOTOR_CVT)->status.step;
  } else if (topic.equals(TOPIC_LATCH_CMD_PAR_ARM_PITCH)) {
    setStepPerMM((pMotors + MOTOR_ARM), payload.toFloat());
    client.publish(
        TOPIC_LATCH_STATUS_PAR_ARM_PITCH,
        String((pMotors + MOTOR_ARM)->status.stepPerMM, DECIMAL_PLACE).c_str());
  } else if (topic.equals(TOPIC_LATCH_CMD_PAR_CVT_PITCH)) {
    setStepPerMM((pMotors + MOTOR_CVT), payload.toFloat());
    client.publish(
        TOPIC_LATCH_STATUS_PAR_CVT_PITCH,
        String((pMotors + MOTOR_CVT)->status.stepPerMM, DECIMAL_PLACE).c_str());
  } else {
    ret = -1;
  }
  return ret;
}

void messageReceived(char* topic, byte* payload, unsigned int length) {
  String myTopic = String((char*)topic);
  String myPayload = String((char*)payload);
  String msg = charToStringJ(payload, length);
#if defined(SERIAL_DEBUG) && defined(FULL)
  Serial.println("----Message arrived!----");
  Serial.print("topic: ");
  Serial.println(topic);
  Serial.print("message: ");
  Serial.println(msg);
  Serial.println("------------------------");
#endif
  if (getMQTTCmd(myTopic, msg, motors) < 0) {
    PUBLISH_MSG(PAYLOAD_UNKNOWN_TOPIC);
#if defined(SERIAL_DEBUG) && defined(FULL)
    Serial.println(PAYLOAD_UNKNOWN_TOPIC);
#endif
  } else {
    PUBLISH_NORMAL;
#if defined(SERIAL_DEBUG) && defined(FULL)
    Serial.println(PAYLOAD_NORMAL);
#endif
  }
}

void setPinsMode(uint8_t* pPins, uint8_t mode) {
  for (uint8_t* pPin = pPins; *pPin != 0; pPin++) {
    pinMode(*pPin, mode);
  }
}

void setPinsValue(uint8_t* pPins) {
  for (uint8_t* pPin = pPins; *pPin != 0; pPin += 2) {
    digitalWrite(*pPin, *(pPin + 1));
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
#if defined(SERIAL_DEBUG)
  Serial.begin(SERIAL_BAUDRATE);
#endif
  uint8_t outputPins[] = {MOTOR_ARM_ENA_PIN,
                          MOTOR_ARM_DIR_PIN,
                          MOTOR_ARM_STEP_PIN,
                          MOTOR_CVT_ENA_PIN,
                          MOTOR_CVT_DIR_PIN,
                          MOTOR_CVT_STEP_PIN,
                          MOTOR_FAN_PIN,
                          MOTOR_VIBRATOR_PIN,
                          ARM_SUCK_PIN,
                          ARM_RELEASE_PIN,
                          0};
  uint8_t inputPins1[] = {MOTOR_ARM_HOME_PIN, MOTOR_CVT_HOME_PIN,
                          BOWL_READY_PIN, 0};
  uint8_t inputPins2[] = {BOWL_CNT_PIN, 0};
  uint8_t outputPinsValue[] = {ARM_SUCK_PIN,
                               LOW,
                               ARM_RELEASE_PIN,
                               LOW,
                               MOTOR_FAN_PIN,
                               LOW,
                               MOTOR_VIBRATOR_PIN,
                               LOW,
                               0};
  setPinsMode(outputPins, OUTPUT);
  setPinsMode(inputPins1, INPUT_PULLUP);
  setPinsMode(inputPins2, INPUT);
  setPinsValue(outputPinsValue);

  motors[MOTOR_ARM].cfg.type = STEPPER;
  motors[MOTOR_ARM].cfg.enaPin = MOTOR_ARM_ENA_PIN;
  motors[MOTOR_ARM].cfg.stepPin = MOTOR_ARM_STEP_PIN;
  motors[MOTOR_ARM].cfg.dirPin = MOTOR_ARM_DIR_PIN;
  motors[MOTOR_ARM].cfg.posLimitPin = MOTOR_ARM_POS_LIMIT_PIN;
  motors[MOTOR_ARM].cfg.negLimitPin = MOTOR_ARM_NEG_LIMIT_PIN;
  motors[MOTOR_ARM].cfg.homePin = MOTOR_ARM_HOME_PIN;
  motors[MOTOR_ARM].cfg.stepPerMM = DEFAULT_STEP_PER_MM_ARM;

  motors[MOTOR_CVT].cfg.type = STEPPER;
  motors[MOTOR_CVT].cfg.enaPin = MOTOR_CVT_ENA_PIN;
  motors[MOTOR_CVT].cfg.stepPin = MOTOR_CVT_STEP_PIN;
  motors[MOTOR_CVT].cfg.dirPin = MOTOR_CVT_DIR_PIN;
  motors[MOTOR_CVT].cfg.posLimitPin = MOTOR_CVT_POS_LIMIT_PIN;
  motors[MOTOR_CVT].cfg.negLimitPin = MOTOR_CVT_NEG_LIMIT_PIN;
  motors[MOTOR_CVT].cfg.homePin = MOTOR_CVT_HOME_PIN;
  motors[MOTOR_CVT].cfg.stepPerMM = DEFAULT_STEP_PER_MM_CVT;

  motors[MOTOR_GATE].cfg.type = RC_SERVOR;
  motors[MOTOR_GATE].cfg.stepPin = MOTOR_GATE_PIN;

  motors[MOTOR_FAN].cfg.type = IO;
  motors[MOTOR_FAN].cfg.stepPin = MOTOR_FAN_PIN;

  motors[MOTOR_VIBRATOR].cfg.type = IO;
  motors[MOTOR_VIBRATOR].cfg.stepPin = MOTOR_VIBRATOR_PIN;

  for (int32_t i = MOTOR_ARM; i < (MOTOR_VIBRATOR + 1); i++) {
    switch (motors[i].cfg.type) {
      default:
        break;
      case STEPPER: {
        motors[i].cfg.homingDir = HIGH;
        digitalWrite(motors[i].cfg.dirPin, HIGH);
#ifndef SERVO_ON_BEFORE_MOVED
        digitalWrite(motors[i].cfg.enaPin, HIGH);
#endif
        digitalWrite(motors[i].cfg.stepPin, LOW);
        //motors[i].cmd.home = true;
      } break;
      case RC_SERVOR: {
        motors[i].rcServo.attach(motors[i].cfg.stepPin);
      } break;
    }
  }

  Ethernet.begin(mac, ip);
  client.setServer(server, 1883);
  delay(1000);
  reconnect();

  //   motors[MOTOR_GATE].rcServo.write(MOTOR_GATE_HOME_POS);

  //   while (1) {
  //     for (int32_t i = MOTOR_ARM; i < (MOTOR_CVT + 1); i++) {
  //       controlTheMotor(motors[i]);
  //     }
  //     if (motors[MOTOR_ARM].status.home == true &&
  //         motors[MOTOR_CVT].status.home == true)
  //       break;
  //   }
}

void reconnect() {
  int i = 0;
  while (!client.connected()) {
    if (client.connect(CLIENT_ID)) {
#if defined(SERIAL_DEBUG) && defined(FULL)
      Serial.println("connected");
#endif
      client.setCallback(messageReceived);
      client.subscribe(TOPIC_SUBSCRIBE);
    } else {
#if defined(SERIAL_DEBUG) && defined(FULL)
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
#endif
      delay(500);
    }
    if (i++ > MAX_RETRY) break;
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  for (int32_t i = MOTOR_ARM; i < (MOTOR_VIBRATOR + 1); i++) {
    controlTheMotor(motors[i]);
  }
  if (millis() - lastMillis > PUBLISH_INTERVAL) {
    lastMillis = millis();
    publishTheStatus();
  }
}
