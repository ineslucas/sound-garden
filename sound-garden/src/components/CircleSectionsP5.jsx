import { useRef, useEffect } from 'react';
import p5 from 'p5';

const CircleSectionsP5 = () => {
  const sketchRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      let numSlices = 30; // Number of slices
      let radius = 200;

      p.setup = () => {
        p.createCanvas(400, 400);
      };

      p.draw = () => {
        p.background(255);

        p.push();
        p.translate(p.width / 2, p.height / 2); // Centering the pie
        drawPie(numSlices, radius);
        drawCenterCircle(200); // Draw the central circle
        p.pop();

        drawRulers(100); // Optional rulers for debugging
      };

      const drawPie = (numSlices, radius) => {
        let angleStep = p.TWO_PI / numSlices; // Angle for each slice

        for (let i = 0; i < numSlices; i++) {
          let startAngle = i * angleStep;
          let endAngle = startAngle + angleStep;

          // Check if mouse is within this slice
          if (isMouseInSlice(startAngle, endAngle, radius)) {
            p.fill(255, 100, 100); // Highlight color for the slice
          } else {
            p.fill((i * 20) % 255, 150, 200); // Default color for the slice
          }

          p.stroke(0);
          p.strokeWeight(1);
          p.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, p.PIE);
        }
      };

      const isMouseInSlice = (startAngle, endAngle, radius) => {
        // Calculate mouse position relative to the pie chart's center
        let mx = p.mouseX - p.width / 2;
        let my = p.mouseY - p.height / 2;
        let distance = Math.sqrt(mx * mx + my * my);

        if (distance > radius || distance < radius / 2) {
          return false; // Mouse is outside the pie chart
        }

        // Calculate the angle of the mouse from the center
        let angle = Math.atan2(my, mx);
        if (angle < 0) {
          angle += p.TWO_PI; // Normalize the angle to [0, TWO_PI]
        }

        // Check if the angle is within the slice
        return angle >= startAngle && angle < endAngle;
      };

      const drawCenterCircle = (diameter) => {
        p.fill(255); // White circle
        p.noStroke();
        p.ellipse(0, 0, diameter, diameter); // Draw circle at the center
      };

      const drawRulers = (spacing) => {
        p.push();
        p.noStroke();
        p.fill(139, 0, 139);
        for (let x = 0; x < p.width; x += spacing) {
          p.rect(x, 0, 1, p.height);
        }
        for (let y = 0; y < p.height; y += spacing) {
          p.rect(0, y, p.width, 1);
        }
        p.pop();
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current);

    // Clean up on component unmount
    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={sketchRef}></div>;
};

export default CircleSectionsP5;
