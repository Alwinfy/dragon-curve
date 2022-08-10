class Pt {
	static origin = new Pt(0, 0);

	static unit(dir: number) {
		return new Pt(Math.cos(dir), Math.sin(dir));
	}

	constructor(readonly x: number, readonly y: number) {}

	plus(other: Pt) {
		return new Pt(this.x + other.x, this.y + other.y);
	}
	scale(n: number) {
		return new Pt(this.x * n, this.y * n);
	}
	offset(dir: number) {
		return this.plus(Pt.unit(dir));
	}
	get neg() {
		return new Pt(-this.x, -this.y);
	}
	rot(dir: number) {
		const cos = Math.cos(dir);
		const sin = Math.sin(dir);
		return new Pt(cos * this.x + sin * this.y, cos * this.y - sin * this.x);
	}
}
class Seg {
	constructor(readonly pt: Pt, readonly dir: number) {}

	rot(angle: number) {
		return new Seg(this.pt.rot(angle), this.dir - angle);
	}
	plus(other: Pt) {
		return new Seg(this.pt.plus(other), this.dir);
	}
	get neg() {
		return new Seg(this.pt.neg, this.dir + Math.PI);
	}
	get end() {
		return this.pt.offset(this.dir);
	}
}

type Writer<T> = (write: (val: T) => void) => void;

type WSInfo = [Pt, Writer<Seg>];

function dragon(angle: number, start: WSInfo): WSInfo {
	const [vec, write] = start;
	const nuvec = vec.plus(vec.rot(angle));
	return [
		nuvec,
		output => {
			write(output);
			write(seg => output(seg.rot(angle + Math.PI).plus(nuvec)));
		}
	];
}
function seg1(dir: number): WSInfo {
	const pt = Pt.unit(dir);
	return [pt, output => output(new Seg(Pt.origin, dir))];
}
function runWriter<T>(ws: Writer<T>): T[] {
	const arr: T[] = [];
	ws(x => arr.push(x));
	return arr;
}
function nest<T>(f: (val: T) => T, x: T, n: number): T {
	while (n--) {
		x = f(x);
	}
	return x;
}

function memo<T, E>(f: (val: T) => E): (val: T) => E {
	const memo = new Map();
	return val => {
		if (!memo.has(val)) {
			memo.set(val, f(val));
		}
		return memo.get(val);
	};
}

const computeDragon = memo((q: number) => memo((n: number) => runWriter(nest(x => dragon(Math.PI * q, x), seg1(0), n)[1])));
