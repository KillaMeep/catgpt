// Initialize Socket.IO connection
const socket = io();

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const chatHistory = document.getElementById('chatHistory');
const newChatBtn = document.getElementById('newChatBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const sidebar = document.querySelector('.sidebar');

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

// Mobile menu functionality
if (mobileMenuBtn && mobileOverlay && sidebar) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
    
    // Close mobile menu when clicking on a chat item
    chatHistory.addEventListener('click', (e) => {
        if (e.target.classList.contains('chat-item')) {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu when starting a new chat
    newChatBtn.addEventListener('click', closeMobileMenu);
}

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
            <img src="https://media.tenor.com/TKXDxD1BwkoAAAAM/middle-finger-cat.gif" alt="CatGPT" class="avatar-gif">
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
                    <img src="https://media.tenor.com/TKXDxD1BwkoAAAAM/middle-finger-cat.gif" alt="CatGPT Logo" class="cat-gif">
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
        messageContent.innerHTML = escapeHtml(content);
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
            <img src="https://media.tenor.com/TKXDxD1BwkoAAAAM/middle-finger-cat.gif" alt="CatGPT" class="avatar-gif">
        </div>
        <div class="message-content">
            ${escapeHtml(content)}
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
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mobile menu functions
function toggleMobileMenu() {
    if (sidebar.classList.contains('open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    sidebar.classList.add('open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMobileMenu() {
    sidebar.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Handle escape key to close mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
        closeMobileMenu();
    }
});

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
console.log('🐱 CatGPT initialized! Ready to meow at your service!');