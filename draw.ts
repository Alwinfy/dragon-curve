function rfa() {
	return new Promise((res, rej) => {
		requestAnimationFrame(res);
	});
}

type Box<T> = [T];


async function renderDragon(q: number, n: number, ctx: CanvasRenderingContext2D, last: Box<boolean>, skip: Box<boolean>) {
	const canvas = ctx.canvas!;
	const dragon = computeDragon(q / 120)(n);
	const bounds = ptBounds(dragon.flatMap(x => [x.pt, x.end]));
	const midpt = bounds.midpt.neg;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "black";
	const center = new Pt(canvas.width / 2, canvas.height / 2);
	const scale = Math.min(canvas.width / bounds.x.width, canvas.height / bounds.y.width) * 0.8;
	const transPoint = (pt: Pt) => pt.plus(midpt).scale(scale).plus(center);
	const step = Math.ceil(0.5 * dragon.length / ((1 + n) * (1 + n)));
	for (let i = 0; i < dragon.length; i++) {
		if (!skip[0] && i % step == 0) await rfa();
		if (!last[0]) break;
		ctx.beginPath();
		const pt = transPoint(dragon[i].pt);
		ctx.moveTo(pt.x, pt.y);
		const end = transPoint(dragon[i].end);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}
}


function hookDragon(canvas: HTMLCanvasElement) {
	const parse = (s: string) => +s.replace("px", "");
	requestAnimationFrame(() => {
		const style = getComputedStyle(canvas);
		const scale = Math.min(parse(style.width), parse(style.height));
		canvas.width = canvas.height = scale;
	});
	const ctx = canvas.getContext("2d")!;
	let level = 3;
	let q = 60;
	let last: Box<boolean> = [true];
	let skip: Box<boolean> = [true];
	const redraw = () => {
		last[0] = false;
		last = [true];
		requestAnimationFrame(() => renderDragon(q, level, ctx, last, skip));
	};
	const swipe = (word: "up" | "down" | "left" | "right") => {
		var level_ = level, q_ = q;
		switch (word) {
			case "left": level_ = Math.max(level - 1, 0); break;
			case "right": level_ = Math.min(level + 1, 16); break;
			case "up": q_ = Math.max(q - 1, 0); break;
			case "down": q_ = Math.min(q + 1, 120); break;
		};
		if (level_ != level || q_ != q) {
			level = level_;
			q = q_;
			redraw();
		}
	};
	const tap = () => {
		const jump = skip[0];
		skip[0] = !jump;
		if (jump) redraw();
	};
	hookSwipes(canvas);
	hookScroll(canvas);
	canvas.addEventListener("swipe", (ev: Event) => {
		swipe((ev as CustomEvent<Direction>).detail);
		redraw();
	});
	canvas.addEventListener("tap", tap);
	canvas.addEventListener("click", tap);
	canvas.addEventListener("keydown", ev => {
		if (ev.repeat) return;
		switch (ev.code) {
			case "ArrowLeft": swipe("left"); break;
			case "ArrowRight": swipe("right"); break;
			case "ArrowUp": swipe("up"); break;
			case "ArrowDown": swipe("down"); break;
			case "Space": tap(); break;
		}
	});
	redraw();
	setTimeout(() => canvas.focus());
}

window.addEventListener("load", () => {
	setTimeout(() => hookDragon(document.querySelector("canvas#dragon")!));
})
