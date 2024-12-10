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


  // Create a spiral text object for each headline - 1 AT A TIME
  // Each spiral will have different parameters to create layered effect
  // headlines.forEach((headline, index) => {
  //   let spiral = new SpiralText(
  //     xPos,
  //     yPos,
  //     headline,
  //     20 + (index * 5) // 1️⃣ SPIRAL STEP: Controls how much the spiral expands or contracts
  //   );

  //   spiral.setShiftSpirstepSpacestep(
  //     -5 + (index), // 2️⃣ SPIRAL RING STEP: Affects spiral tightness
  //     index // 3️⃣ SPACE STEP: Controls letter spacing
  //   );

  //   spiral.setStartRadius(100 + (index * 30));
  //     // Increasing start radius for each spiral
  //     // Controls how far each spiral starts from center
  //   spiral.onFrameLimit();
  //   spiralTexts.push(spiral);
  // });

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

class SpiralText {
  constructor(in_posX, in_posY, in_txt, in_spiralStep) {
    this.xPos = in_posX;
    this.yPos = in_posY;
    this.spiralText = in_txt || "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.";
    this.startRadius = 5;
    this.spiralRingStep = in_spiralStep;
    this.shiftSpiralRingStep = 0;
    this.shiftSpiralSpaceStep = 0;
    this.isFrameLimitMode = false;
    this.isClrImageMode = false;
    this.spirImg = null;
    this.borderDistance = -5;
    this.startAngle = 0;
  }

  setText(in_txt) {
    if (in_txt.length > 0) {
      this.spiralText = in_txt;
    }
  }

  setBorderDistance(in_brdrDistance) {
    this.borderDistance = in_brdrDistance;
  }

  setXY(in_posX, in_posY) {
    this.xPos = in_posX;
    this.yPos = in_posY;
  }

  shiftXY(in_posX, in_posY) {
    this.xPos += in_posX;
    this.yPos += in_posY;
  }

  setParam(in_posX, in_posY, in_txt, in_spiralStep) {
    this.setXY(in_posX, in_posY);
    this.setText(in_txt);
    this.setSpiralStep(in_spiralStep);
  }

  setShiftSpirstepSpacestep(in_shiftSpirStep, int_shiftSpirSpaceStep) {
    this.shiftSpiralRingStep = in_shiftSpirStep;
    this.shiftSpiralSpaceStep = int_shiftSpirSpaceStep;
  }

  setSpiralStep(in_spiralStep) {
    this.spiralRingStep = in_spiralStep;
  }

  setStartRadius(in_startRadius) {
    this.startRadius = in_startRadius <= 0 ? 5 : in_startRadius;
  }

  setStartAngleRadian(in_startAngle) {
    this.startAngle = degrees(in_startAngle);
  }

  setStartAngleDegree(in_startAngle) {
    this.startAngle = in_startAngle;
  }

  onFrameLimit() {
    this.isFrameLimitMode = true;
  }

  offFrameLimit() {
    this.isFrameLimitMode = false;
  }

  draw() {
    textAlign(CENTER);
    let iterCharPos = 0;
    let angle = this.startAngle;
    let currRadius = this.startRadius;
    let spiralSpaceStep = 0;
    let xx = 0;
    let yy = 0;
    let angleStep = 0;
    let radiusStep = 0;

    while (iterCharPos < this.spiralText.length) {
      let currSymbol = this.spiralText.charAt(iterCharPos);
      let currSymbolWidth = textWidth(currSymbol);
      spiralSpaceStep = currSymbolWidth + this.shiftSpiralSpaceStep;
      let countOfsymb = TWO_PI * currRadius / spiralSpaceStep;
      radiusStep = (this.spiralRingStep + this.shiftSpiralRingStep) / countOfsymb;
      currRadius += radiusStep;

      angleStep += currSymbolWidth / 2 + this.shiftSpiralSpaceStep / 2;
      angle += angleStep / currRadius;
      angleStep = currSymbolWidth / 2 + this.shiftSpiralSpaceStep / 2;

      xx = cos(angle) * currRadius + this.xPos;
      yy = sin(angle) * currRadius + this.yPos;

      if (this.isFrameLimitMode && (xx-10 < 0 || xx+10 > width || yy-10 < 0 || yy+10 > height)) {
        break;
      } else if (!(xx < this.borderDistance || xx > width - this.borderDistance ||
                   yy < this.borderDistance || yy > height - this.borderDistance)) {
        push();
        translate(xx, yy);
        rotate(PI/2 + angle);
        text(currSymbol, 0, 0);
        pop();
      } else if (dist(xx, yy, this.xPos, this.yPos) > dist(this.xPos, this.yPos, this.borderDistance, this.borderDistance) &&
                 dist(xx, yy, this.xPos, this.yPos) > dist(this.xPos, this.yPos, width - this.borderDistance, this.borderDistance) &&
                 dist(xx, yy, this.xPos, this.yPos) > dist(this.xPos, this.yPos, width - this.borderDistance, height - this.borderDistance) &&
                 dist(xx, yy, this.xPos, this.yPos) > dist(this.xPos, this.yPos, this.borderDistance, height - this.borderDistance)) {
        break;
      }
      iterCharPos++;
    }
  }
}
