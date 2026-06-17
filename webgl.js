/* =====================================================================
   PEIXARIA — v3b · fundo WebGL
   Shader fullscreen: águas profundas + caustics suaves em navy.
   Raw WebGL1 (sem libs). Fallback: se não houver contexto, o CSS
   .bg (navy sólido) aparece. reduced-motion = 1 frame estático.
   Pausa quando a aba está oculta.
   ===================================================================== */
(function () {
  var canvas = document.querySelector('.bgcanvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' })
        || canvas.getContext('experimental-webgl', { antialias: false, alpha: false });
  if (!gl) return; // sem WebGL → fallback CSS navy

  /* ---------- shaders ---------- */
  var VERT = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2  uRes;',
    'uniform float uTime;',

    // base navy "escura, mas nem tanto" (#0f2147) → bright (#17305e)
    'const vec3 BASE_LO = vec3(0.047, 0.110, 0.255);', // um tom abaixo p/ profundidade
    'const vec3 BASE_HI = vec3(0.090, 0.188, 0.369);',
    'const vec3 AZURE   = vec3(0.310, 0.576, 1.000);',  // #4f93ff

    // value noise
    'float hash(vec2 p){ p = fract(p*vec2(123.34, 345.45)); p += dot(p, p+34.345); return fract(p.x*p.y); }',
    'float noise(vec2 x){',
    '  vec2 i = floor(x); vec2 f = fract(x);',
    '  float a = hash(i);',
    '  float b = hash(i+vec2(1.0,0.0));',
    '  float c = hash(i+vec2(0.0,1.0));',
    '  float d = hash(i+vec2(1.0,1.0));',
    '  vec2 u = f*f*(3.0-2.0*f);',
    '  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);',
    '}',
    'float fbm(vec2 p){',
    '  float v = 0.0; float a = 0.5;',
    '  for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uRes.xy;',
    '  vec2 p  = (gl_FragCoord.xy - 0.5*uRes.xy) / uRes.y;', // centrado, aspect-correct
    '  float t = uTime * 0.035;',

    // domain warp (águas lentas)
    '  vec2 q = vec2(fbm(p*1.1 + t), fbm(p*1.1 + vec2(4.3,1.7) - t));',
    '  vec2 r = vec2(fbm(p*1.4 + 1.6*q + 0.5*t), fbm(p*1.4 + 1.6*q + vec2(7.1,2.4) - 0.4*t));',
    '  float f = fbm(p*1.3 + 2.0*r);',

    // caustics: veias finas onde f cruza 0.5
    '  float veins = pow(1.0 - abs(f*2.0 - 1.0), 7.0);',
    '  float glow  = smoothstep(0.45, 0.85, fbm(p*0.8 + r));',

    // base: gradiente vertical sutil + profundidade no rodapé
    '  vec3 col = mix(BASE_HI, BASE_LO, smoothstep(0.0, 1.1, uv.y));',
    '  col += AZURE * veins * 0.14;',         // caustics
    '  col += AZURE * glow  * 0.045;',        // brilho difuso
    '  col = mix(col, BASE_LO, 0.10);',       // assenta no navy

    // vinheta suave
    '  float vig = smoothstep(1.25, 0.25, length(p));',
    '  col *= 0.82 + 0.18*vig;',

    // grão leve (quebra banding)
    '  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[webgl] shader:', gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[webgl] link:', gl.getProgramInfoLog(prog)); return;
  }
  gl.useProgram(prog);

  // quad fullscreen
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes  = gl.getUniformLocation(prog, 'uRes');
  var uTime = gl.getUniformLocation(prog, 'uTime');

  var DPR = Math.min(window.devicePixelRatio || 1, 1.5); // cap p/ perf
  function resize() {
    var w = Math.floor(canvas.clientWidth  * DPR);
    var h = Math.floor(canvas.clientHeight * DPR);
    if (w === 0 || h === 0) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = null, start = null, paused = false;

  function frame(ts) {
    if (paused) { raf = null; return; }
    if (start === null) start = ts;
    resize();
    gl.uniform1f(uTime, (ts - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }

  function startLoop() { if (raf === null && !paused) raf = requestAnimationFrame(frame); }

  if (reduce) {
    // 1 frame estático
    resize(); gl.uniform1f(uTime, 12.0); gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    startLoop();
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
      if (paused) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else { start = null; startLoop(); } // retoma sem salto de tempo
    });
    window.addEventListener('resize', resize, { passive: true });
  }
})();
