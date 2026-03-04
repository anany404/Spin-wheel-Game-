const sectors = [
	{ color: "#ff930f", text: "#03071e", label: "20+" },
  { color: "#fff95b", text: "#03071e", label: "40+" },
  { color: "#ff930f", text: "#03071e", label: "60+" },
  { color: "#fff95b", text: "#03071e", label: "80+" },
  { color: "#ff930f", text: "#03071e", label: "99+" },
  { color: "#fff95b", text: "#03071e", label: "You lose" }
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  }
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const wheelCanvas = document.querySelector("#wheel");
const ctx = wheelCanvas.getContext("2d");
const PI = Math.PI;
const TAU = 2 * PI;

let dia, rad, arc;

function setCanvasSize() {
  const container = document.getElementById("spin_the_wheel");
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  
  // Set actual size in memory (scaled to account for device pixel ratio)
  wheelCanvas.width = rect.width * dpr;
  wheelCanvas.height = rect.height * dpr;
  
  // Set display size (CSS pixels)
  wheelCanvas.style.width = rect.width + "px";
  wheelCanvas.style.height = rect.height + "px";
  
  // Scale context to match device pixel ratio
  ctx.scale(dpr, dpr);
  
  dia = rect.width;
  rad = dia / 2;
  arc = TAU / sectors.length;
  
  // Redraw after resize
  sectors.forEach(drawSector);
  rotate();
}

// Call on load and resize
window.addEventListener("load", setCanvasSize);
window.addEventListener("resize", setCanvasSize);

const friction = 0.991; 
let angVel = 0; 
let ang = 0;

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  const fontSize = Math.max(14, dia * 0.05); // Responsive font size
  ctx.font = `bold ${fontSize}px 'Lato', sans-serif`;
  ctx.fillText(sector.label, rad - 10, 10);
  
  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  spinEl.style.background = sector.color;
  spinEl.style.color = sector.text;
}

function frame() {
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false; 
    return;
  }

  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel; 
  ang %= TAU;
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  setCanvasSize();
  engine();
  spinEl.addEventListener("click", () => {
    if (!angVel) angVel = rand(0.25, 0.45);
    spinButtonClicked = true;
  });
}

init();

events.addListener("spinEnd", (sector) => {
  console.log(`Woop! You won ${sector.label}`);
});