#include <Servo.h>

// Pins
#define PIN_LED_RED       8
#define PIN_LED_GREEN     12
#define PIN_LED_BLUE      9
#define PIN_LEFT_EYEBROW  11
#define PIN_RIGHT_EYEBROW 10

// Eyebrow related configs
#define BROW_TWITCH_ANGLE 10
#define BROW_TWITCH_DELAY 1000
#define BROW_ANGRY        10
#define BROW_SAD          50
#define BROW_NEUTRAL      28

// Supported emotional states
enum Emotion {
  neutral = 0,
  angry,
  sad
};

Servo leftEyebrow;
Servo rightEyebrow;

// We need to keep track of the previous
// eyebrow angle for the right eyebrow twitch
int lastAngle;

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
}

void setup() {
  leftEyebrow.attach(PIN_LEFT_EYEBROW);
  rightEyebrow.attach(PIN_RIGHT_EYEBROW);
  setEyebrows(BROW_NEUTRAL);

  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_BLUE, OUTPUT);
}

void loop() {
  digitalWrite(PIN_LED_BLUE, HIGH);
  setEmotion(angry);
  delay(2000);
  setEmotion(neutral);
  delay(2000);
}
