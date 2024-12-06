//// Not functional, re-renders often ////


// Solutions to issue of Setup being recalled over and over
  // useRefs instead of states.
    // There's a reason why so many people create whole state management libraries.
  // 1. const p5Instance = useRef(null); // 🌸
  // 2. in readSerial, using requestAnimationFrame to sync with the browser's refresh rate
        // if (values.length === 6) {
        //   requestAnimationFrame(() => {
        //     setCircleSizes(values);
        //   });
        // }
  // 3.       if (!p5Instance.current) return; // 🌸 Skip if instance isn't ready

// GOAL: try to remove as many delays as possible.


// // https://github.com/P5-wrapper/react
// // Using Web Serial API through navigator.serial
// // in a few weeks - not now - I should look into p5.sound

// ////// WORKS //////////
// /// Error: Unchecked runtime.lastError: The message port closed before a response was received.

// // OPEN QUESTIONS:
// // Too many loops? Arduino loops, draw function loops (@ frameCount), React fires for every draw function loop.

// // TODO:
// // Decrease delay on Arduino code side.
//   // Delay might be what's causing it to flinch.
//   // Readings aren't natural and fluid.
// // Number of sensors is hard coded in a couple places. Should make it a global variable.
// // Optimization: instead of having circle always drawing - just rerender / change size if a change has occurred.

// // Maybe the mouse event doesn't reach p5's canvas.

import { useEffect, useState } from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";

