//////////////// TEST READINGS FOR 3 ROWS AND 2 COLS ///////////////
//// but readMat is called on loop instead of triggered by a person

// ✅ continuously sends data instead of reading only when triggered by serial input '0'
// ✅ machine-readable CSV format instead of verbose human-readable output
// ✅ Baseline subtraction: difference calculated during output VS difference calculated during reading
// ✅ performs calibration silently
// 👾 New version automatically sends data every 100ms in a CSV format, while the original only sends data when requested through serial input

#include <Arduino.h>

// Pin definitions
const int ROW_PINS[] = {A0, A1, A2};  // Analog input pins for rows
const int COL_PINS[] = {2, 3};        // Digital output pins for columns
const int NUM_ROWS = 3;
const int NUM_COLS = 2;

// Arrays to store sensor values
int currentValues[3][2];    // Current readings
int baselineValues[3][2];   // Calibration baseline
const int NUM_CALIBRATION_SAMPLES = 20;

void calibrate();
void readMat();

void setup() {
  Serial.begin(9600);

  // Set pin modes
  for (int r = 0; r < NUM_ROWS; r++) {
    pinMode(ROW_PINS[r], INPUT); // Analog
  }

  for (int c = 0; c < NUM_COLS; c++) {
    pinMode(COL_PINS[c], OUTPUT);
    digitalWrite(COL_PINS[c], LOW);  // Start with all columns LOW
  }

  delay(1000);  // Allow serial to initialize
  Serial.println("Starting up...");
  calibrate();
}

void loop() {
  readMat();

  // Send sensor readings in CSV format
  for (int r = 0; r < NUM_ROWS; r++) {
    for (int c = 0; c < NUM_COLS; c++) {
      Serial.print(currentValues[r][c]);
      if (c < NUM_COLS - 1) Serial.print(","); // Add comma between columns
    }
    if (r < NUM_ROWS - 1) Serial.print(","); // Add comma between rows
  }
  Serial.println();  // Newline after each reading

  delay(100); // Adjust delay as needed
}

void calibrate() {
  for (int r = 0; r < NUM_ROWS; r++) {
    for (int c = 0; c < NUM_COLS; c++) {
      baselineValues[r][c] = 0;
    }
  }

  for (int sample = 0; sample < NUM_CALIBRATION_SAMPLES; sample++) {
    for (int c = 0; c < NUM_COLS; c++) {
      digitalWrite(COL_PINS[c], HIGH);
      delay(10);
      for (int r = 0; r < NUM_ROWS; r++) {
        baselineValues[r][c] += analogRead(ROW_PINS[r]);
      }
      digitalWrite(COL_PINS[c], LOW);
    }
  }

  for (int r = 0; r < NUM_ROWS; r++) {
    for (int c = 0; c < NUM_COLS; c++) {
      baselineValues[r][c] /= NUM_CALIBRATION_SAMPLES;
    }
  }
}

void readMat() {
  for (int c = 0; c < NUM_COLS; c++) {
    digitalWrite(COL_PINS[c], HIGH);
    delay(10);
    for (int r = 0; r < NUM_ROWS; r++) {
      currentValues[r][c] = analogRead(ROW_PINS[r]) - baselineValues[r][c];
    }
    digitalWrite(COL_PINS[c], LOW);
  }
}


// ////////////// TEST READINGS FOR 3 ROWS AND 2 COLS ///////////////
// #include <Arduino.h>

// // Pin definitions
// const int ROW_PINS[] = {A0, A1, A2};  // Analog input pins for rows
// const int COL_PINS[] = {2, 3};        // Digital output pins for columns
// const int NUM_ROWS = 3;
// const int NUM_COLS = 2;

// // Arrays to store sensor values
// int currentValues[3][2];    // Current readings
// int baselineValues[3][2];   // Calibration baseline
// const int NUM_CALIBRATION_SAMPLES = 20;

// // Function declarations
// void calibrate();
// void readMat();

