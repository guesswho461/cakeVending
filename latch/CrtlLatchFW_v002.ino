#include <Ethernet.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Servo.h>
#include <math.h>
#include <string.h>

int Index;
Servo gateServo;

// Step motor para
int Speed_count = 25000;
int Speed_time = 10;
float RoundNum = 4;
double RoundCircle = 0.0;

// Pin define
#define _servoOpenGate 3

#define _Arm_pulse 4
#define _Cvt_pulse 5

#define _openDoor 22  ////

#define _Arm_direct 36
#define _Arm_enable 37

#define _Cvt_direct 38
#define _Cvt_enable 39

#define _Cvt_home 40
#define _Arm_home 41
#define _BowCnt 42

#define _Arm_suck 46
#define _Arm_release 47
#define _openFan 48
#define _vibration 49

#define _modCtr1 50

int CtrlMode = 0;

// 設定MAC（實體）位址
const byte mac[] = {0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED};
// 設定用戶端和伺服器的IP位址，請自行修改成你的設備的IP位址。
const IPAddress ip(192, 168, 1, 29);
const IPAddress server(192, 168, 1, 19);

// 設定用戶端ID
const char clientID[] = "Latch";
// 設定主題名稱
const char latch_topic[] = "latch/#";
const int topicNum = 30;
const int topicLength = 50;
// cmd->sub para->sub&pub status->pub
// const char cmd_topic="bucket/cmd/#";
const char topic_list[topicNum][topicLength] = {
    {"latch/cmd/openDoor"},    {"latch/cmd/vibration"},
    {"latch/cmd/openGate"},    {"latch/cmd/openFan"},
    {"latch/cmd/Arm/pos"},     {"latch/cmd/Arm/home"},
    {"latch/cmd/Arm/suck"},    {"latch/cmd/Cvt/pos"},
    {"latch/cmd/Cvt/home"},    {"latch/cmd/para/Arm/pitch"},

    {"latch/status/alarm"},    {"latch/status/bowCnt"},
    {"latch/status/openDoor"}, {"latch/status/vibration"},
    {"latch/status/openGate"}, {"latch/status/openFan"},
    {"latch/status/Arm/pos"},  {"latch/status/Arm/home"},
    {"latch/status/Arm/suck"}, {"latch/status/Cvt/pos"},
    {"latch/status/Cvt/home"}, {"latch/status/para/rArm/pitch"}};

// 儲存訊息的字串變數
String msgStr = "";
// 儲存字元陣列格式的訊息字串（參閱下文說明）
char json[25];

int initial_flag = 0;

EthernetClient ethClient;        // 建立乙太網路前端物件
PubSubClient client(ethClient);  // 基於乙太網路物件，建立MQTT前端物件

unsigned long DistSensInterval = 15000;  // 1min
unsigned long time;
unsigned long lasttime = 0;

int status_alarm = 0;
int status_bowCnt = 0;
bool status_openDoor = false;
bool status_vibration = false;
bool status_openGate = false;
bool status_openFan = false;
float status_ArmPos = 0;
bool status_ArmHome = false;
float status_ArmLen = 0;
bool status_ArmSuck = false;

void setup() {
  pinMode(_modCtr1, INPUT_PULLUP);

  pinMode(_Arm_suck, OUTPUT);
  digitalWrite(_Arm_suck, LOW);

  pinMode(_Arm_release, OUTPUT);
  digitalWrite(_Arm_release, LOW);

  pinMode(_Arm_pulse, OUTPUT);
  pinMode(_Arm_direct, OUTPUT);

  pinMode(_openFan, OUTPUT);
  digitalWrite(_openFan, LOW);
  pinMode(_vibration, OUTPUT);
  digitalWrite(_vibration, LOW);

  pinMode(_openDoor, OUTPUT);
  digitalWrite(_openDoor, LOW);

  pinMode(_Cvt_pulse, OUTPUT);
  pinMode(_Cvt_direct, OUTPUT);

  pinMode(_Cvt_home, INPUT_PULLUP);
  pinMode(_Arm_home, INPUT_PULLUP);
  pinMode(_BowCnt, INPUT);

  pinMode(_Arm_enable, OUTPUT);
  pinMode(_Cvt_enable, OUTPUT);

  gateServo.attach(_servoOpenGate);
  gateServo.write(90);

  SetRelHome("c");
  delay(2000);

  Serial.println("Initilal Finish");

  Ethernet.begin(mac, ip);
  // 設定MQTT代理人的網址和埠號
  client.setServer(server, 1883);
  // 留點時間給乙太網路卡進行初始化
  delay(1500);
  reconnect();

  Serial.begin(9600);
  Serial.println("Ready!");
}

