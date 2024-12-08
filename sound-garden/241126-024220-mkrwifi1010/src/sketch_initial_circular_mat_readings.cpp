//////////////// TEST READINGS FOR 3 ROWS AND 2 COLS ///////////////
//// but readMat is called on loop instead of triggered by a person

// ✅ continuously sends data instead of reading only when triggered by serial input '0'
// ✅ machine-readable CSV format instead of verbose human-readable output
// ✅ Baseline subtraction: difference calculated during output VS difference calculated during reading
// ✅ performs calibration silently
// 👾 New version automatically sends data every 100ms in a CSV format, while the original only sends data when requested through serial input


/////// TESTING with 36 + 3 sensors and 3 multiplexers ///////
#include <Arduino.h>

// Pin definitions
const int ROW_PINS[] = {A0, A1, A2};  // Analog input pins for rows

// Multiplexer MTL (Top Left) - Controls columns 1-13
const int MTL_SIG = 8;    // Signal pin
const int MTL_S3 = 9;     // Control pins
const int MTL_S2 = 10;
const int MTL_S1 = 11;
const int MTL_S0 = 12;

// Multiplexer MBL (Bottom Left) - Controls columns 14-27
const int MBL_SIG = A3;   // Signal pin
const int MBL_S3 = A4;    // Control pins
const int MBL_S2 = A5;
const int MBL_S1 = A6;
const int MBL_S0 = A7;

// Multiplexer MTR (Top Right) - Controls columns 28-36
const int MTR_SIG = 7;    // Signal pin
const int MTR_S3 = 6;     // Control pins
const int MTR_S2 = 5;
const int MTR_S1 = 4;
const int MTR_S0 = 3;

const int NUM_ROWS = 3;
const int NUM_COLS = 36;

//// 👾 PROBABLY NEEDS CHANGES /////
// Arrays to store sensor values
int currentValues[3][NUM_COLS];    // Current readings
int baselineValues[3][NUM_COLS];   // Calibration baseline
const int NUM_CALIBRATION_SAMPLES = 20; // could be increased

// Helper function to determine which multiplexer and channel to use for a given column
struct MuxInfo {
    int sigPin;
    int s3Pin;
    int s2Pin;
    int s1Pin;
    int s0Pin;
    int channel;
};

// Maps a column (1-36) to the correct multiplexer and channel
MuxInfo getMuxInfo(int col) {
    MuxInfo info;

    if (col < 13) {  // Columns 1-13 on MTL
        info = {MTL_SIG, MTL_S3, MTL_S2, MTL_S1, MTL_S0, 0};
        // Map columns 1-9 to C15-C7
        if (col < 9) {
            info.channel = 15 - col;
        }
        // Map columns 10-13 to C3-C0
        else {
            info.channel = 3 - (col - 9);
        }
    }
    else if (col < 27) {  // Columns 14-27 on MBL
        info = {MBL_SIG, MBL_S3, MBL_S2, MBL_S1, MBL_S0, 0};
        // Map columns 14-18 to C15-C11
        if (col < 19) {
            info.channel = 15 - (col - 14);
        }
        // Map columns 19-27 to C10-C2
        else {
            info.channel = 10 - (col - 19);
        }
    }
    else {  // Columns 28-36 on MTR
        info = {MTR_SIG, MTR_S3, MTR_S2, MTR_S1, MTR_S0, 0};
        // Map columns 28-36 to C15-C7
        info.channel = 15 - (col - 28);
    }

    return info;
}

void setMuxChannel(const MuxInfo& mux, int channel) {
    digitalWrite(mux.s0Pin, channel & 0x01);
    digitalWrite(mux.s1Pin, (channel >> 1) & 0x01);
    digitalWrite(mux.s2Pin, (channel >> 2) & 0x01);
    digitalWrite(mux.s3Pin, (channel >> 3) & 0x01);
}
// Does this allow all multiplexers to be running at the same time?

void calibrate();
void readMat();

