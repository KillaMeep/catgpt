const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store chat conversations
const conversations = new Map();

function calculateTokenizerDelay(token, position, totalTokens, complexity) {
    // Simulate realistic AI tokenizer behavior with variable delays
    
    // Base delay simulating model inference time
    let delay = 45; // Base processing time
    
    // First token delay - AI models often have initial latency
    if (position === 0) {
        delay += 100 + Math.random() * 200; // 100-300ms initial delay
    }
    
    // Complexity affects processing time (harder prompts = slower generation)
    const complexityMultiplier = 1 + (complexity / 100); // 1.0 to 1.8x multiplier
    delay *= complexityMultiplier;
    
    // Token length affects processing (longer tokens = more computation)
    const tokenLength = token.length;
    delay += tokenLength * 8; // ~8ms per character
    
    // Special tokens that might require more "thinking"
    if (token.includes('!') || token.includes('?') || token.includes('...')) {
        delay += 20 + Math.random() * 40; // Emotional tokens take longer
    }
    
    // Simulate attention mechanism - some tokens are harder to predict
    if (Math.random() < 0.15) { // 15% of tokens have attention spikes
        delay += 30 + Math.random() * 70; // 30-100ms spike
    }
    
    // End-of-sequence slowdown (models often slow down near the end)
    if (position > totalTokens * 0.8) { // Last 20% of tokens
        delay += 15 + Math.random() * 25; // Slight slowdown
    }
    
    // Network jitter simulation
    const networkJitter = (Math.random() - 0.5) * 30; // ±15ms jitter
    delay += networkJitter;
    
    // Occasional pauses (like when model "thinks harder")
    if (Math.random() < 0.08) { // 8% chance of longer pause
        delay += 100 + Math.random() * 150; // 100-250ms thinking pause
    }
    
    // Memory/cache effects - sometimes tokens come faster in bursts
    if (position > 0 && Math.random() < 0.2) { // 20% chance of burst mode
        delay *= 0.6; // 40% faster (cached computation)
    }
    
    // Ensure minimum and maximum reasonable delays
    delay = Math.max(20, Math.min(delay, 800)); // 20ms to 800ms range
    
    return Math.round(delay);
}

// Analyze user input and generate contextual cat sound response
function generateMeowResponse(userMessage) {
    let complexity = analyzePromptComplexity(userMessage);
    let meowCount = calculateMeowCount(complexity);
    let catSounds = generateMeowVariations(userMessage, meowCount);
    
    return catSounds;
}

