"use strict";
class Interval {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    or(other) {
        return new Interval(Math.min(this.min, other.min), Math.max(this.max, other.max));
    }
    insert(n) {
        this.min = Math.min(this.min, n);
        this.max = Math.max(this.max, n);
    }
    get width() {
        return this.max - this.min;
    }
    get midpt() {
        return 0.5 * (this.max + this.min);
    }
}
class AABB {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    or(other) {
        return new AABB(this.x.or(other.x), this.y.or(other.y));
    }
    get midpt() {
        return new Pt(this.x.midpt, this.y.midpt);
    }
}
function ptBounds(pts) {
    const pt = pts[0];
    const x = new Interval(pt.x, pt.x);
    const y = new Interval(pt.y, pt.y);
    for (const pt of pts) {
        x.insert(pt.x);
        y.insert(pt.y);
    }
    return new AABB(x, y);
}