void setup() {
  Serial.begin(9600);

  // Set pin modes for rows
  for (int r = 0; r < NUM_ROWS; r++) {
    pinMode(ROW_PINS[r], INPUT); // Analog
  }

  // // Setup multiplexer pins
  // pinMode(MUX_SIG, OUTPUT);
  // pinMode(MUX_S3, OUTPUT);
  // pinMode(MUX_S2, OUTPUT);
  // pinMode(MUX_S1, OUTPUT);
  // pinMode(MUX_S0, OUTPUT);
  // digitalWrite(MUX_SIG, LOW);  // Start with signal LOW


  // 🍑 SHOULD WE BE WRITING MTL_SIG, MBL_SIG, AND MTR_SIG AS digitalWrite(pin, LOW) like before?
  // Configure all multiplexer pins
  // MTL
  pinMode(MTL_SIG, OUTPUT);
  pinMode(MTL_S3, OUTPUT);
  pinMode(MTL_S2, OUTPUT);
  pinMode(MTL_S1, OUTPUT);
  pinMode(MTL_S0, OUTPUT);

  // MBL
  pinMode(MBL_SIG, OUTPUT);
  pinMode(MBL_S3, OUTPUT);
  pinMode(MBL_S2, OUTPUT);
  pinMode(MBL_S1, OUTPUT);
  pinMode(MBL_S0, OUTPUT);

  // MTR
  pinMode(MTR_SIG, OUTPUT);
  pinMode(MTR_S3, OUTPUT);
  pinMode(MTR_S2, OUTPUT);
  pinMode(MTR_S1, OUTPUT);
  pinMode(MTR_S0, OUTPUT);

  delay(1000);  // Allow serial to initialize
    // 🍑 Removed from 3*36 - why?
  Serial.println("Starting calibration...");
  calibrate();
}

// from 3*9 - remove?
// 🍑 Helper function to set multiplexer channel
  // handle the 4-bit channel selection
// void setMuxChannel(int channel) {
//   digitalWrite(MUX_S0, channel & 0x01);
//   digitalWrite(MUX_S1, (channel >> 1) & 0x01);
//   digitalWrite(MUX_S2, (channel >> 2) & 0x01);
//   digitalWrite(MUX_S3, (channel >> 3) & 0x01);
// }

//// 👾 LOOP FUNCTION UNCHANGED?
void loop() {
  readMat();

  // Send sensor readings in CSV format
  // for (int r = 0; r < NUM_ROWS; r++) {
  //   for (int c = 0; c < NUM_COLS; c++) {
  //     Serial.print(currentValues[r][c]);
  //     if (c < NUM_COLS - 1) Serial.print(","); // Add comma between columns
  //   }
  //   if (r < NUM_ROWS - 1) Serial.print(","); // Add comma between rows
  // }

  // NEW CODE for 3*36
  // Output all values in order (row1,col1 -> row3,col1 -> row1,col2 etc.)
  for (int c = 0; c < NUM_COLS; c++) {
    for (int r = 0; r < NUM_ROWS; r++) {
        Serial.print(currentValues[r][c]);
        // Add comma if not the last value
        if (!(r == NUM_ROWS-1 && c == NUM_COLS-1)) {
            Serial.print(",");
        }
    }
  }
  Serial.println();  // Newline after each reading

  delay(20); // ⚪️ Adjust delay as needed
  // from 100, to 20, to completely removing
}

