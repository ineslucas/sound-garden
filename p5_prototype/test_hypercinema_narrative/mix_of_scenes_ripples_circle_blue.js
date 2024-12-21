//// WORK IN PROGRESS - Working version shown for pcomp final //////

let cols, rows,
    current = [], // Current state of the wave simulation
    previous = [], // Previous state of the wave simulation
    damping = 0.99; // Damping factor to reduce wave energy over time

// Sensor-related variables
let sensorValues = Array(108).fill(0); // Array to store sensor values
const numberOfCircles = 36; // Number of circles for sensor data mapping
const firstRadius = 130; // Radius for the first ring of sensors
const innerRadius = 200; // Radius for the second ring of sensors
const outerRadius = 300; // Radius for the third ring of sensors
const MAX_PRESSURE = 200; // Maximum pressure value from sensors

// Audio variables
let track1, track2;
let filter; // Audio filter
let lastFadeValue = 0;  // For smooth transitions between audio tracks

// Serial variables
let serial;
let port;
let reader;
let decoder = new TextDecoder(); // Decoder for serial data
let inputBuffer = ''; // Buffer to accumulate serial data


function preload() {
    // Preload two music tracks
    track1 = loadSound('assets/songs/Signal_spiral_A1_Raster_Noton_Archiv_1_2004.mp3');
    // ZELDA SONG:
    // track2 = loadSound('assets/songs/Stables_the_Legend_of_Zelda_ Breath_of_the_Wild_OST.mp3');
    track2 = loadSound('assets/songs/Plantasia.mp3');

}

// CLIP BACKGROUND TO A CIRCLE.
// USE CSS TO PUT THE CANVAS IN THE CENTER OF THE PAGE - horizontal and vertical.
// + scale.

function setup() {
    pixelDensity(1);
    createCanvas(800, 800); // SIMPLE CANVAS.
    cols = width;
    rows = height;


    // Initialize wave arrays
    for (let i = 0; i < cols; i++) {
        current[i] = []; // Initialize current wave state
        previous[i] = []; // Initialize previous wave state
        for (let j = 0; j < rows; j++) {
            current[i][j] = 0; // Set initial wave value to 0
            previous[i][j] = 0;
        }
    }

    // Audio setup
    filter = new p5.LowPass(); // Create a low-pass filter
    track1.disconnect(); // Disconnect track1 from default output
    track2.disconnect(); // Disconnect track2 from default output
    track1.connect(filter); // Connect track1 to the filter
    track2.connect(filter); // Connect track2 to the filter

    // Create connect button for serial communication
    let connectButton = createButton("Connect to Serial");
    connectButton.position(10, 10);
    connectButton.mousePressed(connectToSerial);

    // Create a button to start audio
    let startAudioButton = createButton("Start Audio");
    startAudioButton.position(10, 40);
    startAudioButton.mousePressed(startAudio);
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
      current[x][y] = 500; // Set wave intensity at mouse position
        // Because current is the current state of the wave.
  }
}

// AUDIO FUNCTIONS
function startAudio() {
    // Start both tracks playing but set their volume to 0 initially
      // What sets off the audio?  🌸
      // Audio starts when the sensor values are processed and ripples are created.
        // Meaning:
            // Audio starts when you click the button
            // + when you trigger a ripple.
    track1.loop();
    track1.amp(0);
    track2.loop();
    track2.amp(0);
}

function draw() {
    background(0, 117, 148);

    // Reset ripple intensity tracking
    let totalRippleIntensity = 0;
              // Variable to track total ripple intensity

    // Process sensor data and create ripples
    for (let i = 0; i < numberOfCircles; i++) {
        for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
            const pressureIndex = (i * 3) + ringIndex; // Calculate sensor index
            const pressure = sensorValues[pressureIndex] || 0; // Get pressure value

            if (pressure > 40) {  // Threshold for sensor values to avoid noise
                let radius;
                switch(ringIndex) {
                    case 0: radius = firstRadius; break; // Set radius for first ring
                    case 1: radius = innerRadius; break;
                    case 2: radius = outerRadius; break;
                }

                // Calculate position on the circle
                const angle = (-i * TWO_PI) / numberOfCircles; // Calculate angle for circle position
                const x = (width/2) + radius * cos(angle);
                const y = (height/2) + radius * sin(angle);

                // Create ripple at sensor position
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const rippleStrength = map(pressure, 0, MAX_PRESSURE, 0, 500);
                    current[Math.floor(x)][Math.floor(y)] = rippleStrength;

                    // When a sensor value exceeds a certain threshold,
                    // a ripple is initiated by setting a high intensity value
                    // at the corresponding position in the current array.
                    // This with the line current[Math.floor(x)][Math.floor(y)] = rippleStrength;.
                }
            }
        }
    }

    // Draw wave ripples and calculate total intensity
    loadPixels();
    for (let i = 1; i < cols - 1; i++) {
        // Iterate over each pixel in the current state of the wave
        // Going through the array of pixels!
          // Changing it's color. The changing of the color itself is done through pixels.

        for (let j = 1; j < rows - 1; j++) {
            // Calculate new wave value based on neighbors
            current[i][j] =
                (previous[i - 1][j] + previous[i + 1][j] +
                    previous[i][j - 1] + previous[i][j + 1] +
                    previous[i - 1][j - 1] + previous[i - 1][j + 1] +
                    previous[i + 1][j - 1] + previous[i + 1][j + 1]
                ) / 4 - current[i][j];
            current[i][j] = current[i][j] * damping;

            // Track total ripple intensity
            totalRippleIntensity += Math.abs(current[i][j]);

            // Setting colors of pixels
            let index = (i + j * cols) * 4;
            let val = 255 - Math.abs(current[i][j]);

            // WHITE
            // pixels[index + 0] = val; // Red channel
            // pixels[index + 1] = val; // Green channel
            // pixels[index + 2] = val; // Blue channel
            // pixels[index + 3] = 255; // Alpha channel

            // BLUE
            pixels[index + 0] = 0; // Red channel
            pixels[index + 1] = map(val, 0, 255, 0, 117); // Green channel
            pixels[index + 2] = map(val, 0, 255, 0, 148); // Blue channel
            pixels[index + 3] = 255; // Alpha channel
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