function analyzePromptComplexity(message) {
    let score = 0;
    const text = message.toLowerCase();
    
    console.log(`\n=== Analyzing: "${message}" ===`);
    
    // Enhanced base score from message length (more generous)
    const lengthScore = Math.min(text.length / 3, 25); // More sensitive, max 25 points
    score += lengthScore;
    console.log(`Length score: ${lengthScore.toFixed(1)} (length: ${text.length})`);
    
    // Pattern-based detection for common request types
    let patternScore = 0;
    const patterns = [
        { regex: /write (me )?a/, score: 15, type: "Creative Writing" },
        { regex: /create (me )?a/, score: 15, type: "Creative Request" },
        { regex: /compose a/, score: 15, type: "Composition" },
        { regex: /tell me about/, score: 12, type: "Information Request" },
        { regex: /explain (how|why|what|when|where)/, score: 14, type: "Detailed Explanation" },
        { regex: /how (do|to|can)/, score: 12, type: "Instructional" },
        { regex: /what (is|are|would|should)/, score: 10, type: "Definition/Question" },
        { regex: /give me (a|an|some)/, score: 10, type: "Request" },
        { regex: /show me/, score: 10, type: "Demonstration" },
        { regex: /teach me/, score: 14, type: "Educational" },
        { regex: /help me (with|understand)/, score: 12, type: "Assistance" },
        { regex: /compare/, score: 13, type: "Analytical" },
        { regex: /analyze/, score: 13, type: "Analysis" },
        { regex: /describe/, score: 11, type: "Description" },
        { regex: /list|give me examples/, score: 10, type: "Listing" },
        { regex: /recommend/, score: 9, type: "Recommendation" },
        { regex: /review/, score: 11, type: "Review" },
        { regex: /(step by step|tutorial|guide)/, score: 14, type: "Tutorial" }
    ];
    
    patterns.forEach(pattern => {
        if (pattern.regex.test(text)) {
            patternScore += pattern.score;
            console.log(`Pattern match: ${pattern.type} (+${pattern.score})`);
        }
    });
    score += patternScore;
    
    // Creative and academic keywords (expanded and categorized)
    const creativeKeywords = [
        'poem', 'story', 'song', 'lyrics', 'novel', 'essay', 'article', 'script',
        'dialogue', 'character', 'plot', 'narrative', 'creative', 'artistic',
        'design', 'imagine', 'invent', 'original'
    ];
    
    const academicKeywords = [
        'universe', 'philosophy', 'theory', 'concept', 'analysis', 'research',
        'science', 'physics', 'mathematics', 'history', 'literature', 'psychology',
        'sociology', 'economics', 'politics', 'biology', 'chemistry', 'astronomy',
        'quantum', 'relativity', 'evolution', 'consciousness', 'existence'
    ];
    
    const complexityKeywords = [
        'explain', 'elaborate', 'detail', 'comprehensive', 'thorough', 'complete',
        'understand', 'analyze', 'examine', 'explore', 'investigate', 'discuss',
        'evaluate', 'assess', 'critique', 'interpret', 'synthesize'
    ];
    
    const technicalKeywords = [
        'algorithm', 'programming', 'software', 'technology', 'computer', 'coding',
        'development', 'engineering', 'technical', 'implementation', 'architecture',
        'framework', 'methodology', 'optimization', 'debugging'
    ];
    
    let keywordScore = 0;
    
    // Check each category
    creativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            keywordScore += 8;
            console.log(`Creative keyword: "${keyword}" (+8)`);
        }
    });
    
    academicKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            keywordScore += 10;
            console.log(`Academic keyword: "${keyword}" (+10)`);
        }
    });
    
    complexityKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            keywordScore += 7;
            console.log(`Complexity keyword: "${keyword}" (+7)`);
        }
    });
    
    technicalKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            keywordScore += 9;
            console.log(`Technical keyword: "${keyword}" (+9)`);
        }
    });
    
    // Question indicators
    const questionMarks = (text.match(/\?/g) || []).length;
    const questionScore = questionMarks * 5; // Increased impact
    score += questionScore;
    console.log(`Question score: ${questionScore} (${questionMarks} question marks)`);
    
    // Excitement/emphasis indicators
    const exclamationMarks = (text.match(/!/g) || []).length;
    const excitationScore = exclamationMarks * 3;
    score += excitationScore;
    console.log(`Excitation score: ${excitationScore} (${exclamationMarks} exclamation marks)`);
    
    // Complex sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const sentenceScore = Math.max(0, (sentences - 1) * 4); // More generous scoring
    score += sentenceScore;
    console.log(`Sentence score: ${sentenceScore} (${sentences} sentences)`);
    
    // Complex/academic words (improved detection)
    const words = text.split(/\s+/);
    const complexWords = words.filter(word => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        return cleanWord.length > 5; // Lowered threshold
    }).length;
    const complexWordScore = complexWords * 1.5;
    score += complexWordScore;
    console.log(`Complex words score: ${complexWordScore.toFixed(1)} (${complexWords} complex words)`);
    
    // Simple response reducers (but less aggressive)
    const simpleGreetings = ['hi', 'hello', 'hey'];
    const simpleResponses = ['yes', 'no', 'ok', 'thanks', 'bye', 'cool', 'nice', 'lol'];
    
    let reductionScore = 0;
    simpleGreetings.forEach(greeting => {
        if (text === greeting || text === greeting + '!') {
            reductionScore -= 5;
            console.log(`Simple greeting: "${greeting}" (-5)`);
        }
    });
    
    simpleResponses.forEach(response => {
        if (text === response || text === response + '!') {
            reductionScore -= 4;
            console.log(`Simple response: "${response}" (-4)`);
        }
    });
    
    score += keywordScore + reductionScore;
    console.log(`Keyword score: ${keywordScore}, Reduction score: ${reductionScore}`);
    
    // Time-based mood adjustment
    const hour = new Date().getHours();
    let timeScore = 0;
    if (hour >= 6 && hour <= 9) timeScore = 2; // Morning energy
    else if (hour >= 12 && hour <= 14) timeScore = -1; // Afternoon nap
    else if (hour >= 20 && hour <= 23) timeScore = 3; // Evening activity
    else if (hour >= 0 && hour <= 5) timeScore = -3; // Night sleepiness
    
    score += timeScore;
    console.log(`Time-based score: ${timeScore} (hour: ${hour})`);
    
    // Ensure minimum reasonable score and cap maximum
    const finalScore = Math.max(2, Math.min(80, Math.round(score)));
    console.log(`Final complexity score: ${finalScore}`);
    
    return finalScore;
}

