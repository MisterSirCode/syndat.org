const cvs = document.querySelector(".waferCanvas");
cvs.width = 512;
cvs.height = 512;
const ctx = cvs.getContext("2d");

const inpDia = document.querySelector(".waferDiameter");
const inpUChr = document.querySelector(".waferUChord");
const inpDChr = document.querySelector(".waferDChord");
const inpLChr = document.querySelector(".waferLChord");
const inpRChr = document.querySelector(".waferRChord");
const inpThk = document.querySelector(".waferThickness");
const inpWgt = document.querySelector(".waferWeight");
const outAra = document.querySelector(".waferArea");
const outVol = document.querySelector(".waferVolume");
const outDen = document.querySelector(".waferDensity");
const debug = document.querySelector(".debug");

let radius = 0;
let nAngle = eAngle = sAngle = wAngle = 0;
let area = 0;
let volume = 0;
let density = 0;

inpDia.addEventListener("input",  recalculate);
inpUChr.addEventListener("input",  recalculate);
inpDChr.addEventListener("input",  recalculate);
inpLChr.addEventListener("input",  recalculate);
inpRChr.addEventListener("input",  recalculate);
inpThk.addEventListener("input",  recalculate);
inpWgt.addEventListener("input",  recalculate);


function recalculate() {
    radius = (inpDia.value / 10) / 2;
    nAngle = 2 * Math.asin(inpUChr.value / inpDia.value);
    eAngle = 2 * Math.asin(inpRChr.value / inpDia.value);
    sAngle = 2 * Math.asin(inpDChr.value / inpDia.value);
    wAngle = 2 * Math.asin(inpLChr.value / inpDia.value);
    let r2 = (radius * radius) / 2;
    let ntmp = r2 * (nAngle - Math.sin(nAngle));
    let etmp = r2 * (eAngle - Math.sin(eAngle));
    let stmp = r2 * (sAngle - Math.sin(sAngle));
    let wtmp = r2 * (wAngle - Math.sin(wAngle));
    area = ((Math.PI * radius * radius) - ntmp - etmp - stmp - wtmp);
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
    let deg90 = Math.PI / 2;
    let deg180 = deg90 * 2;
    let deg270 = deg90 * 3;
    let middle = cvs.width / 2;
    let center = cvs.height / 2;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    let r = middle / 1.2;

    let nA1 = nAngle / 2 - deg90;
    let nA2 = 2 * Math.PI - nAngle / 2 - deg90;
    let ne1x = r * Math.cos(nA1) + middle;
    let ne1y = r * Math.sin(nA1) + center;
    let ne2x = r * Math.cos(nA2) + middle;
    let ne2y = r * Math.sin(nA2) + center;
    let eA1 = eAngle / 2;
    let eA2 = 2 * Math.PI - eAngle / 2;
    let ee1x = r * Math.cos(eA1) + middle;
    let ee1y = r * Math.sin(eA1) + center;
    let ee2x = r * Math.cos(eA2) + middle;
    let ee2y = r * Math.sin(eA2) + center;
    let sA1 = sAngle / 2 + deg90;
    let sA2 = 2 * Math.PI - sAngle / 2 + deg90;
    let se1x = r * Math.cos(sA1) + middle;
    let se1y = r * Math.sin(sA1) + center;
    let se2x = r * Math.cos(sA2) + middle;
    let se2y = r * Math.sin(sA2) + center;
    let wA1 = wAngle / 2 + deg180;
    let wA2 = 2 * Math.PI - wAngle / 2 + deg180;
    let we1x = r * Math.cos(wA1) + middle;
    let we1y = r * Math.sin(wA1) + center;
    let we2x = r * Math.cos(wA2) + middle;
    let we2y = r * Math.sin(wA2) + center;
    ctx.beginPath();
    ctx.moveTo(ne1x, ne1y);
    ctx.lineTo(ne2x, ne2y);
    if (nAngle + eAngle < Math.PI)
        ctx.arc(middle, center, r, nA1, -eA1);
    ctx.moveTo(ee1x, ee1y);
    ctx.lineTo(ee2x, ee2y);
    if (eAngle + sAngle < Math.PI)
        ctx.arc(middle, center, r, eA1, sA1 - sAngle);
    ctx.moveTo(se1x, se1y);
    ctx.lineTo(se2x, se2y);
    if (sAngle + wAngle < Math.PI)
        ctx.arc(middle, center, r, sA1, -wA1);
    ctx.moveTo(we1x, we1y);
    ctx.lineTo(we2x, we2y);
    if (wAngle + nAngle < Math.PI)
        ctx.arc(middle, center, r, wA1, nA2);
    ctx.stroke();

    // let a1 = nAngle / 2;
    // let a2 = 2 * Math.PI - nAngle / 2;
    // let e1x = r * Math.cos(a1 + rotation) + middle;
    // let e1y = r * Math.sin(a1 + rotation) + center;
    // let e2x = r * Math.cos(a2 + rotation) + middle;
    // let e2y = r * Math.sin(a2 + rotation) + center;
    // ctx.beginPath();
    // ctx.arc(middle, center, r, a1 + rotation, a2 + rotation);
    // ctx.moveTo(e1x, e1y);
    // ctx.lineTo(e2x, e2y);
    // ctx.stroke();
    window.requestAnimationFrame(draw);
}