void calibrate() {
  for (int r = 0; r < NUM_ROWS; r++) {
    for (int c = 0; c < NUM_COLS; c++) {
      baselineValues[r][c] = 0;
    }
  }

  for (int sample = 0; sample < NUM_CALIBRATION_SAMPLES; sample++) {
    for (int c = 0; c < NUM_COLS; c++) {
      // OLD CODE for 3*9
      // setMuxChannel(c);
      // digitalWrite(MUX_SIG, HIGH);
      // delay(10);
      // for (int r = 0; r < NUM_ROWS; r++) {
      //   baselineValues[r][c] += analogRead(ROW_PINS[r]);
      // }
      // digitalWrite(MUX_SIG, LOW);

      // NEW CODE for 3*36
      MuxInfo mux = getMuxInfo(c);
      setMuxChannel(mux, mux.channel);
      digitalWrite(mux.sigPin, HIGH);
      delay(1);  // Brief settling time

      for (int r = 0; r < NUM_ROWS; r++) {
          baselineValues[r][c] += analogRead(ROW_PINS[r]);
      }
      digitalWrite(mux.sigPin, LOW);
    }
  }

  // Averaging code?
  for (int r = 0; r < NUM_ROWS; r++) {
    for (int c = 0; c < NUM_COLS; c++) {
      baselineValues[r][c] /= NUM_CALIBRATION_SAMPLES;
    }
  }
}

void readMat() {
  for (int c = 0; c < NUM_COLS; c++) {
    // OLD CODE for 3*9
    // setMuxChannel(c);
    // digitalWrite(MUX_SIG, HIGH);
    // delay(10);
    // for (int r = 0; r < NUM_ROWS; r++) {
    //   // Clamping the values to 0 so that there's no negatives:
    //   int diff = analogRead(ROW_PINS[r]) - baselineValues[r][c];
    //   currentValues[r][c] = (diff < 0) ? 0 : diff;
    // }
    // digitalWrite(MUX_SIG, LOW); // MUX_SIG instead of COL_PINS[c]

    // NEW CODE for 3*36
    MuxInfo mux = getMuxInfo(c);
    setMuxChannel(mux, mux.channel);
    digitalWrite(mux.sigPin, HIGH);
    delay(1);  // Brief settling time

    for (int r = 0; r < NUM_ROWS; r++) {
        int diff = analogRead(ROW_PINS[r]) - baselineValues[r][c];
        currentValues[r][c] = (diff < 0) ? 0 : diff;
    }
    digitalWrite(mux.sigPin, LOW);
  }
}


// Map serial reading to a range we need, or use constrain();



// //////////// GETTING TEST READINGS FOR 18 COLUMNS ////////////////
// #include <Arduino.h>

// // First multiplexer (connected to A0) - handles rows and second set of columns
// const byte mux1_s0 = A4;  // Control pins for first multiplexer
// const byte mux1_s1 = A3;
// const byte mux1_s2 = A2;
// const byte mux1_s3 = A1;
// const byte mux1_sig = A0; // Signal pin

// // Second multiplexer (connected to D8) - handles first set of columns
// const byte mux2_s0 = 12;  // Control pins for second multiplexer
// const byte mux2_s1 = 11;
// const byte mux2_s2 = 10;
// const byte mux2_s3 = 9;
// const byte mux2_sig = 8;  // Signal pin

// // Mux channel configuration
// const boolean muxChannel[16][4] = {
//     {0, 0, 0, 0}, // Channel 0
//     {1, 0, 0, 0}, // Channel 1
//     {0, 1, 0, 0}, // Channel 2
//     {1, 1, 0, 0}, // Channel 3
//     {0, 0, 1, 0}, // Channel 4
//     {1, 0, 1, 0}, // Channel 5
//     {0, 1, 1, 0}, // Channel 6
//     {1, 1, 1, 0}, // Channel 7
//     {0, 0, 0, 1}, // Channel 8
//     {1, 0, 0, 1}, // Channel 9
//     {0, 1, 0, 1}, // Channel 10
//     {1, 1, 0, 1}, // Channel 11
//     {0, 0, 1, 1}, // Channel 12
//     {1, 0, 1, 1}, // Channel 13
//     {0, 1, 1, 1}, // Channel 14
//     {1, 1, 1, 1}  // Channel 15
// };

// // Function declarations
// int readMux1(byte channel);
// int readMux2(byte channel);