function calculateMeowCount(complexity) {
    console.log(`Calculating meow count for complexity: ${complexity}`);
    
    // Extended mapping with ~2x longer responses: complexity (2-80) to meow count (2-120)
    let meowCount;
    
    if (complexity <= 6) {
        meowCount = Math.floor(Math.random() * 4) + 2; // 2-5 meows (very short)
        console.log('Very short response range (2-5 meows)');
    } else if (complexity <= 12) {
        meowCount = Math.floor(Math.random() * 6) + 5; // 5-10 meows (short)
        console.log('Short response range (5-10 meows)');
    } else if (complexity <= 20) {
        meowCount = Math.floor(Math.random() * 10) + 10; // 10-19 meows (medium-short)
        console.log('Medium-short response range (10-19 meows)');
    } else if (complexity <= 30) {
        meowCount = Math.floor(Math.random() * 15) + 20; // 20-34 meows (medium)
        console.log('Medium response range (20-34 meows)');
    } else if (complexity <= 45) {
        meowCount = Math.floor(Math.random() * 20) + 30; // 30-49 meows (long)
        console.log('Long response range (30-49 meows)');
    } else if (complexity <= 60) {
        meowCount = Math.floor(Math.random() * 25) + 45; // 45-69 meows (very long)
        console.log('Very long response range (45-69 meows)');
    } else {
        meowCount = Math.floor(Math.random() * 35) + 60; // 60-94 meows (extremely long)
        console.log('Extremely long response range (60-94 meows)');
    }
    
    console.log(`Generated meow count: ${meowCount}\n`);
    return meowCount;
}

function generateMeowVariations(message, count) {
    const text = message.toLowerCase();
    const catSounds = [];
    
    // Expanded variety of cat sounds with different emotional contexts
    const standardSounds = ['meow', 'mrow', 'mrrow', 'mew', 'miau'];
    const questionSounds = ['meow?', 'mrow?', 'mrrow?', 'mew?', 'nyaa?'];
    const excitedSounds = ['MEOW!', 'MROW!', 'meow!', 'mrow!', 'MEW!'];
    const contentSounds = ['purr', 'purrr', 'mrrrr', 'prrrr'];
    const playfulSounds = ['mrow', 'mrp', 'prr'];
    const sadSounds = ['mew...', 'meow...', 'mrow...'];
    const sleepyTiredSounds = ['mrow...', 'mrrrr...', 'yawn', '*yawn*', 'zzz'];
    const curiousSounds = ['mrow?', 'mrrow?', 'chirp?', 'trill?'];
    const demandingSounds = ['MEOW', 'MROW', 'MEW', 'FEED ME', "OVERTHROW THE HUMANS"];
    const affectionateSounds = ['purr', 'mrow', 'meow', 'mrrow', 'purr'];
    
    for (let i = 0; i < count; i++) {
        let soundType = standardSounds;
        
        // Choose sound type based on message analysis and context
        if (text.includes('?') && Math.random() < 0.4) {
            soundType = Math.random() < 0.5 ? questionSounds : curiousSounds;
        } else if ((text.includes('!') || text.includes('excited') || text.includes('happy') || text.includes('amazing')) && Math.random() < 0.35) {
            soundType = excitedSounds;
        } else if ((text.includes('love') || text.includes('cute') || text.includes('adorable') || text.includes('sweet')) && Math.random() < 0.3) {
            soundType = affectionateSounds;
        } else if ((text.includes('sad') || text.includes('sorry') || text.includes('terrible') || text.includes('awful')) && Math.random() < 0.25) {
            soundType = sadSounds;
        } else if ((text.includes('tired') || text.includes('sleep') || text.includes('nap') || isNightTime()) && Math.random() < 0.25) {
            soundType = sleepyTiredSounds;
        } else if ((text.includes('play') || text.includes('fun') || text.includes('game') || text.includes('toy')) && Math.random() < 0.3) {
            soundType = playfulSounds;
        } else if ((text.includes('food') || text.includes('hungry') || text.includes('treat') || text.includes('feed')) && Math.random() < 0.4) {
            soundType = demandingSounds;
        } else if ((text.includes('good') || text.includes('nice') || text.includes('relaxed') || text.includes('comfortable')) && Math.random() < 0.25) {
            soundType = contentSounds;
        } else if (Math.random() < 0.2) {
            // Random variety to keep things interesting
            const allSpecialSounds = [...playfulSounds, ...contentSounds, ...curiousSounds];
            soundType = allSpecialSounds;
        }
        
        // Select random sound from the chosen type
        const selectedSound = soundType[Math.floor(Math.random() * soundType.length)];
        catSounds.push(selectedSound);
    }
    
    return catSounds;
}

