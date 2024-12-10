// Headlines can also change every 15 seconds. Too fast to read, as are news these days.
// Different fonts & colors for each headline.
// Soup letter?

import { SpiralText } from './utils/SpiralText.js';

export class SpiralScene {
  constructor(width, height, font) {
    this.width = width;
    this.height = height;
    this.spiralTexts = [];
    this.font = font;
    this.xPos = width/2; // Set initial position to center of canvas
    this.yPos = height/2; // Might not be needed

    // Array of headlines to be displayed in spiral
    this.headlines = [
      "Syrian Rebels Oust Assad, Seize Control of Damascus",
      "Elon Musk-Led Effort to Cut Federal Workforce Risks Stifling Labor Market",
      "Chiefs Offense Benefitting from Travis Kelce's New Signature Move: The Lateral",
      "Giants Face Uncertainty Due to Injuries",
      "Millions Urged to Stay at Home as Storm Darragh Hits",
      "Kate Joined by Children as She Hosts Carol Service"
    ];
  }

  // SpiralScene.setup called in main sketch.
  async setup() {
    try{
      // Load a websafe font or provide path for font file:
        // or use a web-safe font that doesn't need loading 🟢
      // this.font = spiralFont; ????????? ❌

      let currentSpiral = "";
      let spiralIndex = 0;

      // PROCESSING HEADLINES IN PAIRS
      for(let i = 0; i < this.headlines.length; i++) {
        if (currentSpiral === "") {
          currentSpiral = this.headlines[i];
        } else {
          // 🟢 Add this.headlines[i]

          // If combined length is too long, create new spiral
          if ((currentSpiral + "           " + this.headlines[i]).length > 200) { // Adjust 200 to your preferred charactermax length
            // Create spiral with single headline
            let spiral = new SpiralText(
              this.xPos,
              this.yPos,
              currentSpiral,
              20 + (spiralIndex * 5) // 1️⃣ SPIRAL STEP: Controls how much the spiral expands or contracts
            );
            spiral.setShiftSpirstepSpacestep(
              -5 + spiralIndex, // 2️⃣ ADJUST THIS NUMBER (-5) to change spiral tightness
              spiralIndex // 3️⃣ Affects letter spacing
            );
            spiral.setStartRadius(100 + (spiralIndex * 30)); // 4️⃣ Controls starting point of each spiral
            spiral.onFrameLimit();
            this.spiralTexts.push(spiral);

            currentSpiral = this.headlines[i];
            spiralIndex++;

            console.log("Creating new spiral"); // Called!
          } else {
            // Combine headlines
            currentSpiral += "                                  " + this.headlines[i];
          }
        }

        // Create final spiral if there's remaining text
          // RM i === this.headlines.length - 1 ? ❌
        if (i === this.headlines.length - 1 && currentSpiral !== "") {
          let spiral = new SpiralText(
            this.width/2,
            this.height/2,
            currentSpiral,
            20 + (spiralIndex * 5)
          );
          spiral.setShiftSpirstepSpacestep(-5 + spiralIndex, spiralIndex);
          spiral.setStartRadius(100 + (spiralIndex * 30));
          spiral.onFrameLimit();
          this.spiralTexts.push(spiral);
        }
      }

      noLoop(); // No need for continuous updates
      // Remove when animating for rotation.

      return true;
    } catch(error) {
      console.error('Error in SpiralScene.setup:', error);
      return false;
    }

  }

  draw(graphics) {
    if (!this.font) {
      console.warn('Font not loaded yet');
      return; // Don't draw if font isn't loaded
      // Could also apply another default.
    }

    if (!graphics) {
      console.error('No graphics context provided to SpiralScene.draw');
      return;
    }

    console.log('Drawing spiral scene');

    // Save graphics state
    graphics.push();

    // ♨️ FONT DEBUGGING
    // graphics.textFont(this.font, 20);
    // ♨️ FONT DEBUGGING

    graphics.textFont('Arial');
    graphics.textSize(20); // Make sure to set a text size
    graphics.background(37, 21, 31); // 🍑 BERGUNDY COLOR

    // RM ❌:
    // graphics.fill('#0E3D4D'); // NEEDED?

    // Draw each spiral text with different colors
    this.spiralTexts.forEach((spiral, index) => {
        console.log(`Drawing spiral ${index}`);

        // Create different colors for each spiral
        let hue = map(index, 0, this.headlines.length, 0, 360);
        graphics.fill(hue, 50, 50);
        spiral.setXY(this.width/2, this.height/2);
        spiral.draw(graphics); // 🌸 pass graphics context
          // Here's where SpiralText.draw is called
    });

    // ♨️ FONT DEBUGGING
    graphics.pop();
  }
}
