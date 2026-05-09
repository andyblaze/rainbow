import { CONFIG } from "./config.js"; 
import { vs, fs } from "./gl.js";


//////////////////////////////////////////////////////
// WEBGL
//////////////////////////////////////////////////////

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl", { alpha:true });

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  gl.viewport(0,0,canvas.width,canvas.height);
}
addEventListener("resize", resize);
resize();


//////////////////////////////////////////////////////
// COMPILE + RUN
//////////////////////////////////////////////////////

function compile(type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

const program = gl.createProgram();

gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));

gl.linkProgram(program);
gl.useProgram(program);

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1,-1,  1,-1,  -1, 1,
  -1, 1,  1,-1,   1, 1
]), gl.STATIC_DRAW);

const pos = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

//////////////////////////////////////////////////////
// UNIFORMS
//////////////////////////////////////////////////////

const uResolution = gl.getUniformLocation(program, "resolution");
const uTime = gl.getUniformLocation(program, "time");

const uArcStart = gl.getUniformLocation(program, "arcStart");
const uArcEnd = gl.getUniformLocation(program, "arcEnd");
const uArcHeight = gl.getUniformLocation(program, "arcHeight");

const uCenterX = gl.getUniformLocation(program, "centerX");
const uCenterY = gl.getUniformLocation(program, "centerY");

const uOvalX = gl.getUniformLocation(program, "ovalX");
const uOvalY = gl.getUniformLocation(program, "ovalY");

const uAlpha = gl.getUniformLocation(program, "alpha");

const uNoiseStrength = gl.getUniformLocation(program, "noiseStrength");
const uSpikeStrength = gl.getUniformLocation(program, "spikeStrength");
const uSpeed = gl.getUniformLocation(program, "speed");

//////////////////////////////////////////////////////
// FOG UNIFORMS
//////////////////////////////////////////////////////

const uFogColor = gl.getUniformLocation(program, "fogColor");
const uFogAlpha = gl.getUniformLocation(program, "fogAlpha");
const uFogHeight = gl.getUniformLocation(program, "fogHeight");
const uFogDensity = gl.getUniformLocation(program, "fogDensity");
const uFogSpeed = gl.getUniformLocation(program, "fogSpeed");
const uFogScale = gl.getUniformLocation(program, "fogScale");

function draw(time){

  gl.useProgram(program);

  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform1f(uTime, time * 0.001);

  gl.uniform1f(uArcStart, CONFIG.arcStart);
  gl.uniform1f(uArcEnd, CONFIG.arcEnd);
  gl.uniform1f(uArcHeight, CONFIG.arcHeight);

  gl.uniform1f(uCenterX, CONFIG.centerX);
  gl.uniform1f(uCenterY, CONFIG.centerY);

  gl.uniform1f(uOvalX, CONFIG.ovalX);
  gl.uniform1f(uOvalY, CONFIG.ovalY);

  gl.uniform1f(uAlpha, CONFIG.alpha);

  gl.uniform1f(uNoiseStrength, CONFIG.noiseStrength);
  gl.uniform1f(uSpikeStrength, CONFIG.spikeStrength);
  gl.uniform1f(uSpeed, CONFIG.speed);

  gl.uniform3fv(uFogColor, CONFIG.fogColor);
  gl.uniform1f(uFogAlpha, CONFIG.fogAlpha);
  gl.uniform1f(uFogHeight, CONFIG.fogHeight);
  gl.uniform1f(uFogDensity, CONFIG.fogDensity);
  gl.uniform1f(uFogSpeed, CONFIG.fogSpeed);
  gl.uniform1f(uFogScale, CONFIG.fogScale);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);