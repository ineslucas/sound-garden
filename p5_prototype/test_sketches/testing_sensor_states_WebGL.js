// Worry about getting an exact mapping for 108 sensors later!
// MAIN SKETCH 👇🏼

// Importing the different scenes
import { SpiralScene } from '../working_scenes/SpiralScene.js';

let spiralScene;
let spiralFont;
let baseGraphics;
let pressureGraphics;

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

// Constants for testing visualization
const MAX_PRESSURE = 300;  // Maximum analog reading value
  // 600
const MIN_OPACITY = 30;     // Minimum opacity for circles
const MAX_OPACITY = 255;    // Maximum opacity for circles
const CIRCLE_SIZE = 20;     // Size of each circle


// To keep track of animation progress
let theShader;
let graphics; // NEEDED?
let totalPressure = 0;
let maxTotalPressure = 108 * MAX_PRESSURE; // Maximum possible pressure across all sensors

console.log("Main script loading...");

function preload() {
  console.log("Preload starting...");
  // Load shader
  theShader = loadShader('shaders/shader.vert', 'shaders/shader.frag');
  // console.log("Shader loaded:", theShader ? "success" : "failed");

  // ♨️ FONT DEBUGGING
  // spiralFont = loadFont('assets/fonts/ink©t.ttf');
  // console.log("Font loaded:", spiralFont ? "success" : "failed");
  // ♨️ FONT DEBUG

  console.log("Using websafe font: Arial");
}

// Smart move to make it async?
async function setup() {
  console.log("Setup starting...");

  // Where the final shader-processed result is displayed
  createCanvas(800, 800, WEBGL);

  // ♨️ FONT DEBUGGING
  // textFont(spiralFont);  // Setting the font globally to avoid error: WEBGL: you must load and set a font before drawing text. See `loadFont` and `textFont` for more details.


  // Graphics buffers for each scene where we draw the pressure data
  baseGraphics = createGraphics(width, height); // 🍑 Added and removed P2D
    // P2D renderer, which supports text rendering.
  pressureGraphics = createGraphics(width, height);

  // Set text properties for main canvas
  textFont('Arial');
  textSize(20);

  // Instead of loading a font file, create a websafe font
  baseGraphics.textFont('Arial');
  baseGraphics.textSize(20);
  pressureGraphics.textFont('Arial');
  pressureGraphics.textSize(20);

    // pressureGraphics doesn't even need a textFont but screw it.

  // Initialize scenes
  spiralScene = new SpiralScene(width, height, 'Arial'); // passing spiralFont to the constructor
                              // spiralFont

  try {
    await spiralScene.setup(); // Wait for setup to complete
    // 🟢 SHOULD THIS BE A TRY and CATCH BLOCK?
    console.log('Spiral scene setup complete');
  } catch (error) {
    console.error('Error setting up spiral scene:', error);
  }

  // Create a button to connect to the serial port
  let connectButton = createButton("Connect to Serial");
  connectButton.position(10, 10);
  connectButton.mousePressed(connectToSerial);
}

function draw() {
  // Calculate total pressure percentage
  totalPressure = sensorValues.reduce((sum, val) => sum + val, 0);
  let pressurePercentage = totalPressure / maxTotalPressure;

  /////


  // Clear graphics buffers
  baseGraphics.clear();
  pressureGraphics.clear();

  // Draw Spiral Text scene to baseGraphics
  baseGraphics.push();
  baseGraphics.clip(() => {
      baseGraphics.circle(width/2, height/2, width);
  });
  spiralScene.draw(baseGraphics); // Here's where SpiralScene.draw is called
  baseGraphics.pop();

  // 1. First, we draw the pressure data to an offscreen buffer (graphics)
  drawPressureMap(pressureGraphics);
  // This creates a grayscale image where:
  // - Black (0) = no pressure
  // - White (255) = maximum pressure
  // The circular layout matches your physical sensor layout

  // Update shader uniforms
  shader(theShader);
  theShader.setUniform('resolution', [width, height]);
  theShader.setUniform('time', millis() / 1000.0);
  theShader.setUniform('pressurePercentage', pressurePercentage);
  theShader.setUniform('baseTexture', baseGraphics);
  // 2. We send this pressure data to the shader as a texture
  theShader.setUniform('pressureTexture', pressureGraphics);

  // Draw a rectangle that covers the entire canvas
  rect(-width/2, -height/2, width, height);
}

