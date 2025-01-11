const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl2');

const vertexShaderSource = `#version 300 es

in vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec2 iResolution; // Declare as vec2 (canvas width and height)
uniform vec2 iMouse;
uniform float iTime;

out vec4 fragColor;

// Shadertoy code here

#define PI 3.14159265359
#define RES iResolution
#define PT iMouse
#define smin smoothmin
#define smax smoothmax

float d0 = 120.;

// Signed distance function for a plane
float sdPlane(vec3 p, vec3 n, float h) {
  return dot(p, n) + h;
}

float sdCylinder(vec3 p, in float r, in float h, in int hAxis) {
  vec2 aR, aH;

  if (hAxis == 0) { // x-axis
    aR = p.yz, aH = vec2(p.x, 0.0);
  } else if (hAxis == 1) { // y-axis
    aR = p.xz, aH = vec2(p.y, 0.0);
  } else { // z-axis
    aR = p.xy, aH = vec2(p.z, 0.0);
  }

  vec2 d = vec2(length(aR) - r, abs(aH.x) - h / 2.0);

  // Return the distance to the cylinder
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCuboid(vec3 p, vec2 a, float h) {
  vec3 d = abs(p) - vec3(a.x, h, a.y);
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float smoothmin(float d1, float d2, float k) {
  float h = max(k - abs(d1 - d2), 0.) / k;
  return min(d1, d2) - h * h * k * (1. / 4.);
}

float smoothmax(float d1, float d2, float k) {
    float h = max(k - abs(d1 - d2), 0.) / k;
    return max(d1, d2) + h * h * k * (1. / 4.);
}

float noise(vec2 p) {
  float random = dot(p,vec2(12.235,78.37283));
  random = sin(random);
  random *= 4358.4346;
  random += fract(iTime);
  random = fract(random);
  return 1.5 - random*4.5;
}

int partID = 1; // identifier for surfaces to apply specific color to

float map(vec3 p) {

  float m = 5.; // mod width
  vec3 p0 = p; // pre-mod state

  float ceilY = 8.; // ceiling,
  p.y-=ceilY;
  float ceiling = -p.y;

  p = p0; // reset to pre-mod base

  p.xz = mod(p.xz - m,2.*m) - m;
  
  vec3 p1 = p; // baseline for mods placed at the center of the columns (with mods in place)

  float column = sdCylinder(p, .5, 9., 1); // the round columns

  float flutes = 1.;
  float fTimes = 24.;

  for (float i = 0.; i < fTimes; i++) {
    float fAngle = 2.*PI/fTimes*i;
    p.z+= .5*cos(fAngle);
    p.x+= .5*sin(fAngle);
    float f = sdCylinder(p, 0., 7.7, 1) - .04;
    
    flutes = min(flutes, f);
    p = p1; // reset to column baseline (with mods applied)
  }

  column = max(column,-flutes); // round column with etched flutes

  p.y+=4.05;
  float cRing = sdCylinder(p, .5, 0., 1) - .05;
  column = min(column, cRing); // column with added ring around its circumference at the bottom

  float bA = .5;
  float bR = .15;
  float baseH = 2.;
  p.y += baseH + 2.*bR;
  vec2 a = vec2(.5);
  float base = sdCuboid(p, a, baseH) - bR; // tall cuboid base for the round column

  float bd = bA+bR;
  p.xz+=bd;
  float bFlutes = 1.;

  for (float i=0.;i<4.;i++) {
    if (i == 1.) { p.x -=2.*bd; }
    else if (i == 2.) { p.z -=2.*bd; }
    else if (i == 3.) { p.x +=2.*bd; }

    float bF = sdCuboid(p,vec2(0.),3.) - .35;
    bFlutes = min(bFlutes, bF);

  }

  p = p1;
  base = max(-bFlutes, base); // cuboid base with round flutes running down each vertical edge

  p.y+=6.5;
  float antiBev = sdCuboid(p,vec2(.55),2.2);
  base = min(base, antiBev); // an extra cuboid sticking out of the flutes

  column = smin(column,base, bR); // column is smoothly melted into the base

  float floor = sdPlane(p, vec3(0.0, 1.0, 0.0), 2.2); // blank floor

  float tiles = floor; // extra surface identical to the floor that colorful patterms will be cut out of 

  float pattern1 = min( // said pattern
                    min(max(length(p.xz) - m - .125, 1. - length(p.xz) + m*2./3.),
                    min(
                      mix(abs(p.x),abs(p.z),.5) - m/3.5,
                      max(abs(p.x),abs(p.z)) - m/2.5
                      )
                    ),
                    -max(
                      mix(abs(p.x), abs(p.z),.25),
                      mix(abs(p.x), abs(p.z),.75)
                    ) + 4.6
                   );

  tiles = max(tiles, pattern1); // the pattern is cut out

  p = p1; // reset to column baseline

  p.y-=6.2;

  float cBase = sdCuboid(p, a, baseH+10.); // a cuboid at the top of the cylindrical column, similar to the one forming the base

  p.y+=1.3;

  p.y-=21.;
  p.y/=25.;

  float r = 1.;
  float ovoid = sdSphere(p, r);
  
  cBase = max(cBase,ovoid); // an ellyptical spheroid is cut out of the cuboid

  p = p1;

  p.y-=4.;

  float cRing2 = sdCylinder(p, .5, 0., 1) - .05; // another ring around the column's circumference is added at its top
  cBase = min(cBase,cRing2); // the ring is melted into the cuboid

  p = p0;
  p.x-=m;
  p.x = mod(p.x - m,2.*m) - m;
  p.y-=ceilY;

  float cRadius = m - .5; // radius of the arches in the ceiling
  float ceilArcX = smax(abs(p.x), p.y, cRadius) - cRadius;

  ceiling = max(ceiling,-ceilArcX); // a cylindrical shape is carved out of the ceiling along the X axis

  p = p0;
  p.z-=m;
  p.z = mod(p.z - m,2.*m) - m;
  p.y-=ceilY;

  float ceilArcZ = smax(abs(p.z), p.y, cRadius) - cRadius; // // a similar cylindrical shape is carved out of the ceiling along the Z axis

  ceiling = max(ceiling,-ceilArcZ);

  float result = min(min(min(column, base), min(floor,ceiling)),cBase);

  if (result == tiles) {
    partID = 1;
  }
  else {
    partID = 2;
  }

  return result;
}

vec3 norm(vec3 p) {
  float h = 1e-3;
  vec2 k = vec2(-1, 1);
  return normalize(
    k.xyy * map(p + k.xyy * h) +
    k.yxy * map(p + k.yxy * h) +
    k.yyx * map(p + k.yyx * h) +
    k.xxx * map(p + k.xxx * h)
  );
}

float raymarch(inout vec3 p, vec3 rd) {
  float dd = 0.0;
  for (float i = 0.0; i < 100.0; i++) {
    float d = map(p);
    if (d < 1e-4 || dd > d0) break;
    p += rd * d;
    dd += d;
  }
  return dd;
}

float shadow(vec3 p, vec3 lp) {
    float shd=1., maxd=length(lp-p);
    vec3 l=normalize(lp-p);
    for (float i=1e-3; i<maxd;) {
        float d=map(p+l*i);
        if (d<1e-3) {
            shd=.0;
            break;
        }
        shd=min(shd,128.*d/i);
        i+=d;
    }
    return shd;
}

vec3 render(vec3 p, vec3 rd) {
  float d = raymarch(p, rd);

  vec3 col = vec3(0);

  if (partID == 1) {
    col = vec3(-.25);
  }
  else {
    col = vec3(0);
  }

  vec3 lp = vec3(5., -5, iTime);

  if (d < d0) {
    vec3 n = norm(p),
         l = normalize(lp - p);
    float diffuse = clamp(dot(l, n), 0., 1.);
    
    col += diffuse*shadow(p+n*5e-2, lp);
    col = mix(col, vec3(1. + .1*cos(iTime*15.)), .5);
  } else {
    col += mix(
      vec3(0.),
      vec3(.01, .02, .03),
      .5 - rd.z*1.5
      );
  }

  float fogFactor = d / d0; // black fog imitating darkness
  vec3 fogColor = -1.5 + vec3(0,-length(rd)*5.,0);

  col = mix(col, fogColor, fogFactor);
  col*=vec3(1.,.25,0);

  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord.xy - 0.5 * RES.xy) / RES.y;

  float mouseX = (iMouse.x / iResolution.x) * 2.0 - 1.0;
  float mouseY = (iMouse.y / iResolution.y) * 2.0 - 1.0;

  vec3 ro = vec3(5. + 3.*cos(iTime/10.), -5.0*cos(iTime/3.), -5.0 + iTime);

  // View angles based on mouse input
  float angleX;
  float angleY;
  
  if (iMouse.x > 0.) {
      angleX = mouseX * PI; // Horizontal rotation
      angleY = mouseY * PI * .5; // Vertical rotation
  }
  else {
      angleX = 0.;
      angleY = 0.;
  }

  // Calculate the forward direction
  vec3 fwd = vec3(
    cos(angleY) * sin(angleX),
    sin(angleY),
    cos(angleY) * cos(angleX)
  );

  // Calculate the right and up directions
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up = cross(fwd, right);

  // Calculate the ray direction
  vec3 rd = normalize(fwd + uv.x * right + uv.y * up);

  float t = 0.0; // Total distance travelled

  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t; // Position along the ray
    float d = map(p); // Current distance in the scene
    t += d; // Total distance, updated by current distance

    if (d < 0.001 || t > 100.0) break; // Break if close enough or too far
  }

  vec3 col = render(ro, rd);
  fragColor = vec4(col, 1.0);
}


// Shadertoy code ends here

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}

`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);  


const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const  
 program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);  


const positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new  
 Float32Array(positions), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);  

gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);  


const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
const iMouseLocation = gl.getUniformLocation(program, 'iMouse');
const iTimeLocation = gl.getUniformLocation(program, 'iTime');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);  

resizeCanvas(); // Initial resize

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y  
 = canvas.height - (event.clientY - rect.top);
    gl.uniform2f(iMouseLocation, x, y);
});

function render() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(iTimeLocation, performance.now() * 0.001);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}

render();