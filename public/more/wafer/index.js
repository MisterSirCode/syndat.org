const cvs = document.querySelector(".waferCanvas");
cvs.width = 512;
cvs.height = 512;
const ctx = cvs.getContext("2d");

const inpDia = document.querySelector(".waferDiameter");
const inpChr = document.querySelector(".waferChord");
const inpThk = document.querySelector(".waferThickness");
const inpWgt = document.querySelector(".waferWeight");
const outAra = document.querySelector(".waferArea");
const outVol = document.querySelector(".waferVolume");
const outDen = document.querySelector(".waferDensity");

let radius = 0;
let angle = 0;
let area = 0;
let volume = 0;
let density = 0;

inpDia.addEventListener("input",  recalculate);
inpChr.addEventListener("input",  recalculate);
inpThk.addEventListener("input",  recalculate);
inpWgt.addEventListener("input",  recalculate);


function recalculate() {
    radius = (inpDia.value / 10) / 2;
    angle = 2 * Math.asin(inpChr.value / inpDia.value);
    let tmp = (radius * radius) / 2 * (angle - Math.sin(angle));
    area = ((Math.PI * radius * radius) - tmp);
    outAra.innerText = Math.round(area * 1000) / 1000;
    volume = area * (inpThk.value / 10);
    outVol.innerText = Math.round(volume * 1000) / 1000;
    density = inpWgt.value / volume;
    outDen.innerHTML = Math.round(density * 1000) / 1000;
}

window.onload = () => {
    recalculate();
    window.requestAnimationFrame(draw);
};

function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    let rotation = Math.PI / 2;
    let middle = cvs.width / 2;
    let center = cvs.height / 2;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    let r = middle / 1.2;
    let a1 = angle / 2;
    let a2 = 2 * Math.PI - angle / 2;
    let e1x = r * Math.cos(a1 + rotation) + middle;
    let e1y = r * Math.sin(a1 + rotation) + center;
    let e2x = r * Math.cos(a2 + rotation) + middle;
    let e2y = r * Math.sin(a2 + rotation) + center;
    ctx.beginPath();
    ctx.arc(middle, center, r, a1 + rotation, a2 + rotation);
    ctx.moveTo(e1x, e1y);
    ctx.lineTo(e2x, e2y);
    ctx.stroke();
    window.requestAnimationFrame(draw);
}