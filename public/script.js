// Initialize Socket.IO connection
const socket = io();

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const chatHistory = document.getElementById('chatHistory');
const newChatBtn = document.getElementById('newChatBtn');

// State
let conversationId = null;
let isStreaming = false;
let hasMessages = false; // Track if conversation has any messages

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    
    // Enable/disable send button
    sendBtn.disabled = this.value.trim() === '' || isStreaming;
});

// Send message on Enter (but not Shift+Enter)
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendBtn.addEventListener('click', sendMessage);

// New chat button
newChatBtn.addEventListener('click', startNewChat);

socket.on('conversation-history', (messages) => {
    displayConversationHistory(messages);
});

// Socket event listeners
socket.on('conversation-id', (id) => {
    conversationId = id;
    hasMessages = false; // Reset message flag for new conversation
});

socket.on('welcome-meows', (meows) => {
    updateWelcomeSubtitle(meows);
});

socket.on('user-message', (message) => {
    displayUserMessage(message.content);
});

socket.on('ai-message-start', (message) => {
    displayAIMessageStart();
    isStreaming = true;
    sendBtn.disabled = true;
});

socket.on('ai-message-chunk', (data) => {
    updateAIMessage(data.content, !data.isComplete);
});

socket.on('ai-message-complete', (message) => {
    updateAIMessage(message.content, false);
    isStreaming = false;
    sendBtn.disabled = messageInput.value.trim() === '';
});

// Functions
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '' || isStreaming) return;
    
    // Add to chat history if this is the first message
    if (!hasMessages && conversationId) {
        addChatToHistory(`Chat ${new Date().toLocaleTimeString()}`, conversationId);
        hasMessages = true;
    }
    
    socket.emit('send-message', {
        message: message,
        conversationId: conversationId
    });
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;
}

function displayUserMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            ${escapeHtml(content)}
        </div>
    `;
    
    // Remove welcome section if it exists
    const welcomeSection = messagesContainer.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.remove();
    }
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function displayAIMessageStart() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.id = 'current-ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="images/catgpt-avatar.png" alt="CatGPT" class="avatar-gif">
        </div>
        <div class="message-content">
            <span class="streaming-cursor"></span>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function updateWelcomeSubtitle(meows) {
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    if (welcomeSubtitle) {
        welcomeSubtitle.textContent = meows;
    }
}

function createWelcomeSection(subtitle = 'meow mrow meow meow? mrow!') {
    return `
        <div class="welcome-section">
            <div class="welcome-icon">
                <div class="cat-logo">
                    <img src="images/catgpt-avatar.png" alt="CatGPT Logo" class="cat-gif">
                </div>
            </div>
            <h1 class="welcome-title">How can I help you today?</h1>
            <div class="welcome-subtitle">${subtitle}</div>
        </div>
    `;
}

function updateAIMessage(content, isStreaming) {
    const currentMessage = document.getElementById('current-ai-message');
    if (!currentMessage) return;
    
    const messageContent = currentMessage.querySelector('.message-content');
    if (isStreaming) {
        messageContent.innerHTML = `${escapeHtml(content)}<span class="streaming-cursor"></span>`;
    } else {
        messageContent.innerHTML = `
            <div class="message-text">${escapeHtml(content)}</div>
            <div class="message-actions">
                <button class="speak-button" onclick="speakMessage('${escapeHtml(content).replace(/'/g, "\\'")}', this)" title="Speak it with cat sounds!">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        currentMessage.id = ''; // Remove the ID as it's no longer the current message
    }
    
    scrollToBottom();
}

function addChatToHistory(title, id) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item active';
    chatItem.dataset.conversationId = id;
    chatItem.textContent = title;
    
    // Add click event listener to load conversation
    chatItem.addEventListener('click', () => {
        // Remove active class from other items
        chatHistory.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        chatItem.classList.add('active');
        
        // Load the conversation
        loadConversation(id);
    });
    
    // Remove active class from other items
    chatHistory.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    chatHistory.appendChild(chatItem);
}

function loadConversation(conversationId) {
    // Update current conversation ID
    window.conversationId = conversationId;
    
    // Request conversation history from server
    socket.emit('get-conversation', conversationId);
}