void loop() {
  // 更新用戶端狀態
  client.loop();
  delay(1000);

  // 若沒有連上，則重連。
  if (!client.connected()) reconnect();

  if (digitalRead(_modCtr1) == LOW)  // Auto mode
  {
    if (CtrlMode == 0) {
#ifdef SERIAL_DEBUG_FULL
      Serial.println("Auto mode");
#endif
      CtrlMode = 1;
    }

    ///取碗軸身長至取碗位置
    Speed_time = 7;
    RoundCircle = 0.68;
    SetRelPos(RoundCircle, Speed_time, "a");
    delay(500);

    ///真空吸取紙碗
    SetArmSuck("true");
    delay(2000);

    ///取碗軸向下取下紙碗
    RoundCircle = 0.56;
    SetRelPos(-1 * RoundCircle, Speed_time, "a");
    delay(500);

    ///真空釋放紙碗
    SetArmSuck("false");

    ///取碗軸縮回原位
    RoundCircle = 0.122;
    SetRelPos(-1 * RoundCircle, Speed_time, "a");
    delay(2000);

    /// CVT將紙碗移動到出料位置
    Speed_time = 3;
    RoundCircle = 1.0;
    SetRelPos(-1 * RoundCircle, Speed_time, "c");
    delay(2000);

    //////////////////////////////////////
    ///開啟散熱風扇
    SetOpenFan("true");
    delay(2000);

    ///開始震動出料桶
    SetVibration("true");
    delay(500);

    ///打開出料閘門
    SetOpenGate("true");
    delay(3000);

    ///停止震動出料桶
    SetVibration("false");
    delay(500);

    ///關閉出料閘門
    SetOpenGate("false");
    delay(500);

    ///關閉散熱風扇
    SetOpenFan("false");
    delay(500);
    //////////////////////////////////////

    ///將CVT移動到準備位置
    SetRelPos(RoundCircle, Speed_time, "c");
    delay(2000);

  } else {
    if (CtrlMode == 1) {
#ifdef SERIAL_DEBUG_FULL
      Serial.println("MQTT mode");
#endif
      CtrlMode = 0;
    }
  }

  // Update Status-------------
  time = millis();  // get目前arduino時間數值，單位ms
  if ((time - lasttime) > DistSensInterval) {
    publishMessage(14, String(status_alarm));
    publishMessage(15, String(status_bowCnt));
    publishMessage(16, String(status_openDoor));
    publishMessage(17, String(status_vibration));
    publishMessage(18, String(status_openGate));
    publishMessage(19, String(status_openFan));
    publishMessage(20, String(status_ArmPos));
    publishMessage(21, String(status_ArmHome));
    publishMessage(22, String(status_ArmLen));
    publishMessage(23, String(status_ArmSuck));

    lasttime = time;  // update timestamp
  }
}

