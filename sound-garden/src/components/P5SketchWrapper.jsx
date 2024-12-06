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


// // Solutions to issue of Setup being recalled over and over
//   // useRefs instead of states.
//     // There's a reason why so many people create whole state management libraries.
//   // 1. const p5Instance = useRef(null); // 🌸
//   // 2. in readSerial, using requestAnimationFrame to sync with the browser's refresh rate
//         // if (values.length === 6) {
//         //   requestAnimationFrame(() => {
//         //     setCircleSizes(values);
//         //   });
//         // }
//   // 3.       if (!p5Instance.current) return; // 🌸 Skip if instance isn't ready

// // GOAL: try to remove as many delays as possible.


// // // https://github.com/P5-wrapper/react
// // // Using Web Serial API through navigator.serial
// // // in a few weeks - not now - I should look into p5.sound

// // ////// WORKS //////////
// // /// Error: Unchecked runtime.lastError: The message port closed before a response was received.

// // // OPEN QUESTIONS:
// // // Too many loops? Arduino loops, draw function loops (@ frameCount), React fires for every draw function loop.

// // // TODO:
// // // Decrease delay on Arduino code side.
// //   // Delay might be what's causing it to flinch.
// //   // Readings aren't natural and fluid.
// // // Number of sensors is hard coded in a couple places. Should make it a global variable.
// // // Optimization: instead of having circle always drawing - just rerender / change size if a change has occurred.

// // // Maybe the mouse event doesn't reach p5's canvas.

// import { useEffect, useRef } from 'react';
// import { ReactP5Wrapper } from "@p5-wrapper/react";

// const P5SketchWrapper = () => {
//   // useRef instead of States to avoid a retrigger
//   const portRef = useRef(null);
//   const readerRef = useRef(null);
//   const writerRef = useRef(null);
//   const isConnectedRef = useRef(false);
//   const isReadingRef = useRef(false);
//   const p5Instance = useRef(null);
//   const sensorValuesRef = useRef([]);

//   // Visualization state refs
//   const ripplesRef = useRef([]);
//   const lotusesRef = useRef([]);
//   const causticsRef = useRef([]);

//   // NOT THE SOLUTION APPARENTLY: Maybe save port number as a local variable so that it doesnt keep trying to recconnect?

//   // Connect to serial port
//   const connectSerial = async () => {
//     try {
//       const newPort = await navigator.serial.requestPort();
//       await newPort.open({ baudRate: 9600 });

//       const newWriter = newPort.writable.getWriter();
//       const newReader = newPort.readable.getReader();

//       portRef.current = newPort;
//       writerRef.current = newWriter;
//       readerRef.current = newReader;
//       isConnectedRef.current = true;

//       p5Instance.current?.redraw();

//       // Start reading serial data
//       // readSerial(newReader, newWriter);
//         // OR
//       // Don't start reading automatically anymore
//     } catch (err) {
//       console.error('Serial port error:', err);
//     }
//   };

//   // Start reading (serial) data
//   const startReading = async () => {
//     console.log("startReading function starts");
//     // add console logs for ref 🟢
//     if (!readerRef.current || isReadingRef.current) return;


//     isReadingRef.current = true;
//     try {
//       while (isReadingRef.current) { // isReadingRef controls the loop
//         const { value, done } = await readerRef.current.read(); // Read the response
//         if (done) {
//           console.log("Serial port closed by device");
//           isConnectedRef.current = false;
//           break;
//         }

//         // Parse the CSV data
//         const text = new TextDecoder().decode(value);
//         // Update data processing to match new visualization needs
//         // ❌ const values = text.trim().split(',').map(Number); // Array

//         const rows = text.trim().split('\n');
//         const values = rows.map(row =>
//           row.split(',').map(val => parseInt(val.trim()))
//         );

//         sensorValuesRef.current = values;
//          //[with useState] instead of: setSensorValues(values);
//         p5Instance.current?.redraw();
//         console.log(values, "values from setSensorValues");
//       }
//     } catch (err) {
//       console.error('Error reading serial:', err);
//       isConnectedRef.current = false;
//     } finally {
//       isReadingRef.current = false;

//       // Only cleanup if we're actually disconnecting: 🍎
//       if (!isConnectedRef.current) {
//         if (readerRef.current) {
//           readerRef.current.releaseLock();
//           readerRef.current = null;
//         }
//         if (writerRef.current) {
//           writerRef.current.releaseLock();
//           writerRef.current = null;
//         }
//       }


//       // This used to have clean up on disconnect, which is allowed the serial monitor to keep working when it stopped.
//       // reader.releaseLock();
//       // writer.releaseLock();
//       // setReader(null);
//       // setWriter(null);
//     }
//   };

