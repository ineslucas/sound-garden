// You're going to be my coding mentor and help me strategize.
// I've built a home made pressure sensor. It provides 108 values from serial communication that are layed out in 3 circles. They are currently super well mapped in space in the testing_values_sketch_circles.js sketch.
// The idea is for the points of the testing_values_sketch_circles.js sketch to visually correspond to a visual. Visual changes in the same place as the person presses the force sensing resistor, causing the value to increase. In this case, the opacity of the circle that corresponds to the physical sensor increases.

// But actually what we want is to have 3 modes.

// - Text spirals
// - Transition of text spirals into blue circle
// - Blue circle

// Eventually the idea is that if all the values in the serial communication are mapped to whether those spots of the circle are showing the text spirals scene or whether they're showing blue. And I want the appearance of blue to have a correlation to the physical reality.



// I'm not sure if I'm explaining my vision well, so fell free to ask clarifying questions.

//// ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌

////
 ////// INCOMPLETE SKETCH //////
                    //////
                        //////

      //// ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
      // Check which one is at the HTML.




// Headlines can also change every 15 seconds. Too fast to read, as are news these days.
// Different fonts & colors for each headline.
// Soup letter?

// Array of headlines to be displayed in spiral
let headlines = [
  "Syrian Rebels Oust Assad, Seize Control of Damascus",
  "Elon Musk-Led Effort to Cut Federal Workforce Risks Stifling Labor Market",
  "Chiefs Offense Benefitting from Travis Kelce's New Signature Move: The Lateral",
  "Giants Face Uncertainty Due to Injuries",
  "Millions Urged to Stay at Home as Storm Darragh Hits",
  "Kate Joined by Children as She Hosts Carol Service"
];

let xPos, yPos; // position of the text
let font;
// let txtSp; // Spiral text object
let spiralTexts = []; // Array to hold multiple SpiralText objects

function setup() {
  createCanvas(800, 800);
  xPos = width/2; // Set initial position to center of canvas
  yPos = height/2; // Might not be needed
  font = loadFont('Arial Bold'); // Font

  let currentSpiral = "";
  let spiralIndex = 0;

  // PROCESSING HEADLINES IN PAIRS
  for(let i = 0; i < headlines.length; i++) {
    if (currentSpiral === "") {
      currentSpiral = headlines[i];
    } else {
      // If combined length is too long, create new spiral
      if ((currentSpiral + "           " + headlines[i]).length > 200) { // Adjust 200 to your preferred charactermax length
        // Create spiral with single headline
        let spiral = new SpiralText(
          xPos,
          yPos,
          currentSpiral,
          20 + (spiralIndex * 5) // 1️⃣ SPIRAL STEP: Controls how much the spiral expands or contracts
        );
        spiral.setShiftSpirstepSpacestep(
          -5 + spiralIndex, // 2️⃣ ADJUST THIS NUMBER (-5) to change spiral tightness
          spiralIndex // 3️⃣ Affects letter spacing
        );
        spiral.setStartRadius(100 + (spiralIndex * 30)); // 4️⃣ Controls starting point of each spiral
        spiral.onFrameLimit();
        spiralTexts.push(spiral);

        currentSpiral = headlines[i];
        spiralIndex++;
      } else {
        // Combine headlines
        currentSpiral += "                                  " + headlines[i];
      }
    }

    // Create final spiral if there's remaining text
    if (i === headlines.length - 1 && currentSpiral !== "") {
      let spiral = new SpiralText(xPos, yPos, currentSpiral, 20 + (spiralIndex * 5));
      spiral.setShiftSpirstepSpacestep(-5 + spiralIndex, spiralIndex);
      spiral.setStartRadius(100 + (spiralIndex * 30));
      spiral.onFrameLimit();
      spiralTexts.push(spiral);
    }
  }

  noLoop(); // No need for continuous updates
    // Remove when animating for rotation.
}

function draw() {
  background(37, 21, 31);
  smooth(); // Smooth edges for circular background - here or in setup?

  // CLIP BACKGROUND: Clip everything to a circle
  clip(() => {
    circle(width/2, height/2, width);
  });

  textFont(font, 20);
  fill('#0E3D4D');

  // Draw each spiral text with different colors
  spiralTexts.forEach((spiral, index) => {
    // Create different colors for each spiral
    let hue = map(index, 0, headlines.length, 0, 360);
    fill(hue, 50, 50);

    spiral.setXY(width/2, height/2);
    spiral.draw();
  });
}