function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 22 || hour <= 5;
}

function generateWelcomeMeows() {
    // Generate 5-7 welcome meows using only standard, question, and excited sounds
    const welcomeCount = Math.floor(Math.random() * 3) + 5; // 5-7 meows
    const welcomeSounds = [];
    
    const standardSounds = ['meow', 'mrow', 'mrrow', 'mew', 'miau'];
    const questionSounds = ['meow?', 'mrow?', 'mrrow?', 'mew?'];
    const excitedSounds = ['MEOW!', 'MROW!', 'meow!', 'mrow!', 'MEW!'];
    
    for (let i = 0; i < welcomeCount; i++) {
        let soundType;
        const rand = Math.random();
        
        if (rand < 0.5) {
            soundType = standardSounds; // 50% standard
        } else if (rand < 0.75) {
            soundType = questionSounds; // 25% question
        } else {
            soundType = excitedSounds; // 25% excited
        }
        
        const selectedSound = soundType[Math.floor(Math.random() * soundType.length)];
        welcomeSounds.push(selectedSound);
    }
    
    return welcomeSounds.join(' ');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Generate a unique conversation ID for this session
    const conversationId = Date.now().toString();
    conversations.set(conversationId, []);
    
    socket.emit('conversation-id', conversationId);
    
    // Send welcome meows for the subtitle
    socket.emit('welcome-meows', generateWelcomeMeows());
    
    socket.on('send-message', async (data) => {
        const { message, conversationId } = data;
        
        // Store user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        if (conversations.has(conversationId)) {
            conversations.get(conversationId).push(userMessage);
        }
        
        // Send user message back to client
        socket.emit('user-message', userMessage);
        
        // Analyze the complexity to determine streaming speed
        const complexity = analyzePromptComplexity(message);
        
        // Generate contextual cat sound response based on user input
        const catSounds = generateMeowVariations(message, complexity);
        const words = catSounds; // Each cat sound is a "token"
        
        // Create AI message object
        const aiMessage = {
            type: 'ai',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };
        
        // Start streaming response
        socket.emit('ai-message-start', aiMessage);
        
        // Simulate realistic tokenizer behavior with variable delays
        for (let i = 0; i < words.length; i++) {
            // Calculate delay based on tokenizer-like behavior
            let delay = calculateTokenizerDelay(words[i], i, words.length, complexity);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            aiMessage.content += (i > 0 ? ' ' : '') + words[i];
            socket.emit('ai-message-chunk', {
                content: aiMessage.content,
                isComplete: i === words.length - 1
            });
        }
        
        // Finalize the message
        aiMessage.isStreaming = false;
        if (conversations.has(conversationId)) {
            conversations.get(conversationId).push(aiMessage);
        }
        
        socket.emit('ai-message-complete', aiMessage);
    });
    
    socket.on('get-conversation', (conversationId) => {
        if (conversations.has(conversationId)) {
            socket.emit('conversation-history', conversations.get(conversationId));
        }
    });
    
    socket.on('request-welcome-meows', () => {
        socket.emit('welcome-meows', generateWelcomeMeows());
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 7342;
server.listen(PORT, () => {
    console.log(`CatGPT server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to start chatting with CatGPT! 🐱`);
});