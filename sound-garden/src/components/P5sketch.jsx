// Need p5 Web Serial but maybe not, if I have the Arduino code file inside of this React project.

import { useRef, useEffect } from 'react';
import p5 from 'p5';

const P5sketch = () => {
  const sketchRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(700, 400);
        p.background(200);
      };

      p.draw = () => {
        p.fill(181, 79, 111);
        p.noStroke();
        p.rect(200, 200, 100, 50);  // x, y, width, height
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

export default P5sketch;