function displayConversationHistory(messages) {
    // Clear current messages but keep the welcome section for empty conversations
    if (messages.length === 0) {
        messagesContainer.innerHTML = createWelcomeSection();
        hasMessages = false;
        return;
    }
    
    // Set hasMessages flag if there are messages
    hasMessages = messages.length > 0;
    
    // Clear messages container
    messagesContainer.innerHTML = '';
    
    // Display each message in the conversation
    messages.forEach(message => {
        if (message.type === 'user') {
            displayUserMessage(message.content);
        } else if (message.type === 'ai') {
            displayCompletedAIMessage(message.content);
        }
    });
    
    scrollToBottom();
}

function displayCompletedAIMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="images/catgpt-avatar.png" alt="CatGPT" class="avatar-gif">
        </div>
        <div class="message-content">
            <div class="message-text">${escapeHtml(content)}</div>
            <div class="message-actions">
                <button class="speak-button" onclick="speakMessage('${escapeHtml(content).replace(/'/g, "\\'")}', this)" title="Speak it with cat sounds!">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

function startNewChat() {
    // Clear current conversation ID and reset state
    conversationId = null;
    hasMessages = false;
    isStreaming = false;
    
    // Clear all messages completely
    messagesContainer.innerHTML = '';
    
    // Show welcome screen
    messagesContainer.innerHTML = createWelcomeSection();
    
    // Request fresh welcome meows for the new chat
    socket.emit('request-welcome-meows');
    
    // Reset send button
    sendBtn.disabled = messageInput.value.trim() === '';
    
    // Request a new conversation ID (this will create a new conversation)
    socket.disconnect();
    socket.connect();
}

function scrollToBottom() {
    // Get the chat container which is the actual scrollable element
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        // Use requestAnimationFrame to ensure DOM has updated before scrolling
        requestAnimationFrame(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some fun cat-themed responses for different times of day
function getCatGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) {
        return "😴 *sleepy meows*";
    } else if (hour < 12) {
        return "🌅 *morning meows*";
    } else if (hour < 18) {
        return "☀️ *afternoon meows*";
    } else {
        return "🌙 *evening meows*";
    }
}

// Add some easter eggs for specific keywords
socket.on('ai-message-start', () => {
    // Add a subtle animation to the cat avatar in the welcome message
    const catAvatar = document.querySelector('.cat-avatar');
    if (catAvatar && Math.random() < 0.3) { // 30% chance
        catAvatar.style.animation = 'bounce 0.5s ease-in-out';
        setTimeout(() => {
            catAvatar.style.animation = '';
        }, 500);
    }
});

