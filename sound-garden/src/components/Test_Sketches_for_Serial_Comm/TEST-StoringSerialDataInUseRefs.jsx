/* eslint-disable react/prop-types */
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





import { useEffect, useRef } from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";

const P5SketchWrapper = () => {
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const isConnectedRef = useRef(false);
  const p5Instance = useRef(null);
  const circleSizesRef = useRef(new Array(6).fill(0));

  // NOT THE SOLUTION APPARENTLY: Maybe save port number as a local variable so that it doesnt keep trying to recconnect?



  // Connect to serial port
  const connectSerial = async () => {
    try {
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });

      const newWriter = newPort.writable.getWriter();
      const newReader = newPort.readable.getReader();

      portRef.current = newPort;
      writerRef.current = newWriter;
      readerRef.current = newReader;
      isConnectedRef.current = true;

      // 👾 Force a re-render to hide the connect button 👾
      // Might not be needed.
      p5Instance.current?.redraw();
        // ARG: number of times to run draw(). Defaults to 1.

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
          isConnectedRef.current = false;
          break;
        }

        // Parse the CSV data
        const text = new TextDecoder().decode(value);
        const values = text.trim().split(',').map(Number);

        if (values.length === 6) {
          // The values array keeps growing
          circleSizesRef.current = values;
          // Only trigger a redraw when we have new values
          p5Instance.current?.redraw();
        }
      }
    } catch (err) {
      console.error('Error reading serial:', err);
      isConnectedRef.current = false;
    } finally { // Added clean up on disconnect, which allowed the serial monitor to keep working.
      reader.releaseLock();
      writerRef.current?.releaseLock();
      readerRef.current = null;
      writerRef.current = null;
    }
  };

  // P5 sketch
  const sketch = (p5) => {
    p5.setup = () => {
      p5Instance.current = p5;  // Storing the P5 instance 🌸
      p5.createCanvas(400, 400);
      console.log("Setup called");
    };

    p5.updateWithProps = (props) => {
      if (props.circleSizes) {
        circleSizesRef.current = props.circleSizes;
      }
    };

    p5.draw = () => {
      if (!p5Instance.current) return; // 🌸 Skip if instance isn't ready
      p5.background(220);

      // Draw 6 circles in a 3×2 grid
      const spacing = 100;
      const baseSize = 20;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const index = r * 2 + c;
          const x = (c + 1) * spacing;
          const y = (r + 1) * spacing;

          // Map sensor values to circle sizes - directly from the Ref currently
          const size = p5.map(circleSizesRef.current[index], 0, 1023, baseSize, baseSize * 3);

          p5.circle(x, y, size);
        }
      }
    };
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
      if (writerRef.current) {
        writerRef.current.releaseLock();
      }
      if (portRef.current) {
        portRef.current.close();
      }
    };
  }, []);
  // Previously we were passing a dependency array with reader, writer, port, now we're not - why?

  return (
    <div>
      {!isConnectedRef.current && (
        <button onClick={connectSerial}>Connect to Serial Port</button>
      )}
      <ReactP5Wrapper
        sketch={sketch}
        circleSizes={circleSizesRef.current}
      />
    </div>
  );
};

export default P5SketchWrapper;
