export const vs = `
attribute vec2 position;
varying vec2 vUv;

void main(){
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position,0.0,1.0);
}
`;

export const fs = `
precision highp float;

uniform vec2 resolution;
uniform float time;

uniform float arcStart;
uniform float arcEnd;
uniform float arcHeight;

uniform float centerX;
uniform float centerY;

uniform float ovalX;
uniform float ovalY;

uniform float alpha;

uniform float noiseStrength;
uniform float spikeStrength;
uniform float speed;

//////////////////////////////////////////////////////
// FOG UNIFORMS
//////////////////////////////////////////////////////

uniform vec3 fogColor;
uniform float fogAlpha;
uniform float fogHeight;
uniform float fogDensity;
uniform float fogSpeed;
uniform float fogScale;
uniform float fogPatchStrength;

varying vec2 vUv;

//////////////////////////////////////////////////////
// NOISE
//////////////////////////////////////////////////////

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));

  vec2 u = f*f*(3.0-2.0*f);

  return mix(a,b,u.x) +
         (c-a)*u.y*(1.0-u.x) +
         (d-b)*u.x*u.y;
}

float band(float x, float c, float w){
  return smoothstep(w, 0.0, abs(x - c));
}

//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////

void main(){

  vec2 uv = vUv;

  vec2 p = uv - vec2(centerX, centerY);

  p.x *= resolution.x / resolution.y;

  p.x /= ovalX;
  p.y /= ovalY;

  p = vec2(p.y, -p.x);

  float r = length(p);
  float a = atan(p.y, p.x);

  //////////////////////////////////////////////////////
  // 🌈 RAINBOW DISTORTION
  //////////////////////////////////////////////////////

  float t = time * speed;

  float n1 = noise(vec2(a * 2.0, t * 0.5));
  float n2 = noise(vec2(a * 8.0, t * 1.2));
  float n3 = pow(noise(vec2(a * 20.0, t * 2.0)), 8.0);

  float distortion =
      (n1 - 0.5) * noiseStrength +
      (n2 - 0.5) * noiseStrength * 0.5 +
      n3 * spikeStrength;

  r += distortion;

  //////////////////////////////////////////////////////
  // ARC MASK
  //////////////////////////////////////////////////////

  float radius = arcHeight;
  float thickness = 0.00027;

  float arcMask =
      smoothstep(arcStart, arcStart + 0.25, a) *
      (1.0 - smoothstep(arcEnd - 0.25, arcEnd, a));

  //////////////////////////////////////////////////////
  // ROYGBIV
  //////////////////////////////////////////////////////

  float R = radius + thickness * 0.005;

  float red     = band(r, R - 0.000, 0.030);
  float orange  = band(r, R - 0.015, 0.030);
  float yellow  = band(r, R - 0.030, 0.030);
  float green   = band(r, R - 0.050, 0.030);
  float blue    = band(r, R - 0.075, 0.030);
  float indigo  = band(r, R - 0.095, 0.030);
  float violet  = band(r, R - 0.115, 0.030);

  vec3 col =
      vec3(1.0,0.2,0.1) * red +
      vec3(1.0,0.5,0.0) * orange +
      vec3(1.0,0.9,0.1) * yellow +
      vec3(0.2,0.9,0.2) * green +
      vec3(0.2,0.4,1.0) * blue +
      vec3(0.4,0.1,1.0) * indigo +
      vec3(0.8,0.2,1.0) * violet;

  col *= arcMask;

  //////////////////////////////////////////////////////
  // 🌫️ FOG LAYER (screen space)
  //////////////////////////////////////////////////////

  vec2 fogUV = uv * fogScale;

  float wind = time * fogSpeed;

  float f = 0.0;

  // layered fog (cheap multi-octave)
  f += noise(fogUV + vec2(wind, 0.0)) * 0.6;
  f += noise(fogUV * 2.0 + vec2(wind * 1.5, 10.0)) * 0.3;
  f += noise(fogUV * 4.0 + vec2(wind * 2.0, 20.0)) * 0.1;

  f = pow(f, 2.0); // soften structure

  // vertical fade (IMPORTANT)
  float fogMask = smoothstep(fogHeight, 0.0, uv.y);

  vec3 fog = fogColor * f * fogDensity * fogMask;

  float fogA = fogAlpha * fogMask;

  //////////////////////////////////////////////////////
  // FINAL COMPOSITE
  //////////////////////////////////////////////////////

  vec3 finalCol = col + fog;

  gl_FragColor = vec4(finalCol, alpha + fogA);
}
`;