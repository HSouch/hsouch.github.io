const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

const arcs = [];
const MAX_ARCS = 100;
const SEGMENTS = 100;

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

class Arc {
    constructor() {
        this.startX = randomRange(0, canvas.width);
        this.startY = randomRange(0, canvas.height);
        this.endX = randomRange(0, canvas.width);
        this.endY = randomRange(0, canvas.height);

        // Control point offset perpendicular to the chord to create an orbital sweep
        const midX = (this.startX + this.endX) / 2;
        const midY = (this.startY + this.endY) / 2;
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const px = -dy / len;
        const py =  dx / len;
        const offset = randomRange(0.3, 0.75) * len * (Math.random() < 0.5 ? 1 : -1);
        this.cpX = midX + px * offset;
        this.cpY = midY + py * offset;

        this.progress = 0;
        this.speed = randomRange(0.003, 0.007);
        this.done = false;

        this.hue = randomRange(190, 250);
        this.lineWidth = randomRange(0.6, 2.0);
        this.tailLength = randomRange(0.25, 0.45);
    }

    // Quadratic bezier point at parameter t
    bezierPoint(t) {
        const mt = 1 - t;
        return {
            x: mt * mt * this.startX + 2 * mt * t * this.cpX + t * t * this.endX,
            y: mt * mt * this.startY + 2 * mt * t * this.cpY + t * t * this.endY,
        };
    }

    update() {
        this.progress = Math.min(1, this.progress + this.speed);
        if (this.progress >= 1) this.done = true;
    }

    draw() {
        const headT = this.progress;
        const tailT = Math.max(0, headT - this.tailLength);
        const range = headT - tailT;
        if (range <= 0) return;

        // Global envelope: fade in at birth, fade out near destination
        let envelope = 1;
        if (this.progress < this.tailLength) {
            envelope = this.progress / this.tailLength;
        } else if (this.progress > 0.82) {
            envelope = (1 - this.progress) / 0.18;
        }

        ctx.lineCap = "round";
        ctx.lineWidth = this.lineWidth;

        for (let i = 0; i < SEGMENTS; i++) {
            const t1 = tailT + (i / SEGMENTS) * range;
            const t2 = tailT + ((i + 1) / SEGMENTS) * range;
            const p1 = this.bezierPoint(t1);
            const p2 = this.bezierPoint(t2);

            // Gradient along the tail: transparent at tail end, opaque at head
            const alpha = ((i + 1) / SEGMENTS) * envelope * 0.75;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${this.hue}, 65%, 72%, ${alpha})`;
            ctx.stroke();
        }
    }
}

function spawnArc() {
    if (arcs.length < MAX_ARCS) {
        arcs.push(new Arc());
    }

        setTimeout(spawnArc, randomRange(10, 200));
    
}

function animate() {
    ctx.fillStyle = "rgba(20, 20, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = arcs.length - 1; i >= 0; i--) {
        arcs[i].update();
        arcs[i].draw();
        if (arcs[i].done) arcs.splice(i, 1);
    }

    requestAnimationFrame(animate);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

spawnArc();
animate();
