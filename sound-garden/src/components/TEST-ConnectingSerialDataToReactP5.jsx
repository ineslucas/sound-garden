/////// CODE DUMP ////////
/////// CODE DUMP ////////
/////// CODE DUMP ////////
/////// CODE DUMP ////////

///////// FIRST CODE ////////////////

// import { useEffect } from 'react';
// import { ReactP5Wrapper } from "@p5-wrapper/react";

// const P5SketchWrapper = () => {
//   const sketch = (p5) => {
//     let port;
//     let reader;
//     let writer;
//     const circleSizes = new Array(6).fill(0);

//     p5.setup = async () => {
//       p5.createCanvas(400, 400);

//       try {
//         port = await navigator.serial.requestPort();
//         await port.open({ baudRate: 9600 });

//         writer = port.writable.getWriter();
//         reader = port.readable.getReader();

//         readSerial();
//       } catch (err) {
//         console.error('Serial port error:', err);
//       }
//     };

//     const readSerial = async () => {
//       try {
//         while (true) {
//           // Request new readings
//           const encoder = new TextEncoder();
//           await writer.write(encoder.encode('0'));

//           // Read the response
//           const { value, done } = await reader.read();
//           if (done) break;

//           // Parse the CSV data
//           const text = new TextDecoder().decode(value);
//           const values = text.trim().split(',').map(Number);

//           if (values.length === 6) {
//             circleSizes.splice(0, circleSizes.length, ...values);
//           }
//         }
//       } catch (err) {
//         console.error('Error reading serial:', err);
//       }
//     };

//     p5.draw = () => {
//       p5.background(220);

//       // Draw 6 circles in a 3×2 grid
//       const spacing = 100;
//       const baseSize = 20;

//       for (let r = 0; r < 3; r++) {
//         for (let c = 0; c < 2; c++) {
//           const index = r * 2 + c;
//           const x = (c + 1) * spacing;
//           const y = (r + 1) * spacing;

//           // Map sensor values to circle sizes
//           const size = p5.map(circleSizes[index], 0, 1023, baseSize, baseSize * 3);

//           p5.circle(x, y, size);
//         }
//       }
//     };
//   };

//   // Cleanup function
//   useEffect(() => {
//     return () => {
//       if (reader) {
//         reader.cancel();
//       }
//       if (writer) {
//         writer.releaseLock();
//       }
//       if (port) {
//         port.close();
//       }
//     };
//   }, []);

//   return <ReactP5Wrapper sketch={sketch} />;
// };

// export default P5SketchWrapper;
