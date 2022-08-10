"use strict";
function rfa() {
    return new Promise((res, rej) => {
        requestAnimationFrame(res);
    });
}
async function renderDragon(q, n, ctx, last, skip) {
    const canvas = ctx.canvas;
    const dragon = computeDragon(q / 120)(n);
    const bounds = ptBounds(dragon.flatMap(x => [x.pt, x.end]));
    const midpt = bounds.midpt.neg;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    const center = new Pt(canvas.width / 2, canvas.height / 2);
    const scale = Math.min(canvas.width / bounds.x.width, canvas.height / bounds.y.width) * 0.8;
    const transPoint = (pt) => pt.plus(midpt).scale(scale).plus(center);
    const step = Math.ceil(dragon.length / ((1 + n) * (1 + n)));
    for (let i = 0; i < dragon.length; i++) {
        if (!skip[0] && i % step == 0)
            await rfa();
        if (!last[0])
            break;
        ctx.beginPath();
        const pt = transPoint(dragon[i].pt);
        ctx.moveTo(pt.x, pt.y);
        const end = transPoint(dragon[i].end);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}
function hookDragon(canvas) {
    const ctx = canvas.getContext("2d");
    let level = 3;
    let q = 60;
    let last = [true];
    let skip = [true];
    const redraw = () => {
        last[0] = false;
        last = [true];
        requestAnimationFrame(() => renderDragon(q, level, ctx, last, skip));
    };
    const swipe = (word) => {
        switch (word) {
            case "left":
                level = Math.max(level - 1, 0);
                break;
            case "right":
                level = Math.min(level + 1, 16);
                break;
            case "up":
                q = Math.max(q - 1, 0);
                break;
            case "down":
                q = Math.min(q + 1, 120);
                break;
        }
        ;
        redraw();
    };
    const tap = () => {
        const jump = skip[0];
        skip[0] = !jump;
        if (jump)
            redraw();
    };
    hookSwipes(canvas);
    canvas.addEventListener("swipe", (ev) => {
        swipe(ev.detail);
        redraw();
    });
    canvas.addEventListener("tap", tap);
    canvas.addEventListener("keydown", ev => {
        if (ev.repeat)
            return;
        switch (ev.code) {
            case "ArrowLeft":
                swipe("left");
                break;
            case "ArrowRight":
                swipe("right");
                break;
            case "ArrowUp":
                swipe("up");
                break;
            case "ArrowDown":
                swipe("down");
                break;
            case "Space":
                tap();
                break;
        }
    });
    redraw();
    setTimeout(() => canvas.focus());
}
document.addEventListener("DOMContentLoaded", () => {
    hookDragon(document.querySelector("canvas#dragon"));
});
