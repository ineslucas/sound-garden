// https://github.com/P5-wrapper/react
// Using Web Serial API through navigator.serial
// in a few weeks - not now - I should look into p5.sound

////// WORKS //////////
/// Error: Unchecked runtime.lastError: The message port closed before a response was received.

// OPEN QUESTIONS:
// Too many loops? Arduino loops, draw function loops, React fires for every draw function loop.

// TODO:
// Decrease delay on Arduino code side.

import { useEffect, useState } from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";

const P5SketchWrapper = () => {
  const [port, setPort] = useState(null);
  const [reader, setReader] = useState(null);
  const [writer, setWriter] = useState(null);
  const [circleSizes, setCircleSizes] = useState(new Array(6).fill(0));
  const [isConnected, setIsConnected] = useState(false);

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
      readSerial(newReader, newWriter);
    } catch (err) {
      console.error('Serial port error:', err);
    }
  };

  // Read serial data
  const readSerial = async (reader) => { // , writer
    try {
      while (true) {
        // Request new readings - Write operation removed since Arduino is sending data automatically
        // const encoder = new TextEncoder();
        // await writer.write(encoder.encode('0'));

        // Read the response
        const { value, done } = await reader.read();
        if (done) {
          console.log("Serial port closed by device");
          setIsConnected(false);
          break;
        }

        // Parse the CSV data
        const text = new TextDecoder().decode(value);
        const values = text.trim().split(',').map(Number);

        if (values.length === 6) {
          setCircleSizes(values);
        }
      }
    } catch (err) {
      console.error('Error reading serial:', err);
      setIsConnected(false);
    } finally { // Added clean up on disconnect, which allowed the serial monitor to keep working.
      reader.releaseLock();
      writer.releaseLock();
      setReader(null);
      setWriter(null);
    }
  };

  // P5 sketch
  const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(400, 400);
    };

    p5.draw = () => {
      p5.background(220);

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

          p5.circle(x, y, size);
        }
      }
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
