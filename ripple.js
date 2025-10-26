export class Ripple {
    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.radius = 1;
        this.maxRadius = 80;
        this.speed = 2;
        this.life = 1;
        this.color = `rgba(180, 220, 255, ${this.life})`;
    }

    update() {
        this.radius += this.speed;
        this.life -= 0.02;
        if (this.life < 0) this.life = 0;
        this.color = `rgba(180, 220, 255, ${this.life})`;
    }

    draw() {
        if (this.life <= 0) return;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

