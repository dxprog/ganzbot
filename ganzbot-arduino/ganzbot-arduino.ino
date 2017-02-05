#include <Servo.h>

// Pins
#define PIN_LED_RED       8
#define PIN_LED_GREEN     12
#define PIN_LED_BLUE      9
#define PIN_LEFT_EYEBROW  11
#define PIN_RIGHT_EYEBROW 10

// 1200 bytes per second should be plenty
#define BAUD_RATE         9600

// How long to keep ganzbot looking "active"
#define SLEEP_DELAY       60000

// Eyebrow related configs
#define BROW_TWITCH_ANGLE 10
#define BROW_TWITCH_DELAY 1000
#define BROW_ANGRY        10
#define BROW_SAD          50
#define BROW_NEUTRAL      28

// Supported emotional states
enum Emotion {
  off = 0,
  neutral,
  angry,
  sad
};

Servo leftEyebrow;
Servo rightEyebrow;

// We need to keep track of the previous
// eyebrow angle for the right eyebrow twitch
int lastAngle;

// Timer for managing sleep mode
unsigned long sleepTimer;

// Current emotion
Emotion currentEmotion;

void setup() {
  Serial.begin(BAUD_RATE);
  
  leftEyebrow.attach(PIN_LEFT_EYEBROW);
  rightEyebrow.attach(PIN_RIGHT_EYEBROW);

  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_BLUE, OUTPUT);

  setEmotion(off);
}

void resetSleepTimer() {
  sleepTimer = millis() + SLEEP_DELAY;
}

// Sets the angle of ganzbot's eyebrows
// accounting for eye twitch
void setEyebrows(int angle) {
  // The eye twitch
  if (lastAngle != BROW_NEUTRAL && angle == BROW_NEUTRAL) {
    rightEyebrow.write(lastAngle - BROW_TWITCH_ANGLE);
    delay(BROW_TWITCH_DELAY);
  }

  rightEyebrow.write(angle);
  leftEyebrow.write(180 - angle);
  lastAngle = angle;
}

// Sets the color of ganzbot's eyes.
// Since it's all high/low, only primary
// colors can be done.
void setRGB(bool r, bool g, bool b) {
  digitalWrite(PIN_LED_RED, r ? HIGH : LOW);
  digitalWrite(PIN_LED_GREEN, g ? HIGH : LOW);
  digitalWrite(PIN_LED_BLUE, b ? HIGH : LOW);
}

// Set's ganbot's current emotion
// Handles eyebrows and eyes
void setEmotion(Emotion emotion) {
  switch (emotion) {
    case off:
      setEyebrows(BROW_NEUTRAL);
      setRGB(false, false, false);
      break;
    case neutral:
      setEyebrows(BROW_NEUTRAL);
      setRGB(false, false, true);
      break;
    case angry:
      setEyebrows(BROW_ANGRY);
      setRGB(true, false, false);
      break;
    case sad:
      setEyebrows(BROW_SAD);
      setRGB(false, false, true);
      break;
  }

  // Reset the sleep timer
  resetSleepTimer();
  currentEmotion = emotion;
}

void loop() {
  unsigned long ticks = millis();
  // Sleep timer
  if (ticks > sleepTimer && currentEmotion != off) {
    Serial.println("Sleeping");
    setEmotion(off);
  }

  if (Serial.available() > 0) {
    char data = Serial.read();
    switch (data) {
      // Check both for the numeric value and the ASCII version
      case '0':
      case 0:
        setEmotion(off);
        break;
      case '1':
      case 1:
        setEmotion(neutral);
        break;
      case '2':
      case 2:
        setEmotion(angry);
        break;
      case '3':
      case 3:
        setEmotion(sad);
        break;
    }
  }
}
