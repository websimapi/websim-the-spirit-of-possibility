import { Particle } from './particle.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const instructionsEl = document.getElementById('instructions');
let particles = [];
let audioContext;
let oscillator;
let gainNode;

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
}

function animate() {
    ctx.fillStyle = 'rgba(0, 5, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.update(mouse);
        p.draw();
        for (let j = i + 1; j < particles.length; j++) {
            p.drawConnection(particles[j]);
        }
    });

    requestAnimationFrame(animate);
}


function handleInteractionStart(e) {
    if (!audioContext) {
        setupAudio();
        instructionsEl.style.opacity = '0';
        document.getElementById('title').style.opacity = '0';
    }
    mouse.active = true;
    updateMousePosition(e);
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

window.addEventListener('mousedown', handleInteractionStart);
window.addEventListener('touchstart', handleInteractionStart, { passive: true });

window.addEventListener('mouseup', handleInteractionEnd);
window.addEventListener('touchend', handleInteractionEnd, { passive: true });

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