void reconnect() {
  // 若目前沒有和伺服器相連，則反覆執行直到連結成功…
  while (!client.connected()) {
    // 指定用戶端ID並連結MQTT伺服器
    if (client.connect(clientID) == 1) {
      // 若連結成功，在序列埠監控視窗顯示「已連線」。
#ifdef SERIAL_DEBUG_INFO || SERIAL_DEBUG_FULL
      Serial.println("re-connected");
#endif
      //重新設定訂閱
      client.setCallback(callback);
      client.subscribe(latch_topic);
    } else {
      // 若連線不成功，則顯示錯誤訊息
#ifdef SERIAL_DEBUG_INFO || SERIAL_DEBUG_FULL
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
#endif
      // 等候5秒，再重新嘗試連線。
      delay(500);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  if (CtrlMode == 0) {
    String msg = charToStringJ(payload, length);
#ifdef SERIAL_DEBUG_FULL
    Serial.println("----Message arrived!----");
    Serial.print("topic:");
    Serial.println(topic);
    Serial.print("Message:");
    Serial.println(msg);
    Serial.println("------------------------");
#endif

    if (strcmp(topic, topic_list[0]) == 0)  /// openDoor
    {
      if (msg.equalsIgnoreCase("true"))
        SetOpenDoor("true");
      else
        SetOpenDoor("false");
    } else if (strcmp(topic, topic_list[1]) == 0)  /// vibration
    {
      if (msg.equalsIgnoreCase("true"))
        SetVibration("true");
      else
        SetVibration("false");
    } else if (strcmp(topic, topic_list[2]) == 0)  /// openGate
    {
      if (msg.equalsIgnoreCase("true"))
        SetOpenGate("true");
      else
        SetOpenGate("false");
    } else if (strcmp(topic, topic_list[3]) == 0)  /// openFan
    {
      Serial.print("openFan:");
      if (msg.equalsIgnoreCase("true")) {
        SetOpenFan("true");
#ifdef SERIAL_DEBUG_INFO || SERIAL_DEBUG_FULL
        Serial.println("On");
#endif
      } else {
        SetOpenFan("false");
#ifdef SERIAL_DEBUG_INFO || SERIAL_DEBUG_FULL
        Serial.println("Off");
#endif
      }
    } else if (strcmp(topic, topic_list[4]) == 0)  /// Arm_pos
    {
      float vol = msg.toFloat();
      SetRelPos(vol, 10, "r");
    } else if (strcmp(topic, topic_list[5]) == 0)  /// Arm_home
    {
      if (msg.equalsIgnoreCase("true")) SetRelHome("r");
    } else if (strcmp(topic, topic_list[6]) == 0)  /// Arm_suck"
    {
      if (msg.equalsIgnoreCase("true")) {
        SetArmSuck("true");
      } else {
        SetArmSuck("false");
      }
    } else if (strcmp(topic, topic_list[7]) == 0)  /// Cvt_pos
    {
      float vol = msg.toFloat();
      SetRelPos(vol, 3, "c");
    } else if (strcmp(topic, topic_list[8]) == 0)  /// Cvt_home
    {
      if (msg.equalsIgnoreCase("true")) SetRelHome("c");
    }
  }
}

void publishMessage(int topicNum, String msgStr) {
  // 建立MQTT訊息
  char msgChar[10];
  // 把String字串轉換成字元陣列格式
  msgStr.toCharArray(msgChar, 10);
  // 發布MQTT主題與訊息
  client.publish(topic_list[topicNum], msgChar);
}

void SetRelServoPos(float pos, String arm) {
  if (pos > 180) pos = 180;
  if (pos < 0) pos = 0;

  gateServo.write(pos);
}

void SetRelPos(float roundCircle, int speedNow, String arm) {
  int _arm_enable = _Arm_enable;
  int _arm_pulse = _Arm_pulse;
  int _arm_direct = _Arm_direct;

  if (arm == "c") {
    _arm_enable = _Cvt_enable;
    _arm_pulse = _Cvt_pulse;
    _arm_direct = _Cvt_direct;
  }

  if (roundCircle >= 0)
    digitalWrite(_arm_direct, HIGH);
  else {
    digitalWrite(_arm_direct, LOW);
    roundCircle = roundCircle * -1;
  }

  if (arm == "c" & roundCircle > 1) roundCircle = 1;

  int Max = floor(RoundNum * roundCircle);
  float Min = (RoundNum * roundCircle) - Max;

  digitalWrite(_arm_enable, HIGH);
  for (int t = 0; t < Max; t++) {
    for (Index = 0; Index < Speed_count; Index++) {
      digitalWrite(_arm_pulse, HIGH);
      delayMicroseconds(speedNow);
      digitalWrite(_arm_pulse, LOW);
      delayMicroseconds(speedNow);
    }
    delay(5);
  }
  for (Index = 0; Index < Speed_count * Min; Index++) {
    digitalWrite(_arm_pulse, HIGH);
    delayMicroseconds(speedNow);
    digitalWrite(_arm_pulse, LOW);
    delayMicroseconds(speedNow);
  }
  digitalWrite(_arm_enable, LOW);
}

void SetRelHome(String arm) {
  int _arm_enable = _Arm_enable;
  int _arm_pulse = _Arm_pulse;
  int _arm_direct = _Arm_direct;
  int _checkHome = _Arm_home;

  if (arm == "c") {
    _arm_enable = _Cvt_enable;
    _arm_pulse = _Cvt_pulse;
    _arm_direct = _Cvt_direct;
    _checkHome = _Cvt_home;
    digitalWrite(_arm_direct, HIGH);
  } else
    digitalWrite(_arm_direct, LOW);

  digitalWrite(_arm_enable, HIGH);
  while (digitalRead(_checkHome) == HIGH) {
    digitalWrite(_arm_pulse, HIGH);
    delayMicroseconds(10);
    digitalWrite(_arm_pulse, LOW);
    delayMicroseconds(10);
  }
#ifdef SERIAL_DEBUG_INFO || SERIAL_DEBUG_FULL
  Serial.println("Home OK");
#endif
  digitalWrite(_arm_enable, LOW);
}

void SetOpenDoor(String en) {
  if (en == "true")
    digitalWrite(_openDoor, HIGH);
  else
    digitalWrite(_openDoor, LOW);
}

void SetOpenFan(String en) {
  if (en == "true")
    digitalWrite(_openFan, HIGH);
  else
    digitalWrite(_openFan, LOW);
}

void SetVibration(String en) {
  if (en == "true")
    digitalWrite(_vibration, HIGH);
  else
    digitalWrite(_vibration, LOW);
}

void SetArmSuck(String en) {
  if (en == "true") {
    digitalWrite(_Arm_suck, HIGH);
    delay(100);
    digitalWrite(_Arm_release, LOW);
  } else {
    digitalWrite(_Arm_suck, LOW);
    delay(100);
    digitalWrite(_Arm_release, HIGH);
    delay(500);
    digitalWrite(_Arm_release, LOW);
  }
}

void SetOpenGate(String en) {
  if (en == "true")
    gateServo.write(0);
  else
    gateServo.write(90);
}

String charToStringJ(const char S[], unsigned int length) {
  byte at = 0;
  String D = "";

  for (int i = 0; i < length; i++) {
    D.concat(S[at++]);
  }
  return D;
}
