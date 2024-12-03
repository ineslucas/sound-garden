// https://github.com/P5-wrapper/react
// Using Web Serial API through navigator.serial
// in a few weeks - not now - I should look into p5.sound

////// WORKS //////////
/// Error: Unchecked runtime.lastError: The message port closed before a response was received.

// OPEN QUESTIONS:
// Too many loops? Arduino loops, draw function loops, React fires for every draw function loop.

// TODO:
// Decrease delay on Arduino code side.
// Number of sensors is hard coded in a couple places. Should make it a global variable.
// Optimization: instead of having circle always drawing - just rerender / change size if a change has occurred.

// Maybe the mouse event doesn't reach p5's canvas.

import { useEffect, useState } from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";

const P5SketchWrapper = () => {
  const [port, setPort] = useState(null);
  const [reader, setReader] = useState(null);
  const [writer, setWriter] = useState(null);
  const [circleSizes, setCircleSizes] = useState(new Array(6).fill(0));
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
        const values = text.trim().split(',').map(Number);

        if (values.length === 6) { // ⚪️ number of values hard coded.
          setCircleSizes(values);
        }
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
    p5.setup = () => {
      p5.createCanvas(400, 400);
      p5.background(220); // Probably best for it to go in setup ⚪️
    };

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


      // Draw 6 circles in a 3×2 grid
      const spacing = 100;
      const baseSize = 20;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const index = r * 2 + c;
          const x = (c + 1) * spacing;
          const y = (r + 1) * spacing;

          // Map sensor values to circle sizes
          const size = p5.map(circleSizes[index], 0, 1023, baseSize, baseSize * 3);

          // ⚪️ Set circle style here
          p5.fill(181, 79, 111);
          p5.circle(x, y, size);
        }
      }

      // Draw status text
      p5.fill(0);
      p5.noStroke();
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
