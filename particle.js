import { random, lerp } from './utils.js';

export class Particle {
    constructor(x, y, ctx) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.size = random(0.5, 2.5);
        this.baseSize = this.size;
        this.vx = random(-0.25, 0.25);
        this.vy = random(-0.25, 0.25);
        this.color = `hsl(${random(180, 260)}, 100%, 75%)`;
        this.life = 0;
        this.maxLife = random(200, 500);
        this.targetSize = this.baseSize;
    }

    update(mouse, spirit) {
        this.x += this.vx;
        this.y += this.vy;

        // Interaction with mouse
        const distToMouse = Math.hypot(this.x - mouse.x, this.y - mouse.y);
        if (distToMouse < mouse.radius && mouse.active) {
            const angle = Math.atan2(this.y - mouse.y, this.x - mouse.x);
            const force = (mouse.radius - distToMouse) / mouse.radius;
            const pushFactor = 5;
            this.vx += Math.cos(angle) * force * pushFactor;
            this.vy += Math.sin(angle) * force * pushFactor;
            this.targetSize = this.baseSize * 4;
        } else {
            // Interaction with spirit
            const distToSpirit = Math.hypot(this.x - spirit.x, this.y - spirit.y);
            if (distToSpirit < spirit.radius) {
                 const angle = Math.atan2(spirit.y - this.y, spirit.x - this.x);
                 const force = (spirit.radius - distToSpirit) / spirit.radius;
                 const pullFactor = 0.1;
                 this.vx += Math.cos(angle) * force * pullFactor;
                 this.vy += Math.sin(angle) * force * pullFactor;
                 this.targetSize = this.baseSize * 2;
            } else {
                this.targetSize = this.baseSize;
            }
        }


        this.size = lerp(this.size, this.targetSize, 0.1);

        // Friction
        this.vx *= 0.99;
        this.vy *= 0.99;


        // Screen boundaries
        if (this.x < 0 || this.x > this.ctx.canvas.width) {
            this.x = (this.x + this.ctx.canvas.width) % this.ctx.canvas.width;
        }
        if (this.y < 0 || this.y > this.ctx.canvas.height) {
            this.y = (this.y + this.ctx.canvas.height) % this.ctx.canvas.height;
        }

        this.life++;
        if (this.life >= this.maxLife) {
             this.reset();
        }
    }
    
    reset(sceneProperties) {
        this.x = Math.random() * this.ctx.canvas.width;
        this.y = Math.random() * this.ctx.canvas.height;
        this.vx = random(-0.25, 0.25);
        this.vy = random(-0.25, 0.25);
        this.life = 0;
        this.maxLife = random(200, 500);
        if (sceneProperties) {
            const hue = random(sceneProperties.hue_min, sceneProperties.hue_max);
            this.color = `hsl(${hue % 360}, 100%, 75%)`;
        } else {
            this.color = `hsl(${random(180, 260)}, 100%, 75%)`;
        }
        this.size = random(0.5, 2.5);
        this.baseSize = this.size;
    }

    draw(sceneProperties) {
        // Recalculate color if scene properties are available
        if (sceneProperties && this.life % 60 === 0) { // Update color periodically
            const hue = random(sceneProperties.hue_min, sceneProperties.hue_max);
            this.color = `hsl(${hue % 360}, 100%, 75%)`;
        }
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = Math.min(1, (this.maxLife - this.life) / 100, this.life / 100);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawConnection(otherParticle, sceneProperties) {
        const dist = Math.hypot(this.x - otherParticle.x, this.y - otherParticle.y);
        if (dist < 80) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(otherParticle.x, otherParticle.y);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = 0.2;
            const opacity = (1 - (dist / 80)) * sceneProperties.particle_connection_opacity;
            this.ctx.globalAlpha = Math.max(0, opacity);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
    }
}