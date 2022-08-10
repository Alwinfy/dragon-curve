type Direction = "right" | "left" | "up" | "down";

interface SwipeInfo {
	startX: number;
	startY: number;
	startTime: DOMHighResTimeStamp;
	lock: "X" | "Y" | null;
}


const STAY_THRESH = 20;
const MOVE_THRESH = 100;
const CROSS_THRESH = 40;
const TIME_THRESH = 300;

function hookSwipes(elt: HTMLElement) {
	let info: SwipeInfo | null = null;
	
	elt.addEventListener("touchstart", ev => {
		if (ev.touches.length === 1) {
			const touch = ev.touches[0];
			info = {
				startX: touch.pageX,
				startY: touch.pageY,
				startTime: performance.now(),
				lock: null,
			};
		} else {
			info = null;
		}
	});
	elt.addEventListener("touchmove", ev => {
		ev.preventDefault();
		if (ev.touches.length === 1 && info !== null) {
			const touch = ev.touches[0];
			const dx = touch.pageX - info.startX; 
			const dy = touch.pageY - info.startY;
			if (Math.abs(dx) >= MOVE_THRESH && Math.abs(dy) <= CROSS_THRESH && info.lock != "Y") {
				elt.dispatchEvent(new CustomEvent("swipe", {detail: dx > 0 ? "right" : "left"}));
				info = {
					startX: touch.pageX,
					startY: touch.pageY,
					startTime: info.startTime,
					lock: "X"
				};
			}
			if (Math.abs(dy) >= CROSS_THRESH && Math.abs(dx) <= CROSS_THRESH && info.lock != "X") {
				elt.dispatchEvent(new CustomEvent("swipe", {detail: dy > 0 ? "down" : "up"}));
				info = {
					startX: touch.pageX,
					startY: touch.pageY,
					startTime: info.startTime,
					lock: "Y"
				};
			}
		} else {
			info = null;
		}
	});
	elt.addEventListener("touchend", ev => {
		if (ev.touches.length === 0 && ev.changedTouches.length === 1 && info !== null && performance.now() - info.startTime <= TIME_THRESH) {
			const touch = ev.changedTouches[0];
			const dx = touch.pageX - info.startX; 
			const dy = touch.pageY - info.startY;
			if (Math.abs(dx) <= STAY_THRESH && Math.abs(dy) <= STAY_THRESH) {
				elt.dispatchEvent(new Event("tap"));
			}
		}
		info = null;
		ev.preventDefault();
	});
}
