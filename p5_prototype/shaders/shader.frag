// A fragment shader that handles the color mixing.

precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float pressurePercentage;
uniform sampler2D baseTexture;
uniform sampler2D pressureTexture;

varying vec2 vTexCoord;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;  // Flip Y coordinates

    // Sample both textures
    vec4 baseColor = texture2D(baseTexture, uv);
    vec4 pressure = texture2D(pressureTexture, uv);

    // Mix between base scene and magenta based on pressure
    vec3 magentaScene = vec3(1.0, 0.0, 1.0);

    // Mix between scenes based on pressure
      // 3. The fragment shader then:
      // - Samples this pressure texture
      // - Uses the pressure values to mix between blue and magenta

    vec3 finalColor = mix(baseColor.rgb, magentaScene, pressure.r);

      // Where pressure.r is 0-1 based on the grayscale value

    gl_FragColor = vec4(finalColor, 1.0);
}
