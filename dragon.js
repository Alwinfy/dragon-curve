"use strict";
class Pt {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static unit(dir) {
        return new Pt(Math.cos(dir), Math.sin(dir));
    }
    plus(other) {
        return new Pt(this.x + other.x, this.y + other.y);
    }
    scale(n) {
        return new Pt(this.x * n, this.y * n);
    }
    offset(dir) {
        return this.plus(Pt.unit(dir));
    }
    get neg() {
        return new Pt(-this.x, -this.y);
    }
    rot(dir) {
        const cos = Math.cos(dir);
        const sin = Math.sin(dir);
        return new Pt(cos * this.x + sin * this.y, cos * this.y - sin * this.x);
    }
}
Pt.origin = new Pt(0, 0);
class Seg {
    constructor(pt, dir) {
        this.pt = pt;
        this.dir = dir;
    }
    rot(angle) {
        return new Seg(this.pt.rot(angle), this.dir - angle);
    }
    plus(other) {
        return new Seg(this.pt.plus(other), this.dir);
    }
    get neg() {
        return new Seg(this.pt.neg, this.dir + Math.PI);
    }
    get end() {
        return this.pt.offset(this.dir);
    }
}
function dragon(angle, start) {
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
function seg1(dir) {
    const pt = Pt.unit(dir);
    return [pt, output => output(new Seg(Pt.origin, dir))];
}
function runWriter(ws) {
    const arr = [];
    ws(x => arr.push(x));
    return arr;
}
function nest(f, x, n) {
    while (n--) {
        x = f(x);
    }
    return x;
}
function memo(f) {
    const memo = new Map();
    return val => {
        if (!memo.has(val)) {
            memo.set(val, f(val));
        }
        return memo.get(val);
    };
}
const computeDragon = memo((q) => memo((n) => runWriter(nest(x => dragon(Math.PI * q, x), seg1(0), n)[1])));