// Add CSS for the bounce animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Initialize the application
function initializeApp() {
    // Ensure we start with a clean state
    hasMessages = false;
    isStreaming = false;
    
    // Make sure welcome section is visible
    if (!messagesContainer.querySelector('.welcome-section')) {
        messagesContainer.innerHTML = createWelcomeSection();
    }
    
    // Request initial welcome meows
    if (socket.connected) {
        socket.emit('request-welcome-meows');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Also initialize when socket connects (in case DOM loads before socket)
socket.on('connect', () => {
    if (!hasMessages) {
        socket.emit('request-welcome-meows');
    }
});

// Initialize
console.log('🐱 CatGPT initialized!');

// Audio Library and "Speak It" Feature
let audioLibrary = null;
let currentAudioPlayback = null;

// Load audio library configuration
async function loadAudioLibrary() {
    try {
        const response = await fetch('/audio/audio-library.json');
        audioLibrary = await response.json();
        console.log('🔊 Audio library loaded!', audioLibrary);
    } catch (error) {
        console.warn('⚠️ Could not load audio library:', error);
        audioLibrary = null;
    }
}

// Get any random sound from all available sounds for simplified playback
function getAnyRandomSound(excludeSound = null, recentSounds = []) {
    if (!audioLibrary || !audioLibrary.emotions) {
        return null;
    }
    
    // Collect all sounds from all emotions
    const allSounds = [];
    Object.values(audioLibrary.emotions).forEach(emotion => {
        if (emotion.sounds) {
            allSounds.push(...emotion.sounds);
        }
    });
    
    if (allSounds.length === 0) return null;
    
    // Filter out recently used sounds for variety
    let availableSounds = allSounds.filter(sound => 
        sound !== excludeSound && 
        !recentSounds.includes(sound)
    );
    
    // If no sounds available after filtering, use all except the last one
    if (availableSounds.length === 0) {
        availableSounds = allSounds.filter(sound => sound !== excludeSound);
    }
    
    // If still no sounds, fall back to all sounds
    if (availableSounds.length === 0) {
        availableSounds = allSounds;
    }
    
    return availableSounds[Math.floor(Math.random() * availableSounds.length)];
}

// Create audio sequence from text with any sounds (simplified)
function createAudioSequence(text) {
    const words = text.trim().split(/\s+/);
    const sequence = [];
    const recentSounds = []; // Track last 5 sounds to avoid repetition
    const maxRecentSounds = 5;
    
    // Calculate target number of sounds based on message length - more sounds for longer messages
    let targetSounds;
    if (words.length <= 3) {
        targetSounds = Math.max(2, words.length); // 2-3 sounds for very short messages
    } else if (words.length <= 8) {
        targetSounds = Math.ceil(words.length * 0.7); // ~70% of words for short messages
    } else if (words.length <= 15) {
        targetSounds = Math.ceil(words.length * 0.5); // ~50% of words for medium messages
    } else if (words.length <= 25) {
        targetSounds = Math.ceil(words.length * 0.4); // ~40% of words for long messages
    } else {
        targetSounds = Math.ceil(words.length * 0.3); // ~30% of words for very long messages
    }
    
    // Ensure reasonable bounds (minimum 2, maximum 20 sounds)
    targetSounds = Math.max(2, Math.min(20, targetSounds));
    
    // Calculate how often to place sounds evenly throughout the message
    const soundInterval = Math.max(1, Math.floor(words.length / targetSounds));
    
    // Create sounds at calculated intervals
    for (let i = 0; i < words.length && sequence.length < targetSounds; i += soundInterval) {
        const lastSound = sequence.length > 0 ? sequence[sequence.length - 1].file.replace('/audio/', '') : null;
        const soundFile = getAnyRandomSound(lastSound, recentSounds);
        
        if (soundFile) {
            sequence.push({
                file: `/audio/${soundFile}`,
                word: words[i],
                emotion: 'any' // No specific emotion needed
            });
            
            // Track recent sounds for variety
            recentSounds.push(soundFile);
            if (recentSounds.length > maxRecentSounds) {
                recentSounds.shift(); // Remove oldest sound
            }
        }
    }
    
    // If we haven't reached our target, add more sounds
    while (sequence.length < targetSounds) {
        const lastSound = sequence.length > 0 ? sequence[sequence.length - 1].file.replace('/audio/', '') : null;
        const soundFile = getAnyRandomSound(lastSound, recentSounds);
        
        if (soundFile) {
            sequence.push({
                file: `/audio/${soundFile}`,
                word: '(additional)',
                emotion: 'any'
            });
            
            recentSounds.push(soundFile);
            if (recentSounds.length > maxRecentSounds) {
                recentSounds.shift();
            }
        } else {
            break; // No more sounds available
        }
    }
    
    console.log(`📏 Message: ${words.length} words → ${sequence.length} sounds (target: ${targetSounds})`);
    return sequence;
}

// Play audio sequence with smooth transitions
async function playAudioSequence(sequence, button) {
    if (!sequence || sequence.length === 0) {
        console.warn('No audio sequence to play');
        return;
    }
    
    // Update button state
    button.innerHTML = '<i class="fas fa-stop"></i>';
    button.disabled = true;
    button.classList.add('playing');
    
    try {
        currentAudioPlayback = {
            sequence: sequence,
            button: button,
            currentIndex: 0,
            isPlaying: true
        };
        
        for (let i = 0; i < sequence.length; i++) {
            if (!currentAudioPlayback || !currentAudioPlayback.isPlaying) {
                break;
            }
            
            const audioItem = sequence[i];
            currentAudioPlayback.currentIndex = i;
            
            try {
                await playAudioFileSmooth(audioItem.file, i === 0, i === sequence.length - 1);
                // Varied delay between sounds for more natural rhythm
                const delay = 150 + Math.random() * 100; // 150-250ms delay
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                console.warn(`Could not play ${audioItem.file}:`, error);
                // Continue with next sound
            }
        }
    } catch (error) {
        console.error('Error playing audio sequence:', error);
    } finally {
        // Reset button state
        if (button) {
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
            button.disabled = false;
            button.classList.remove('playing');
        }
        currentAudioPlayback = null;
    }
}

// Play individual audio file with smooth fade effects
function playAudioFileSmooth(src, isFirst = false, isLast = false) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        
        // Set initial volume for fade-in effect
        audio.volume = isFirst ? 0 : 0.3;
        
        audio.addEventListener('error', () => {
            reject(new Error(`Failed to load audio: ${src}`));
        });
        
        audio.addEventListener('canplaythrough', () => {
            audio.play().then(() => {
                // Fade in effect
                if (isFirst) {
                    fadeIn(audio, 0.8, 200); // Quick fade-in for first sound
                } else {
                    fadeIn(audio, 0.8, 100); // Subtle fade-in for subsequent sounds
                }
                
                // Set up fade out before the sound ends
                audio.addEventListener('timeupdate', function fadeOutHandler() {
                    const timeLeft = audio.duration - audio.currentTime;
                    
                    // Start fade out in the last 150ms (or 100ms for short sounds)
                    const fadeTime = audio.duration < 1 ? 100 : 150;
                    
                    if (timeLeft <= fadeTime / 1000 && !isLast) {
                        audio.removeEventListener('timeupdate', fadeOutHandler);
                        fadeOut(audio, 0.3, fadeTime); // Fade to 30% volume instead of 0
                    } else if (timeLeft <= fadeTime / 1000 && isLast) {
                        audio.removeEventListener('timeupdate', fadeOutHandler);
                        fadeOut(audio, 0, fadeTime); // Complete fade out for last sound
                    }
                });
                
                audio.addEventListener('ended', resolve);
            }).catch(reject);
        });
        
        // Start loading
        audio.load();
    });
}

