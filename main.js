import { Particle } from './particle.js';
import { Spirit } from './spirit.js';
import { Ripple } from './ripple.js';
import { AIController } from './ai-controller.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const instructionsEl = document.getElementById('instructions');
let particles = [];
let spirit;
let ripples = [];
let aiController;
let audioContext;
let oscillator;
let gainNode;

const sceneProperties = {
    background_alpha: 0.1,
    hue_min: 180,
    hue_max: 260,
    spirit_intensity: 0.1,
    particle_connection_opacity: 0.5
};

const mouse = {
    x: undefined,
    y: undefined,
    radius: 150,
    active: false,
};

function setupAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Main ambient tone
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime); // Deep C2
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    const lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, audioContext.currentTime); // Slow modulation
    
    const lfoGain = audioContext.createGain();
    lfoGain.gain.setValueAtTime(10, audioContext.currentTime); // Modulation depth in Hz

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.connect(gainNode).connect(audioContext.destination);
    
    oscillator.start();
    lfo.start();

    // Fade in
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 3);
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, ctx));
    }
    spirit = new Spirit(canvas.width, canvas.height);
    if (!aiController) {
        aiController = new AIController(sceneProperties);
    }
}

function animate() {
    aiController.update();
    const currentProps = aiController.currentProperties;

    ctx.fillStyle = `rgba(0, 5, 15, ${currentProps.background_alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    spirit.update();
    spirit.draw(ctx, currentProps);

    // Additive blending for glow effect
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((p, i) => {
        p.update(mouse, spirit);
        p.draw(currentProps);
        for (let j = i + 1; j < particles.length; j++) {
            p.drawConnection(particles[j], currentProps);
        }
    });

    ctx.globalCompositeOperation = 'source-over';

    ripples.forEach((r, index) => {
        r.update();
        r.draw();
        if (r.life <= 0) {
            ripples.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}


function handleInteractionStart(e) {
    if (!audioContext) {
        setupAudio();
        instructionsEl.style.opacity = '0';
        document.getElementById('title').style.opacity = '0';
        aiController.start();
    }
    mouse.active = true;
    updateMousePosition(e);
    ripples.push(new Ripple(mouse.x, mouse.y, ctx));
}

function handleInteractionEnd() {
    mouse.active = false;
}

function updateMousePosition(e) {
    if (e.touches) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }
}

window.addEventListener('mousemove', (e) => {
    if (mouse.active) {
        updateMousePosition(e);
    }
});
window.addEventListener('touchmove', (e) => {
    if (mouse.active) {
        updateMousePosition(e);
    }
}, { passive: true });


window.addEventListener('resize', () => {
    init();
});

init();
animate();