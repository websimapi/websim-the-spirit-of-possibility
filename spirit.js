import { random } from './utils.js';

export class Spirit {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = random(0, canvasWidth);
        this.y = random(0, canvasHeight);
        this.radius = random(100, 200);
        this.vx = 0;
        this.vy = 0;
        this.targetX = random(0, canvasWidth);
        this.targetY = random(0, canvasHeight);
        this.speed = random(0.3, 0.8);
        this.color = `hsla(60, 100%, 80%, 0.1)"; // A faint yellow/golden color
    }

    update() {
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 50) {
            // Reached target, set a new one
            this.targetX = random(0, this.canvasWidth);
            this.targetY = random(0, this.canvasHeight);
        }

        const angle = Math.atan2(dy, dx);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}