export class SpiralText {
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

  draw(graphics) {
    if (!graphics) {
      console.error('No graphics context provided to SpiralText.draw');
      return;
    }

    // Check if the graphics context is P2D
    if (graphics._renderer.drawingContext instanceof CanvasRenderingContext2D) {
      console.log('Graphics context is P2D');
    } else {
        console.error('Graphics context is not P2D');
        return;
    }



    // Add debugging
    console.log('Drawing spiral text');
    console.log('Graphics renderer:', graphics._renderer.type);
    console.log('Current font:', graphics._renderer.textFont);
    // console.log('Drawing spiral text with font:', graphics._textFont);
    console.log('Text to draw:', this.spiralText);

    // ♨️ FONT DEBUGGING ADDED
    // Explicitly set font before drawing
    graphics.push(); // Save current graphics state

    // To have a graphics argument, from where do I pass it?
    graphics.textSize(20); // Make sure text size is set
    graphics.textFont('Arial');  // Set font before drawing?
    graphics.textAlign(CENTER);
      // CENTER, CENTER); // Use both horizontal and vertical alignment?

    // textAlign(CENTER);


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
      let currSymbolWidth = graphics.textWidth(currSymbol);
        // Added graphics argument!!!
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

    // ♨️ FONT DEBUGGING ADDED
    graphics.pop(); // Restore graphics state
  }
}
