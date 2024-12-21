let cols, rows,
    current = [],
    previous = [],
    damping = 0.99;

// Sensor-related variables
let sensorValues = Array(108).fill(0);
const numberOfCircles = 36;
const firstRadius = 130;
const innerRadius = 200;
const outerRadius = 300;
const MAX_PRESSURE = 200;

// Audio variables
let track1, track2;
let filter;
let lastFadeValue = 0;  // For smooth transitions

// Serial variables
let serial;
let port;
let reader;
let decoder = new TextDecoder();
let inputBuffer = '';

function preload() {
    // Preload two music tracks
    track1 = loadSound('assets/songs/Signal_spiral_A1_Raster_Noton_Archiv_1_2004.mp3');
    // track2 = loadSound('assets/songs/Stables_the_Legend_of_Zelda_ Breath_of_the_Wild_OST.mp3');
    track2 = loadSound('assets/songs/Plantasia.mp3');
}

// CLIP BACKGROUND TO A CIRCLE.
// USE CSS TO PUT THE CANVAS IN THE CENTER OF THE PAGE - horizontal and vertical.
// + scale.

function setup() {
    pixelDensity(1);
    createCanvas(800, 800);
    cols = width;
    rows = height;

    // Initialize wave arrays
    for (let i = 0; i < cols; i++) {
        current[i] = [];
        previous[i] = [];
        for (let j = 0; j < rows; j++) {
            current[i][j] = 0;
            previous[i][j] = 0;
        }
    }

    // Audio setup
    filter = new p5.LowPass();
    track1.disconnect();
    track2.disconnect();
    track1.connect(filter);
    track2.connect(filter);

    // Start both tracks playing but set their volume to 0 initially
    track1.loop();
    track1.amp(0);
    track2.loop();
    track2.amp(0);

    // Create connect button
    let connectButton = createButton("Connect to Serial");
    connectButton.position(10, 10);
    connectButton.mousePressed(connectToSerial);
}

// Mouse interaction for testing
function mouseDragged() {
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if (x >= 0 && x < width && y >= 0 && y < height) {
      current[x][y] = 500;
  }
}

function mousePressed() {
  let x = Math.floor(mouseX);
  let y = Math.floor(mouseY);
  if (x >= 0 && x < width && y >= 0 && y < height) {
      current[x][y] = 500;
  }
}

function draw() {
    background(0, 117, 148);

    // Reset ripple intensity tracking
    let totalRippleIntensity = 0;

    // Process sensor data and create ripples
    for (let i = 0; i < numberOfCircles; i++) {
        for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
            const pressureIndex = (i * 3) + ringIndex;
            const pressure = sensorValues[pressureIndex] || 0;

            if (pressure > 20) {  // Threshold to avoid noise
                let radius;
                switch(ringIndex) {
                    case 0: radius = firstRadius; break;
                    case 1: radius = innerRadius; break;
                    case 2: radius = outerRadius; break;
                }

                // Calculate position on the circle
                const angle = (-i * TWO_PI) / numberOfCircles;
                const x = (width/2) + radius * cos(angle);
                const y = (height/2) + radius * sin(angle);

                // Create ripple at sensor position
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const rippleStrength = map(pressure, 0, MAX_PRESSURE, 0, 500);
                    current[Math.floor(x)][Math.floor(y)] = rippleStrength;
                }
            }
        }
    }

    // Draw wave ripples and calculate total intensity
    loadPixels();
    for (let i = 1; i < cols - 1; i++) {
        for (let j = 1; j < rows - 1; j++) {
            current[i][j] =
                (previous[i - 1][j] + previous[i + 1][j] +
                    previous[i][j - 1] + previous[i][j + 1] +
                    previous[i - 1][j - 1] + previous[i - 1][j + 1] +
                    previous[i + 1][j - 1] + previous[i + 1][j + 1]
                ) / 4 - current[i][j];
            current[i][j] = current[i][j] * damping;

            // Track total ripple intensity
            totalRippleIntensity += Math.abs(current[i][j]);

            let index = (i + j * cols) * 4;
            let val = 255 - Math.abs(current[i][j]);
            pixels[index + 0] = val;
            pixels[index + 1] = val;
            pixels[index + 2] = val;
            pixels[index + 3] = 255;
        }
    }
    updatePixels();

    // Normalize the ripple intensity and use it for audio transition
    let fadeValue = map(totalRippleIntensity, 0, width * height * 0.1, 0, 1);
    fadeValue = constrain(fadeValue, 0, 1);

    // Smooth the transition
    fadeValue = lerp(lastFadeValue, fadeValue, 0.1);
    lastFadeValue = fadeValue;

    // Update audio - track1 plays when calm, track2 plays with ripples
    track1.amp(1 - fadeValue);  // Track 1 plays when water is calm
    track2.amp(fadeValue);      // Track 2 plays when there are ripples

    // Apply filter effect during transition
    let cutoffFreq = map(fadeValue, 0, 1, 400, 22050);
    filter.freq(cutoffFreq);

    // Swap buffers for wave simulation
    let temp = previous;
    previous = current;
    current = temp;
}

// Serial connection and processing functions
async function connectToSerial() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        serial = port.readable.getReader();
        console.log("Serial connection established");
        readSerial();
    } catch (err) {
        console.error("Error connecting to serial:", err);
    }
}

async function readSerial() {
    while (port.readable) {
        try {
            const { value, done } = await serial.read();
            if (done) {
                console.log("Serial connection closed");
                serial.releaseLock();
                break;
            }
            const data = decoder.decode(value);
            inputBuffer += data;

            let newlineIndex = inputBuffer.indexOf('\n');
            while (newlineIndex !== -1) {
                const line = inputBuffer.substring(0, newlineIndex).trim();
                inputBuffer = inputBuffer.substring(newlineIndex + 1);
                if (line) {
                    console.log("Complete line received:", line);
                    processSerialData(line);
                }
                newlineIndex = inputBuffer.indexOf('\n');
            }
        } catch (err) {
            console.error("Error reading serial data:", err);
            break;
        }
    }
}

function processSerialData(data) {
    let values = data
        .split(",")
        .filter(val => val.trim() !== '')
        .map(val => parseInt(val.trim()));

    if (values.length === 108) {
        sensorValues = values;
        console.log("Processed values:", values);
    } else {
        console.log("Incomplete data received, length:", values.length);
    }
}