// void setup() {
//   // Configure pins for first multiplexer
//   pinMode(mux1_s0, OUTPUT);
//   pinMode(mux1_s1, OUTPUT);
//   pinMode(mux1_s2, OUTPUT);
//   pinMode(mux1_s3, OUTPUT);
//   pinMode(mux1_sig, INPUT);

//   // Configure pins for second multiplexer
//   pinMode(mux2_s0, OUTPUT);
//   pinMode(mux2_s1, OUTPUT);
//   pinMode(mux2_s2, OUTPUT);
//   pinMode(mux2_s3, OUTPUT);
//   pinMode(mux2_sig, INPUT);

//   Serial.begin(115200);
//   Serial.println("Starting column readings test...");
//   Serial.println("First 9 columns (Mux2, C8-C0), then next 9 columns (Mux1, C11-C3)");
//   Serial.println();
// }

// void loop() {
//   // First 9 columns from multiplexer 2 (C8 down to C0)
//   Serial.println("Mux2 Columns (C8-C0):");
//   for (int col = 8; col >= 0; col--) {
//     int colValue = readMux2(col);

//     Serial.print("C");
//     Serial.print(col);
//     Serial.print(": ");
//     Serial.print(colValue);
//     Serial.print("\t");
//   }
//   Serial.println();

//   // Next 9 columns from multiplexer 1 (C11 down to C3)
//   Serial.println("Mux1 Columns (C11-C3):");
//   for (int col = 11; col >= 3; col--) {
//     int colValue = readMux1(col);

//     Serial.print("C");
//     Serial.print(col);
//     Serial.print(": ");
//     Serial.print(colValue);
//     Serial.print("\t");
//   }
//   Serial.println();
//   Serial.println(); // Extra line for readability

//   delay(1000);  // Wait a second before next reading
// }

// // Read from first multiplexer (connected to A0)
// int readMux1(byte channel) {
//   byte controlPin[] = {mux1_s0, mux1_s1, mux1_s2, mux1_s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
//   return analogRead(mux1_sig);
// }

// // Read from second multiplexer (connected to D8)
// int readMux2(byte channel) {
//   byte controlPin[] = {mux2_s0, mux2_s1, mux2_s2, mux2_s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
//   return analogRead(mux2_sig);
// }



//////////// GETTING TEST READINGS FOR 3 ROWS ////////////////
// #include <Arduino.h>

// // First multiplexer (connected to A0) - handles rows and second set of columns
// const byte mux1_s0 = A4;  // Control pins for first multiplexer
// const byte mux1_s1 = A3;
// const byte mux1_s2 = A2;
// const byte mux1_s3 = A1;
// const byte mux1_sig = A0; // Signal pin

// // Second multiplexer (connected to D8) - handles first set of columns
// const byte mux2_s0 = 12;  // Control pins for second multiplexer
// const byte mux2_s1 = 11;
// const byte mux2_s2 = 10;
// const byte mux2_s3 = 9;
// const byte mux2_sig = 8;  // Signal pin

// // Mux channel configuration
// const boolean muxChannel[16][4] = {
//     {0, 0, 0, 0}, // Channel 0
//     {1, 0, 0, 0}, // Channel 1
//     {0, 1, 0, 0}, // Channel 2
//     {1, 1, 0, 0}, // Channel 3
//     {0, 0, 1, 0}, // Channel 4
//     {1, 0, 1, 0}, // Channel 5
//     {0, 1, 1, 0}, // Channel 6
//     {1, 1, 1, 0}, // Channel 7
//     {0, 0, 0, 1}, // Channel 8
//     {1, 0, 0, 1}, // Channel 9
//     {0, 1, 0, 1}, // Channel 10
//     {1, 1, 0, 1}, // Channel 11
//     {0, 0, 1, 1}, // Channel 12
//     {1, 0, 1, 1}, // Channel 13
//     {0, 1, 1, 1}, // Channel 14
//     {1, 1, 1, 1}  // Channel 15
// };

// // Function declarations
// int readMux1(byte channel);
// int readMux2(byte channel);