// Smooth fade in function
function fadeIn(audio, targetVolume, duration) {
    const startVolume = audio.volume;
    const volumeStep = (targetVolume - startVolume) / (duration / 10);
    
    const fadeInterval = setInterval(() => {
        if (audio.volume + volumeStep >= targetVolume) {
            audio.volume = targetVolume;
            clearInterval(fadeInterval);
        } else {
            audio.volume += volumeStep;
        }
    }, 10);
}

// Smooth fade out function
function fadeOut(audio, targetVolume, duration) {
    const startVolume = audio.volume;
    const volumeStep = (startVolume - targetVolume) / (duration / 10);
    
    const fadeInterval = setInterval(() => {
        if (audio.volume - volumeStep <= targetVolume) {
            audio.volume = targetVolume;
            clearInterval(fadeInterval);
        } else {
            audio.volume -= volumeStep;
        }
    }, 10);
}

// Legacy function for compatibility (now just calls the smooth version)
function playAudioFile(src) {
    return playAudioFileSmooth(src, true, true);
}

// Main speak function called by buttons
async function speakMessage(text, button) {
    if (!audioLibrary) {
        console.warn('Audio library not loaded');
        return;
    }
    
    // Stop current playback if running
    if (currentAudioPlayback && currentAudioPlayback.isPlaying) {
        stopCurrentPlayback();
        return;
    }
    
    const sequence = createAudioSequence(text);
    
    if (sequence.length === 0) {
        console.warn('No audio sequence could be created for text:', text);
        return;
    }
    
    console.log('🔊 Playing audio sequence:', sequence);
    await playAudioSequence(sequence, button);
}

// Stop current audio playback
function stopCurrentPlayback() {
    if (currentAudioPlayback) {
        currentAudioPlayback.isPlaying = false;
        
        if (currentAudioPlayback.button) {
            currentAudioPlayback.button.innerHTML = '<i class="fas fa-volume-up"></i>';
            currentAudioPlayback.button.disabled = false;
            currentAudioPlayback.button.classList.remove('playing');
        }
        
        currentAudioPlayback = null;
    }
}

// Load audio library when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAudioLibrary();
});