// void setup() {
//   // Init Serial
//   Serial.begin(9600); // prev using 112500 baud rate

//   // We need to loop through each of the 3 rows
//   // then set row 0 as Analog Read
//   // then set column 0 as HIGH digital out
//   // then repeat the process using the 2 nested for loops

//   // Set pin modes
//   for (int r = 0; r < NUM_ROWS; r++) {
//     pinMode(ROW_PINS[r], INPUT); // Analog
//     // Pin value still needs to be read later on.
//     // This just sets pin X as Input or Output
//   }

//   for (int c = 0; c < NUM_COLS; c++) {
//     pinMode(COL_PINS[c], OUTPUT);
//     digitalWrite(COL_PINS[c], LOW);  // Start with all columns LOW
//   }

//   // delay(1000);  // Add a delay to allow serial to initialize
//   Serial.println("Starting up...");  // Add this to verify serial is working

//   // Initial calibration
//   calibrate(); // DUPLICATED? Nope just an initial call
// }

// int inByte = 0; // Initializing inByte and setting to 0

// void loop() {
//   if (Serial.available() > 0) {
//     int inByte = Serial.read();
//     if (inByte == '0') {  // Changed to char '0' (ASCII 48)
//       readMat();
//     } else if (inByte == 'c') {  // Added option to recalibrate
//       calibrate();
//     }
//   }
// }

// void calibrate() {
//   Serial.println("Starting calibration...");

//   // Reset baseline values
//   for (int r = 0; r < NUM_ROWS; r++) {
//     for (int c = 0; c < NUM_COLS; c++) {
//       baselineValues[r][c] = 0;
//     }
//   }

//   // Take multiple samples
//   for (int sample = 0; sample < NUM_CALIBRATION_SAMPLES; sample++) {
//     for (int c = 0; c < NUM_COLS; c++) {
//       // Activate one column at a time
//       digitalWrite(COL_PINS[c], HIGH);
//       delay(10);  // Small delay for stability

//       // Read all rows for this column
//       for (int r = 0; r < NUM_ROWS; r++) {
//         baselineValues[r][c] += analogRead(ROW_PINS[r]);
//         // Creating a sum
//       }

//       digitalWrite(COL_PINS[c], LOW);
//       // setting the column pins back to LOW, as we're done with calibration
//     }
//   }

//   // Calculate averages
//   for (int r = 0; r < NUM_ROWS; r++) {
//     for (int c = 0; c < NUM_COLS; c++) {
//       baselineValues[r][c] /= NUM_CALIBRATION_SAMPLES;
//       Serial.print("Baseline R");
//       Serial.print(r);
//       Serial.print("C");
//       Serial.print(c);
//       Serial.print(": ");
//       Serial.println(baselineValues[r][c]);
//     }
//   }

//   Serial.println("Calibration complete!");
// }


// void readMat() {
//   // Read all sensors
//   for (int c = 0; c < NUM_COLS; c++) {
//     // Activate one column at a time
//     digitalWrite(COL_PINS[c], HIGH);
//     delay(10);  // Small delay for stability

//     // Read all rows for this column
//     for (int r = 0; r < NUM_ROWS; r++) {
//       currentValues[r][c] = analogRead(ROW_PINS[r]);
//     }

//     digitalWrite(COL_PINS[c], LOW);
//   }

//   // Print the readings
//   Serial.println("\n--- Current Readings ---");
//   for (int r = 0; r < NUM_ROWS; r++) {
//     for (int c = 0; c < NUM_COLS; c++) {
//       int difference = currentValues[r][c] - baselineValues[r][c];

//       Serial.print("R");
//       Serial.print(r);
//       Serial.print("C");
//       Serial.print(c);
//       Serial.print(": ");
//       Serial.print(currentValues[r][c]);
//       Serial.print(" (diff: ");
//       Serial.print(difference);
//       Serial.print(")  ");
//     }
//     Serial.println();
//   }
// }


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