const P5SketchWrapper = () => {
  const [port, setPort] = useState(null);
  const [reader, setReader] = useState(null);
  const [writer, setWriter] = useState(null);
  // ❌ const [circleSizes, setCircleSizes] = useState(new Array(6).fill(0));
  const [sensorValues, setSensorValues] = useState([]); // Replace circleSizes
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);  // Tracking reading status

  // NOT THE SOLUTION APPARENTLY: Maybe save port number as a local variable so that it doesnt keep trying to recconnect?

  // Connect to serial port
  const connectSerial = async () => {
    try {
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });

      const newWriter = newPort.writable.getWriter();
      const newReader = newPort.readable.getReader();

      setPort(newPort);
      setWriter(newWriter);
      setReader(newReader);
      setIsConnected(true);

      // Start reading serial data
      // readSerial(newReader, newWriter);
        // OR
      // Don't start reading automatically anymore
    } catch (err) {
      console.error('Serial port error:', err);
    }
  };

  // Start reading (serial) data
  const startReading = async () => {
    console.log("startReading starts");
    if (!reader || isReading) return;

    setIsReading(true);
    try {
      while (true) {
        const { value, done } = await reader.read(); // Read the response
        if (done) {
          console.log("Serial port closed by device");
          setIsConnected(false);
          break;
        }

        // Parse the CSV data
        const text = new TextDecoder().decode(value);
        // Update data processing to match new visualization needs
        // ❌ const values = text.trim().split(',').map(Number); // Array

        const rows = text.trim().split('\n');
        const values = rows.map(row =>
          row.split(',').map(val => parseInt(val.trim()))
        );

        setSensorValues(values);
        console.log(values, "values from setSensorValues");
      }
    } catch (err) {
      console.error('Error reading serial:', err);
      setIsConnected(false);
    } finally {
      setIsReading(false);


      // This used to have clean up on disconnect, which is allowed the serial monitor to keep working when it stopped.
      // reader.releaseLock();
      // writer.releaseLock();
      // setReader(null);
      // setWriter(null);
    }
  };

  // P5 sketch
  const sketch = (p5) => {
    // New visualization states
    let ripples = [];
    let lotuses = [];
    let caustics = [];

    p5.setup = () => {
      p5.createCanvas(800, 600);
      p5.noSmooth(); // helpful for scaling up images without blurring



      // Initialize caustics grid
      for (let i = 0; i < p5.width; i += 20) {
        for (let j = 0; j < p5.height; j += 20) {
          caustics.push({ x: i, y: j, offset: p5.random(p5.TWO_PI) });
        }
      }
    };

    // Helper functions for the new visualization
    const drawRipple = (x, y, size) => {
      p5.noFill();
      p5.stroke(255, 255, 255, 100);
      p5.strokeWeight(2);
      p5.ellipse(x, y, size, size);
    };

    const drawBloomingLotus = (x, y, frame) => {
      p5.push();
      p5.translate(x, y);

      const scaleAmount = p5.map(frame, 0, 30, 0, 1);
      p5.noStroke();

      p5.fill(255, 182, 193);
      for (let angle = 0; angle < p5.TWO_PI; angle += p5.PI / 6) {
        const petalX = p5.cos(angle) * 30 * scaleAmount;
        const petalY = p5.sin(angle) * 30 * scaleAmount;
        p5.ellipse(petalX, petalY, 20 * scaleAmount);
      }

      p5.fill(255, 105, 180);
      p5.ellipse(0, 0, 20 * scaleAmount);
      p5.pop();
    };

    const drawCaustics = () => {
      p5.noStroke();
      p5.fill(255, 255, 255, 30);

      for (let caustic of caustics) {
        const wave = p5.sin(p5.frameCount * 0.05 + caustic.offset) * 5;
        p5.ellipse(caustic.x + wave, caustic.y + wave, 15, 15);
      }
    };

    // mousePressed handler for toggling reading
    p5.mousePressed = () => {
      if (isConnected) {
        if (!isReading) {
          startReading();
        } else {
          if (reader) {
            reader.cancel();
          }
        }
      }
    };

    p5.draw = () => {
      // For deep blue water
      p5.background(0, 0, 150); // ⚪️ Background should be in setup OR maybe not?

      drawCaustics();

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        drawRipple(ripple.x, ripple.y, ripple.size);
        ripple.size += 2;

        if (ripple.size > 100) {
          lotuses.push({ x: ripple.x, y: ripple.y, frame: 0 });
          ripples.splice(i, 1);
        }
      }

      // Update and draw lotuses
      for (let i = lotuses.length - 1; i >= 0; i--) {
        const lotus = lotuses[i];
        drawBloomingLotus(lotus.x, lotus.y, lotus.frame);
        if (lotus.frame < 30) {
          lotus.frame++;
        } else {
          lotuses.splice(i, 1);
        }
      }

      // Process sensor values
      if (sensorValues.length > 0) {
        for (let r = 0; r < sensorValues.length; r++) {
          for (let c = 0; c < sensorValues[r].length; c++) {
            if (sensorValues[r][c] > 100) {
              const x = p5.map(c, 0, sensorValues[r].length, -p5.width/4, p5.width/4) + p5.width/2;
              const y = p5.map(r, 0, sensorValues.length, -p5.height/4, p5.height/4) + p5.height/2;
              ripples.push({ x, y, size: 10 });
            }
          }
        }
      }

      // // ❌ Draw 6 circles in a 3×2 grid
      // const spacing = 100;
      // const baseSize = 20;

      // for (let r = 0; r < 3; r++) {
      //   for (let c = 0; c < 2; c++) {
      //     const index = r * 2 + c;
      //     const x = (c + 1) * spacing;
      //     const y = (r + 1) * spacing;

      //     // Map sensor values to circle sizes
      //     const size = p5.map(circleSizes[index], 0, 1023, baseSize, baseSize * 3);
      //     // ⚪️ lower threshold

      //     // ⚪️ Set circle style here
      //     p5.fill(181, 79, 111);
      //     p5.circle(x, y, size);
      //   }
      // }

      // Draw status text
      p5.fill(255);
      p5.textSize(16);
      p5.text(isReading ? "Reading data...(Click to stop)" : "Click to start reading", 10, 30);
    };
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (reader) {
        reader.cancel();
      }
      if (writer) {
        writer.releaseLock();
      }
      if (port) {
        port.close();
      }
    };
  }, [reader, writer, port]);

  return (
    <div>
      {!isConnected && (
        <button onClick={connectSerial}>Connect to Serial Port</button>
      )}
      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
};

export default P5SketchWrapper;
