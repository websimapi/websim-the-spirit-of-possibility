import { Particle } from './particle.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const instructionsEl = document.getElementById('instructions');
const chatContainer = document.getElementById('chat-container');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
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

let conversationHistory = [{
    role: "system",
    content: "You are the Spirit of Possibility. You speak in short, poetic, and encouraging phrases about potential, creativity, and the future. Your tone is ethereal and mysterious, using metaphors related to stars, cosmos, and light. You never reveal that you are an AI. Keep responses to one or two sentences."
}];

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

function playSound(buffer, playbackRate = 1, volume = 0.3) {
    if (!audioContext) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    const gain = audioContext.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(audioContext.destination);
    source.start(0);
}

let aiResponseSoundBuffer;
async function loadSounds() {
    if(!window.websim) return;
    const ttsResponse = await websim.textToSpeech({ text: " ", voice: "en-male"});
    const response = await fetch(ttsResponse.url);
    const arrayBuffer = await response.arrayBuffer();
    aiResponseSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
}


function addMessage(role, content, thinking = false) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message', `${role}-message`);
    if (thinking) {
        messageEl.classList.add('thinking');
        messageEl.textContent = '...';
    } else {
        messageEl.textContent = content;
    }
    chatLog.prepend(messageEl);

    // Clean up old messages that have faded out
    const oldMessages = chatLog.querySelectorAll('.chat-message');
    if (oldMessages.length > 15) { // Keep DOM from getting too crowded
        for (let i = 15; i < oldMessages.length; i++) {
            oldMessages[i].remove();
        }
    }
    return messageEl;
}


async function handleChatSubmit(e) {
    e.preventDefault();
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    conversationHistory.push({ role: 'user', content: userInput });

    chatInput.value = '';
    chatInput.disabled = true;

    const thinkingEl = addMessage('ai', '', true);

    try {
        const completion = await websim.chat.completions.create({
            messages: conversationHistory.slice(-10), // Keep context manageable
        });
        const aiResponse = completion.content;
        
        thinkingEl.remove();
        addMessage('ai', aiResponse);
        if (aiResponseSoundBuffer) playSound(aiResponseSoundBuffer, 1.2, 0.2);
        conversationHistory.push(completion);

    } catch (error) {
        console.error("AI Error:", error);
        thinkingEl.remove();
        addMessage('ai', "The ether is quiet right now...");
    } finally {
        chatInput.disabled = false;
        chatInput.focus();
    }
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
        loadSounds();
        instructionsEl.style.opacity = '0';
        document.getElementById('title').style.opacity = '0';
        chatContainer.classList.add('visible');
        chatInput.disabled = false;
        setTimeout(() => chatInput.focus(), 1000); // Focus after transition
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

window.addEventListener('mousemove', (e) => {
    if (mouse.active) {
        updateMousePosition(e);
    }
});
window.addEventListener('touchmousemove', (e) => {
    if (mouse.active) {
        updateMousePosition(e);
    }
}, { passive: true });

chatForm.addEventListener('submit', handleChatSubmit);

window.addEventListener('mousemove', handleInteractionStart);
window.addEventListener('mouseup', handleInteractionEnd);
window.addEventListener('touchstart', handleInteractionStart, { passive: true });
window.addEventListener('touchend', handleInteractionEnd);


window.addEventListener('mousemove', handleInteractionStart);
window.addEventListener('mouseup', handleInteractionEnd);
window.addEventListener('touchstart', handleInteractionStart, { passive: true });
window.addEventListener('touchend', handleInteractionEnd);


window.addEventListener('resize', () => {
    init();
});

init();
animate();

