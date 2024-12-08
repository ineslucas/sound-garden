// Initialize an array with 108 zeros - one for each pressure sensor
let sensorValues = Array(108).fill(0);
let inputBuffer = ''; // Buffer to store incomplete data

// WebSerial connection variables
let serial; // WebSerial object
let port; // Port object
let reader; // For reading the serial data stream
let decoder = new TextDecoder(); // Decoder for incoming serial data, converts raw binary data to text

const numberOfCircles = 36;
const firstRadius = 130;  // Innermost circle
const innerRadius = 200;  // Middle circle
const outerRadius = 300;  // Outermost circle

// Constants for visualization
const MAX_PRESSURE = 200;  // Maximum analog reading value
  // 600
const MIN_OPACITY = 30;     // Minimum opacity for circles
const MAX_OPACITY = 255;    // Maximum opacity for circles
const CIRCLE_SIZE = 20;     // Size of each circle

function setup() {
  createCanvas(800, 800);

  // Create a button to connect to the serial port
  let connectButton = createButton("Connect to Serial");
  connectButton.position(10, 10);
  connectButton.mousePressed(connectToSerial);
}

function draw() {
  background(0, 0, 150); // Deep blue water

  // Center the coordinate system
  translate(width/2, height/2);

  // Draw three circles of circles
  drawCircleRing(firstRadius, 0);  // Inner ring with smaller circles
  drawCircleRing(innerRadius, 1);  // Middle ring
  drawCircleRing(outerRadius, 2);  // Outer ring

  // Display serial data for debugging
  resetMatrix();  // Reset translation
  if (sensorValues.length > 0) {
    // fill with white text
    fill(255);
    noStroke();
    text('Received Values', 10, 50);
    text(JSON.stringify(sensorValues), 10, 70);
  }
}

function drawCircleRing(radius, rowIndex) {
  for (let i = 0; i < numberOfCircles; i++) {
    // Calculate the angle (counter-clockwise)
    const angle = (-i * TWO_PI) / numberOfCircles;
    const x = radius * cos(angle);
    const y = radius * sin(angle);

    // Get the pressure value for this circle
    // Index = (column * 3) + row, because data comes as [r1c1,r2c1,r3c1,r1c2,r2c2,r3c2,...]
    const pressureIndex = (i * 3) + rowIndex;
    const pressure = sensorValues[pressureIndex] || 0;

    // Map pressure to opacity
    const opacity = map(
      pressure,
      0,
      MAX_PRESSURE,
      MIN_OPACITY,
      MAX_OPACITY
    );

    // Visual feedback based on pressure
    stroke(0);
    fill(255, 255, 255, opacity);  // White with varying opacity
    circle(x, y, CIRCLE_SIZE);

    // Optional: Add a pressure indicator
    if (pressure > 0) {
      // Add a colored center dot that gets brighter with pressure
      const centerColor = map(pressure, 0, MAX_PRESSURE, 0, 255);
      fill(centerColor, 0, 0);  // Red center that gets brighter
      noStroke();
      circle(x, y, CIRCLE_SIZE/4);
    }
  }
}

// Serial connection and processing.
// When the Connect button is pressed, this function is called
async function connectToSerial() {
  // Request a port and open a connection
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    serial = port.readable.getReader();
    console.log("Serial connection established"); // Debug log

    // Start reading data from the serial port on loop
    readSerial();
  } catch (err) {
    console.error("Error connecting to serial:", err);
  }
}

// Continuous loop that reads data from the serial port
async function readSerial() {
  while (port.readable) {
    try {
      const { value, done } = await serial.read();
      if (done) {
        console.log("Serial connection closed"); // Debug log
        serial.releaseLock();
        break;
      }

      // Decode the data and process it
      const data = decoder.decode(value);
      // Add new data to our buffer
      inputBuffer += data;

      // Check if we have a complete line (ends with newline)
      let newlineIndex = inputBuffer.indexOf('\n');
      while (newlineIndex !== -1) {
        // Extract the complete line
        const line = inputBuffer.substring(0, newlineIndex).trim();
        // Remove the processed line from the buffer
        inputBuffer = inputBuffer.substring(newlineIndex + 1);

        // Process the complete line
        if (line) {
          console.log("Complete line received:", line);
          processSerialData(line);
        }

        // Look for next newline
        newlineIndex = inputBuffer.indexOf('\n');
      }
    } catch (err) {
      console.error("Error reading serial data:", err);
      break;
    }
  }
}

function processSerialData(data) {
  // Parse CSV data from Arduino
  // Since the data is already properly formatted, just split by comma and convert to integers
  let values = data
    .split(",")
    .filter(val => val.trim() !== '')
    .map(val => parseInt(val.trim()));

  // sensorValues = rows.map((row) =>
  //   row.split(",").map((val) => parseInt(val.trim()))
  // );

  if (values.length === 108) {
    sensorValues = values;
    console.log("Processed values:", values); // Debug log
  } else {
    console.log("Incomplete data received, length:", values.length); // Debug log
  }


  // for (let row of rows) {
  //   if (row.trim()) {  // Only process non-empty rows
  //     let values = row.split(",").map(val => parseInt(val.trim()));
  //     if (values.length === 108) {  // Make sure we have all values
  //       sensorValues = values;
  //     }
  //   }
  // }
}

// THIS DOESN'T HAVE PULLING DOWN TO 0 or any sort of data calibration.

// Data format explanation:
// The 108 values represent pressure readings arranged in a circular pattern:
// - There are 36 positions around the circle
// - At each position, there are 3 sensors (inner, middle, outer ring)
// - 36 positions × 3 sensors = 108 total values
//
// The data comes in this format:
// [r1c1,r2c1,r3c1, r1c2,r2c2,r3c2, ..., r1c36,r2c36,r3c36]
// where:
// - r1 = inner ring
// - r2 = middle ring
// - r3 = outer ring
// - c1-c36 = position number around the circle