// void setup() {
//   // Configure pins for first multiplexer
//   pinMode(mux1_s0, OUTPUT);
//   pinMode(mux1_s1, OUTPUT);
//   pinMode(mux1_s2, OUTPUT);
//   pinMode(mux1_s3, OUTPUT);
//   pinMode(mux1_sig, INPUT);

//   // Configure pins for second multiplexer
//   pinMode(mux2_s0, OUTPUT);
//   pinMode(mux2_s1, OUTPUT);
//   pinMode(mux2_s2, OUTPUT);
//   pinMode(mux2_s3, OUTPUT);
//   pinMode(mux2_sig, INPUT);

//   Serial.begin(115200);
//   Serial.println("Starting row readings test...");
//   Serial.println("Reading channels C0, C1, C2 from first multiplexer");
//   Serial.println();
// }

// void loop() {
//   // TESTING ROWS CODE 🚨
//   for (int row = 0; row < 3; row++) {
//     int rowValue = readMux1(row);  // Read channels 0, 1, and 2

//     Serial.print("Row ");
//     Serial.print(row);
//     Serial.print(": ");
//     Serial.print(rowValue);
//     Serial.print("\t");
//   }
//   Serial.println(); // New line after printing all rows
//   delay(500);      // Wait half a second before next reading
// }

// // Read from first multiplexer (connected to A0)
// int readMux1(byte channel) {
//   byte controlPin[] = {mux1_s0, mux1_s1, mux1_s2, mux1_s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
//   return analogRead(mux1_sig);
// }

// // Read from second multiplexer (connected to D8)
// int readMux2(byte channel) {
//   byte controlPin[] = {mux2_s0, mux2_s1, mux2_s2, mux2_s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
//   return analogRead(mux2_sig);
// }
























// #include <Arduino.h>

// // Code for circular mat

// // One multiplexer, let's call it Multiplexer B, connects to the A0, A1, A2, A3, A4 pins on the arduino.
// // That multiplexer's pins that are connected are:
// // C0 (top section), C1 (middle section), C2 (bottom section)
// // C3 to C11

// // The other Multiplexer, let's call it Multipler T, connects to the D8 to D12 pins on the Arduino.
// // In the Multiplexer T, we're then using C0 to C8 to connect to our copper sensors.

// // Bottom Multiplexer
// // pins C0 (top section), C1 (middle section), C2 (bottom section)
// // C3 to C11

// // Both multiplexers are being used to read sensors, not as input/output

// // First multiplexer (connected to A0) - handles rows and second set of columns
// const byte mux1_s0 = A4;  // Control pins for first multiplexer
// const byte mux1_s1 = A3;
// const byte mux1_s2 = A2;
// const byte mux1_s3 = A1;
// const byte mux1_sig = A0; // Signal pin

// // Second multiplexer (connected to D8) - handles first set of columns
// const byte mux2_s0 = 12;  // Control pins for second multiplexer
// const byte mux2_s1 = 11;
// const byte mux2_s2 = 10;
// const byte mux2_s3 = 9;
// const byte mux2_sig = 8;  // Signal pin

// // Replace the old arrays with a 3x18 matrix
// int calibra[3][18];       // Calibration array
// int pastmatrix[3][18];    // Previous readings matrix

// // READDED 🔴
// int inByte = 0;
// int valor = 0;
// int minsensor = 254;

// // These 16 channels, are they a template that can work for both multiplexers?
// // Mux channel configuration
// const boolean muxChannel[16][4] = {
//     {0, 0, 0, 0}, // Channel 0
//     {1, 0, 0, 0}, // Channel 1
//     {0, 1, 0, 0}, // Channel 2
//     {1, 1, 0, 0}, // Channel 3
//     {0, 0, 1, 0}, // Channel 4
//     {1, 0, 1, 0}, // Channel 5
//     {0, 1, 1, 0}, // Channel 6
//     {1, 1, 1, 0}, // Channel 7
//     {0, 0, 0, 1}, // Channel 8
//     {1, 0, 0, 1}, // Channel 9
//     {0, 1, 0, 1}, // Channel 10
//     {1, 1, 0, 1}, // Channel 11
//     {0, 0, 1, 1}, // Channel 12
//     {1, 0, 1, 1}, // Channel 13
//     {0, 1, 1, 1}, // Channel 14
//     {1, 1, 1, 1}  // Channel 15
// };