// Expose functions to the global scope - otherwise can't use ES6 modules & imports
window.preload = preload;
window.setup = setup;
window.draw = draw;

// New function to draw pressure map
function drawPressureMap(g) {
  g.background(0);

  // Draw each ring
  for (let i = 0; i < numberOfCircles; i++) {
    for (let ring = 0; ring < 3; ring++) {
      const pressureIndex = (i * 3) + ring;
      const pressure = sensorValues[pressureIndex] || 0;

      // Calculate radius based on ring
      let radius;
      if (ring === 0) radius = firstRadius;
      else if (ring === 1) radius = innerRadius;
      else radius = outerRadius;

      // Calculate angles
      const angleStep = TWO_PI / numberOfCircles;
      const startAngle = i * angleStep;
      const endAngle = startAngle + angleStep;

      // Draw pressure arc
      g.noStroke();
      g.fill(pressure / MAX_PRESSURE * 255);

      // Draw arc for this sensor
      g.arc(width/2, height/2, radius * 2, radius * 2,
            startAngle, endAngle);

      // Fill in the space between rings
      if (ring < 2) {
        let nextRadius = (ring === 0) ? innerRadius : outerRadius;
        g.beginShape(TRIANGLE_STRIP);
        for (let a = startAngle; a <= endAngle; a += angleStep/8) {
          let x1 = width/2 + cos(a) * radius;
          let y1 = height/2 + sin(a) * radius;
          let x2 = width/2 + cos(a) * nextRadius;
          let y2 = height/2 + sin(a) * nextRadius;
          g.vertex(x1, y1);
          g.vertex(x2, y2);
        }
        g.endShape();
      }
    }
  }

  // TO DELETE ❌
  // // Convert sensor data from circular arrangement to radial coordinates
  // for (let i = 0; i < numberOfCircles; i++) {
  //   for (let ring = 0; ring < 3; ring++) {
  //     const pressureIndex = (i * 3) + ring;
  //     const pressure = sensorValues[pressureIndex] || 0;

  //     // Calculate sector angles
  //     const startAngle = (i * TWO_PI) / numberOfCircles;
  //     const endAngle = ((i + 1) * TWO_PI) / numberOfCircles;

  //     // Draw pressure sector
  //     g.fill(pressure / MAX_PRESSURE * 255);
  //     g.noStroke();
  //     g.arc(0, 0, outerRadius * 2, outerRadius * 2, startAngle, endAngle);
  //   }
  // }
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

    // Add marker for first sensor (r1c1) 🔴
    if (rowIndex === 0 && i === 0) {  // First circle in inner ring
      fill(255, 0, 0);  // Bright red
      noStroke();
      circle(x, y, CIRCLE_SIZE/2);  // Slightly larger than pressure indicator

      // Optional: Add text label?
      textFont(spiralFont); // Setting font before drawing text
      fill(255);  // White text
      textAlign(CENTER, CENTER);
      text("START", x, y - CIRCLE_SIZE);
    }
  }
}


// TO KEEP TRACK OF THE STATE OF THE SENSORS VS THE VISUALIZATION
const PRESSURE_STATES = {
  IDLE: 0,
  ACTIVE: 1,
  COMPLETE: 2
};

function getPressureState() {
  let activeCount = sensorValues.filter(v => v >= 150).length;
  let percentageActive = activeCount / sensorValues.length;

  if (totalPressure === 0) return PRESSURE_STATES.IDLE;
  if (percentageActive >= 0.5) return PRESSURE_STATES.ACTIVE;
  if (totalPressure >= maxTotalPressure) return PRESSURE_STATES.COMPLETE;
  return PRESSURE_STATES.IDLE;
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