//   // P5 sketch
//   const sketch = (p5) => {
//     p5.setup = () => {
//       p5Instance.current = p5;
//       p5.createCanvas(800, 600);
//       p5.noSmooth(); // helpful for scaling up images without blurring



//       // Initialize caustics grid
//       causticsRef.current = [];
//       for (let i = 0; i < p5.width; i += 20) {
//         for (let j = 0; j < p5.height; j += 20) {
//           causticsRef.current.push({ x: i, y: j, offset: p5.random(p5.TWO_PI) });
//         }
//       }
//     };

//     // Helper functions for the new visualization - no states or refs
//     const drawRipple = (x, y, size) => {
//       p5.noFill();
//       p5.stroke(255, 255, 255, 100);
//       p5.strokeWeight(2);
//       p5.ellipse(x, y, size, size);
//     };

//     const drawBloomingLotus = (x, y, frame) => {
//       p5.push();
//       p5.translate(x, y);

//       const scaleAmount = p5.map(frame, 0, 30, 0, 1);
//       p5.noStroke();

//       p5.fill(255, 182, 193);
//       for (let angle = 0; angle < p5.TWO_PI; angle += p5.PI / 6) {
//         const petalX = p5.cos(angle) * 30 * scaleAmount;
//         const petalY = p5.sin(angle) * 30 * scaleAmount;
//         p5.ellipse(petalX, petalY, 20 * scaleAmount);
//       }

//       p5.fill(255, 105, 180);
//       p5.ellipse(0, 0, 20 * scaleAmount);
//       p5.pop();
//     };

//     // How to approach drawCaustics?
//     const drawCaustics = () => {
//       p5.noStroke();
//       p5.fill(255, 255, 255, 30);

//       for (let caustic of causticsRef.current) {
//         const wave = p5.sin(p5.frameCount * 0.05 + caustic.offset) * 5;
//         p5.ellipse(caustic.x + wave, caustic.y + wave, 15, 15);
//       }
//     };

//     // mousePressed handler for toggling reading
//     p5.mousePressed = () => {
//       if (isConnectedRef.current) {
//         if (!isReadingRef.current) {
//           startReading();
//         } else {
//           if (readerRef.current) {
//             isReadingRef.current = false;
//           }
//         }
//       }
//     };

//     p5.draw = () => {
//       if (!p5Instance.current) return;

//       // For deep blue water
//       p5.background(0, 0, 150); // ⚪️ Background should be in setup OR maybe not?

//       drawCaustics();

//       // Update and draw ripples
//       for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
//         const ripple = ripplesRef.current[i];

//         // Location of ripples positioning:
//         drawRipple(ripple.x, ripple.y, ripple.size);
//         ripple.size += 2;

//         if (ripple.size > 100) {
//           lotusesRef.current.push({ x: ripple.x, y: ripple.y, frame: 0 });
//           ripplesRef.current.splice(i, 1);
//         }
//       }

//       // Update and draw lotuses
//       for (let i = lotusesRef.current.length - 1; i >= 0; i--) {
//         const lotus = lotusesRef.current[i];
//         drawBloomingLotus(lotus.x, lotus.y, lotus.frame);
//         if (lotus.frame < 30) {
//           lotus.frame++;
//         } else {
//           lotusesRef.current.splice(i, 1);
//         }
//       }

//       // Process sensor values
//       if (sensorValuesRef.current.length > 0) {
//         for (let r = 0; r < sensorValuesRef.current.length; r++) {
//           for (let c = 0; c < sensorValuesRef.current[r].length; c++) {
//             if (sensorValuesRef.current[r][c] > 100) {
//               const x = p5.map(c, 0, sensorValuesRef.current[r].length, -p5.width/4, p5.width/4) + p5.width/2;
//               const y = p5.map(r, 0, sensorValuesRef.current.length, -p5.height/4, p5.height/4) + p5.height/2;
//               // Updating location for the ripples? with fixed size 10?
//               ripplesRef.current.push({ x, y, size: 10 });
//             }
//           }
//         }
//       }
//       // Draw status text
//       p5.fill(255);
//       p5.textSize(16);
//       p5.text(isReadingRef.current ? "Reading data...(Click to stop)" : "Click to start reading", 10, 30);
//     };
//   };

//   // Cleanup function
//   useEffect(() => {
//     return () => {
//       if (readerRef.current) {
//         readerRef.current.cancel();
//       }
//       if (writerRef.current) {
//         writerRef.current.releaseLock();
//       }
//       if (portRef.current) {
//         portRef.current.close();
//       }
//     };
//   }, []);

//   return (
//     <div>
//       {!isConnectedRef.current && (
//         <button onClick={connectSerial}>Connect to Serial Port</button>
//       )}
//       <ReactP5Wrapper sketch={sketch} />
//     </div>
//   );
// };

// export default P5SketchWrapper;