// // Function declarations
// int readMux1(byte channel);
// int readMux2(byte channel);
// void processAndSendValue(int row, int col, int valor);
// void establishContact();

// void setup() {
//   // Configure pins for first multiplexer
//   pinMode(mux1_s0, OUTPUT);
//   pinMode(mux1_s1, OUTPUT);
//   pinMode(mux1_s2, OUTPUT);
//   pinMode(mux1_s3, OUTPUT);
//   pinMode(mux1_sig, INPUT);

//   // Configure pins for second multiplexer
//   pinMode(mux2_s0, OUTPUT);
//   pinMode(mux2_s1, OUTPUT);
//   pinMode(mux2_s2, OUTPUT);
//   pinMode(mux2_s3, OUTPUT);
//   pinMode(mux2_sig, INPUT);

//   Serial.begin(115200);

//   // Calibration
//   Serial.println("\nCalibrating...\n");

//   // Initialize calibration array
//   for (int row = 0; row < 3; row++) {
//     for (int col = 0; col < 18; col++) {
//       calibra[row][col] = 0;
//     }
//   }

//   // Take multiple readings for calibration
//   for (int k = 0; k < 50; k++) {
//     for (int row = 0; row < 3; row++) {
//       readMux1(row);  // Select row

//       // First 9 columns (multiplexer 2)
//       for (int col = 0; col < 9; col++) {
//         calibra[row][col] += readMux2(8 - col);
//       }

//       // Next 9 columns (multiplexer 1)
//       for (int col = 9; col < 18; col++) {
//         calibra[row][col] += readMux1(11 - (col - 9));
//       }
//     }
//   }

//   // Average the readings and find minimum value
//   for (int row = 0; row < 3; row++) {
//     for (int col = 0; col < 18; col++) {
//       calibra[row][col] /= 50;
//       if (calibra[row][col] < minsensor) {
//         minsensor = calibra[row][col];
//       }
//       Serial.print(calibra[row][col]);
//       Serial.print("\t");
//     }
//     Serial.println();
//   }

//   Serial.println();
//   Serial.print("Minimum Value: ");
//   Serial.println(minsensor);
//   Serial.println();

//   establishContact();
// }

// void loop() {
//   if (Serial.available() > 0) {
//     inByte = Serial.read();

//     // TESTING ROWS CODE 🚨
//     for (int row = 0; row < 3; row++) {
//       int rowValue = readMux1(row);  // Read channels 0, 1, and 2

//       Serial.print("Row ");
//       Serial.print(row);
//       Serial.print(": ");
//       Serial.print(rowValue);
//       Serial.print("\t");
//     }
//     Serial.println(); // New line after printing all rows
//     delay(500);      // Wait half a second before next reading






//     // if (inByte == 'A') {
//     //   // Read each row (using multiplexer 1, channels 0-2)
//     //   for (int row = 0; row < 3; row++) {
//     //     // Select the row
//     //     readMux1(row);

//     //     // Read first 9 columns from multiplexer 2 (channels 8 down to 0)
//     //     for (int col = 0; col < 9; col++) {
//     //       valor = readMux2(8 - col);  // Reading C8 down to C0
//     //       processAndSendValue(row, col, valor);
//     //     }

//     //     // Read next 9 columns from multiplexer 1 (channels 11 down to 3)
//     //     for (int col = 9; col < 18; col++) {
//     //       valor = readMux1(11 - (col - 9));  // Reading C11 down to C3
//     //       processAndSendValue(row, col, valor);
//     //     }
//     //   }
//     // }
//   }
// }

// // ADDED 🌸
// // Modified read functions for each multiplexer
// int readMux1(byte channel) {
//   byte controlPin[] = {mux1_s0, mux1_s1, mux1_s2, mux1_s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
//   return analogRead(mux1_sig);
// }

// int readMux2(byte channel) {
//   byte controlPin[] = {mux2_s0, mux2_s1, mux2_s2, mux2_s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
//   return analogRead(mux2_sig);
// }

// void processAndSendValue(int row, int col, int valor) {
//   int limsup = 450;
//   valor = constrain(valor, calibra[row][col], limsup);
//   valor = map(valor, minsensor, limsup, 1, 254);
//   if (valor < 150) valor = 0;
//   if (valor > 254) valor = 254;
//   Serial.write(valor);
// }

// void establishContact() {
//   while (Serial.available() <= 0) {
//     Serial.print('A');
//     delay(300);
//   }
// }































// I'm making a pressure sensitive mat following this Instructables tutorial for an O-mat: https://www.instructables.com/O-mat/.

// The differences are that I'm using an Arduino Nano 33 IoT instead of the Mini Pro.
// I'm connecting a few copper sensors to 2 SparkFun Analog/Digital MUX Breakout - CD74HC4067.
// I'm also not wiring as many sensors as the tutorial does.

// One multiplexer, let's call it Multiplexer B, connects to the A0, A1, A2, A3, A4 pins on the arduino.
// // That multiplexer's pins that are connected are:
// // C0, C1, C2, plus C3 to C11

// // The other Multiplexer, let's call it Multipler T, connects to the D8 to D12 pins on the Arduino.
// // In the Multiplexer T, we're then using C0 to C8 to connect to our copper sensors.

// The Arduino code below is from the tutorial. Your task is to change it to read the Arduino Nano IoT 33 and make sure you're reading the sensors that I did connect.





// ALTERNATIVE CODE TO REVIEW - NOT CORRECT:
// #include <Arduino.h>

// // Control pins for the multiplexer
// const byte s0 = 4;
// const byte s1 = 5;
// const byte s2 = 6;
// const byte s3 = 7;

// // Signal pin connected to the multiplexer
// const byte SIG_pin = A0; // Replace with the actual pin connected to your multiplexer

// // Mux channel configuration
// const boolean muxChannel[16][4] = {
//     {0, 0, 0, 0}, {1, 0, 0, 0}, {0, 1, 0, 0}, {1, 1, 0, 0}, // Channels 0-3
//     {0, 0, 1, 0}, {1, 0, 1, 0}, {0, 1, 1, 0}, {1, 1, 1, 0}, // Channels 4-7
//     {0, 0, 0, 1}, {1, 0, 0, 1}, {0, 1, 0, 1}, {1, 1, 0, 1}, // Channels 8-11
//     {0, 0, 1, 1}, {1, 0, 1, 1}, {0, 1, 1, 1}, {1, 1, 1, 1}  // Channels 12-15
// };

// void writeMux(byte channel);

// void setup() {
//   Serial.begin(115200);
//   pinMode(s0, OUTPUT);
//   pinMode(s1, OUTPUT);
//   pinMode(s2, OUTPUT);
//   pinMode(s3, OUTPUT);

//   Serial.println("Starting multiplexer test...");
// }

// void loop() {
//   for (int channel = 0; channel < 16; channel++) {
//     writeMux(channel);
//     int value = analogRead(SIG_pin);
//     Serial.print("Channel ");
//     Serial.print(channel);
//     Serial.print(": ");
//     Serial.println(value);
//   }
//   delay(1000); // Delay for easier observation
// }

// // Function to select the desired channel on the multiplexer
// void writeMux(byte channel) {
//   byte controlPin[] = {s0, s1, s2, s3};
//   for (int i = 0; i < 4; i++) {
//     digitalWrite(controlPin[i], muxChannel[channel][i]);
//   }
// }
