const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const natural = require('natural');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enhanced logging utilities
const Logger = {
    getTimestamp: () => new Date().toISOString(),
    formatDuration: (start, end) => `${(end - start).toFixed(2)}ms`,
    
    info: (message, data = null) => {
        const timestamp = Logger.getTimestamp();
        if (data) {
            console.log(`[${timestamp}] [INFO] ${message}`, data);
        } else {
            console.log(`[${timestamp}] [INFO] ${message}`);
        }
    },
    
    warn: (message, data = null) => {
        const timestamp = Logger.getTimestamp();
        if (data) {
            console.warn(`[${timestamp}] [WARN] ${message}`, data);
        } else {
            console.warn(`[${timestamp}] [WARN] ${message}`);
        }
    },
    
    error: (message, error = null) => {
        const timestamp = Logger.getTimestamp();
        if (error) {
            console.error(`[${timestamp}] [ERROR] ${message}`, error);
        } else {
            console.error(`[${timestamp}] [ERROR] ${message}`);
        }
    },
    
    debug: (message, data = null) => {
        const timestamp = Logger.getTimestamp();
        if (data) {
            console.log(`[${timestamp}] [DEBUG] ${message}`, data);
        } else {
            console.log(`[${timestamp}] [DEBUG] ${message}`);
        }
    },
    
    socket: (socketId, event, message, data = null) => {
        const timestamp = Logger.getTimestamp();
        const shortId = socketId.substring(0, 8);
        if (data) {
            console.log(`[${timestamp}] [SOCKET:${shortId}] [${event}] ${message}`, data);
        } else {
            console.log(`[${timestamp}] [SOCKET:${shortId}] [${event}] ${message}`);
        }
    }
};

// Server statistics tracking
const serverStats = {
    startTime: Date.now(),
    totalConnections: 0,
    activeConnections: 0,
    totalMessages: 0,
    totalResponses: 0,
    averageResponseTime: 0,
    responseTimes: [],
    
    addResponseTime: function(time) {
        this.responseTimes.push(time);
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift(); // Keep only last 100 response times
        }
        this.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    },
    
    getUptime: function() {
        const uptimeMs = Date.now() - this.startTime;
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    },
    
    getStats: function() {
        return {
            uptime: this.getUptime(),
            totalConnections: this.totalConnections,
            activeConnections: this.activeConnections,
            totalMessages: this.totalMessages,
            totalResponses: this.totalResponses,
            averageResponseTime: this.averageResponseTime.toFixed(2) + 'ms',
            conversationsStored: conversations.size,
            memoryUsage: process.memoryUsage()
        };
    }
};

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    Logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        Logger.info(`${req.method} ${req.url} - ${res.statusCode}`, {
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length') || 'unknown'
        });
    });
    
    next();
});

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
function generateMeowResponse(userMessage, clientTime = null) {
    let complexity = analyzePromptComplexity(userMessage);
    let meowCount = calculateMeowCount(complexity);
    let catSounds = generateMeowVariations(userMessage, meowCount, clientTime);
    
    return catSounds;
}

// Helper functions for dynamic complexity analysis
function detectSemanticComplexity(text) {
    // Analyze semantic indicators of complexity
    let semanticScore = 0;
    
    // Dependency/relationship words
    const relationshipWords = ['because', 'therefore', 'however', 'moreover', 'furthermore', 'nevertheless', 'consequently', 'meanwhile', 'although', 'whereas'];
    const relationshipCount = relationshipWords.filter(word => text.includes(word)).length;
    semanticScore += relationshipCount * 3;
    
    // Abstract concept indicators
    const abstractIndicators = ['concept', 'principle', 'theory', 'hypothesis', 'assumption', 'perspective', 'approach', 'methodology', 'framework'];
    const abstractCount = abstractIndicators.filter(word => text.includes(word)).length;
    semanticScore += abstractCount * 4;
    
    // Quantitative/measurement words
    const quantitativeWords = ['percent', 'ratio', 'proportion', 'statistics', 'data', 'measurement', 'calculate', 'estimate', 'approximately'];
    const quantitativeCount = quantitativeWords.filter(word => text.includes(word)).length;
    semanticScore += quantitativeCount * 2;
    
    return { score: semanticScore, details: { relationshipCount, abstractCount, quantitativeCount } };
}

function analyzeTextStructure(text) {
    // Analyze structural complexity
    let structuralScore = 0;
    
    // Clause analysis (approximate)
    const commaCount = (text.match(/,/g) || []).length;
    const semicolonCount = (text.match(/;/g) || []).length;
    const colonCount = (text.match(/:/g) || []).length;
    
    structuralScore += commaCount * 0.5; // Commas indicate complex clauses
    structuralScore += semicolonCount * 2; // Semicolons indicate complex relationships
    structuralScore += colonCount * 1.5; // Colons indicate explanations/lists
    
    // Parenthetical expressions
    const parentheticalCount = (text.match(/\([^)]*\)/g) || []).length;
    structuralScore += parentheticalCount * 2;
    
    // Quotation marks (indicating examples, references)
    const quotationCount = (text.match(/["']/g) || []).length / 2; // Pairs of quotes
    structuralScore += quotationCount * 1;
    
    return { score: structuralScore, details: { commaCount, semicolonCount, colonCount, parentheticalCount, quotationCount } };
}

function calculateDynamicCategoryBonus(matchedCategories, categoryMultipliers) {
    // Bonus for combining multiple categories (interdisciplinary complexity)
    if (matchedCategories.size <= 1) return 0;
    
    const categoryArray = Array.from(matchedCategories);
    const avgMultiplier = categoryArray.reduce((sum, cat) => sum + (categoryMultipliers[cat] || 1.0), 0) / categoryArray.length;
    const combinationBonus = Math.round((matchedCategories.size - 1) * 3 * avgMultiplier);
    
    return combinationBonus;
}

function adaptiveScoring(baseScore, textLength, categoryContext) {
    // Adaptive scoring based on text length and context
    let adaptiveMultiplier = 1.0;
    
    // Length-based adaptation
    if (textLength > 100) adaptiveMultiplier += 0.1;
    if (textLength > 200) adaptiveMultiplier += 0.1;
    if (textLength > 300) adaptiveMultiplier += 0.1;
    
    // Context-based adaptation
    const highComplexityCategories = ['academic', 'technical', 'analytical'];
    const hasHighComplexityCategory = categoryContext.some(cat => highComplexityCategories.includes(cat));
    if (hasHighComplexityCategory) adaptiveMultiplier += 0.05;
    
    return Math.round(baseScore * adaptiveMultiplier);
}

// Function to update complexity configuration dynamically
function updateComplexityConfig(newConfig) {
    // Merge new configuration with existing configuration
    if (newConfig.scoring) {
        Object.assign(COMPLEXITY_CONFIG.scoring, newConfig.scoring);
    }
    
    if (newConfig.patterns) {
        // Allow adding new patterns or updating existing ones
        newConfig.patterns.forEach(newPattern => {
            const existingIndex = COMPLEXITY_CONFIG.patterns.findIndex(p => p.type === newPattern.type);
            if (existingIndex >= 0) {
                COMPLEXITY_CONFIG.patterns[existingIndex] = { ...COMPLEXITY_CONFIG.patterns[existingIndex], ...newPattern };
            } else {
                COMPLEXITY_CONFIG.patterns.push(newPattern);
            }
        });
    }
    
    if (newConfig.keywordCategories) {
        Object.entries(newConfig.keywordCategories).forEach(([category, config]) => {
            if (COMPLEXITY_CONFIG.keywordCategories[category]) {
                // Merge existing category
                COMPLEXITY_CONFIG.keywordCategories[category] = {
                    ...COMPLEXITY_CONFIG.keywordCategories[category],
                    ...config,
                    words: [...(COMPLEXITY_CONFIG.keywordCategories[category].words || []), ...(config.words || [])]
                };
            } else {
                // Add new category
                COMPLEXITY_CONFIG.keywordCategories[category] = config;
            }
        });
    }
    
    if (newConfig.categoryMultipliers) {
        Object.assign(COMPLEXITY_CONFIG.categoryMultipliers, newConfig.categoryMultipliers);
    }
    
    if (newConfig.reductionRules) {
        Object.assign(COMPLEXITY_CONFIG.reductionRules, newConfig.reductionRules);
    }
    
    if (newConfig.timeAdjustments) {
        COMPLEXITY_CONFIG.timeAdjustments = newConfig.timeAdjustments;
    }
    
    Logger.debug('Complexity configuration updated', newConfig);
}

// Export configuration for external access (if needed for testing or configuration)
function getComplexityConfig() {
    return JSON.parse(JSON.stringify(COMPLEXITY_CONFIG)); // Return deep copy
}

// Dynamic complexity analysis configuration
const COMPLEXITY_CONFIG = {
    // Base scoring parameters
    scoring: {
        lengthDivisor: 3,
        maxLengthScore: 25,
        questionMultiplier: 5,
        exclamationMultiplier: 3,
        sentenceMultiplier: 4,
        complexWordMultiplier: 1.5,
        complexWordThreshold: 5,
        minScore: 2,
        maxScore: 80
    },
    
    // Pattern-based detection with dynamic scoring
    patterns: [
        { regex: /write (me )?a/, baseScore: 15, category: "creative", type: "Creative Writing" },
        { regex: /create (me )?a/, baseScore: 15, category: "creative", type: "Creative Request" },
        { regex: /compose a/, baseScore: 15, category: "creative", type: "Composition" },
        { regex: /tell me about/, baseScore: 12, category: "informational", type: "Information Request" },
        { regex: /explain (how|why|what|when|where)/, baseScore: 14, category: "educational", type: "Detailed Explanation" },
        { regex: /how (do|to|can)/, baseScore: 12, category: "instructional", type: "Instructional" },
        { regex: /what (is|are|would|should)/, baseScore: 10, category: "questioning", type: "Definition/Question" },
        { regex: /give me (a|an|some)/, baseScore: 10, category: "requesting", type: "Request" },
        { regex: /show me/, baseScore: 10, category: "demonstrative", type: "Demonstration" },
        { regex: /teach me/, baseScore: 14, category: "educational", type: "Educational" },
        { regex: /help me (with|understand)/, baseScore: 12, category: "assistance", type: "Assistance" },
        { regex: /compare/, baseScore: 13, category: "analytical", type: "Analytical" },
        { regex: /analyze/, baseScore: 13, category: "analytical", type: "Analysis" },
        { regex: /describe/, baseScore: 11, category: "descriptive", type: "Description" },
        { regex: /list|give me examples/, baseScore: 10, category: "listing", type: "Listing" },
        { regex: /recommend/, baseScore: 9, category: "advisory", type: "Recommendation" },
        { regex: /review/, baseScore: 11, category: "evaluative", type: "Review" },
        { regex: /(step by step|tutorial|guide)/, baseScore: 14, category: "tutorial", type: "Tutorial" }
    ],
    
    // Keyword categories with dynamic scoring
    keywordCategories: {
        creative: {
            baseScore: 8,
            words: ['poem', 'story', 'song', 'lyrics', 'novel', 'essay', 'article', 'script',
                   'dialogue', 'character', 'plot', 'narrative', 'creative', 'artistic',
                   'design', 'imagine', 'invent', 'original']
        },
        academic: {
            baseScore: 10,
            words: ['universe', 'philosophy', 'theory', 'concept', 'analysis', 'research',
                   'science', 'physics', 'mathematics', 'history', 'literature', 'psychology',
                   'sociology', 'economics', 'politics', 'biology', 'chemistry', 'astronomy',
                   'quantum', 'relativity', 'evolution', 'consciousness', 'existence']
        },
        complexity: {
            baseScore: 7,
            words: ['explain', 'elaborate', 'detail', 'comprehensive', 'thorough', 'complete',
                   'understand', 'analyze', 'examine', 'explore', 'investigate', 'discuss',
                   'evaluate', 'assess', 'critique', 'interpret', 'synthesize']
        },
        technical: {
            baseScore: 9,
            words: ['algorithm', 'programming', 'software', 'technology', 'computer', 'coding',
                   'development', 'engineering', 'technical', 'implementation', 'architecture',
                   'framework', 'methodology', 'optimization', 'debugging']
        }
    },
    
    // Simple response reducers
    reductionRules: {
        simpleGreetings: {
            penalty: -5,
            words: ['hi', 'hello', 'hey']
        },
        simpleResponses: {
            penalty: -4,
            words: ['yes', 'no', 'ok', 'thanks', 'bye', 'cool', 'nice', 'lol']
        }
    },
    
    // Time-based adjustments
    timeAdjustments: [
        { hourRange: [6, 9], score: 2, description: "Morning energy" },
        { hourRange: [12, 14], score: -1, description: "Afternoon nap" },
        { hourRange: [20, 23], score: 3, description: "Evening activity" },
        { hourRange: [0, 5], score: -3, description: "Night sleepiness" }
    ],
    
    // Category multipliers for dynamic adjustment
    categoryMultipliers: {
        creative: 1.0,
        academic: 1.2,
        technical: 1.1,
        educational: 1.1,
        analytical: 1.15,
        informational: 1.0,
        instructional: 1.05,
        questioning: 0.9,
        requesting: 0.95,
        demonstrative: 1.0,
        assistance: 1.0,
        descriptive: 1.0,
        listing: 0.9,
        advisory: 1.0,
        evaluative: 1.05,
        tutorial: 1.1
    }
};

function analyzePromptComplexity(message) {
    let score = 0;
    const text = message.toLowerCase();
    const config = COMPLEXITY_CONFIG;
    
    const analysisId = Math.random().toString(36).substr(2, 6);
    Logger.debug(`[COMPLEXITY:${analysisId}] Starting analysis`, {
        message: message.length > 50 ? message.substring(0, 50) + '...' : message,
        messageLength: message.length
    });
    
    // Dynamic base score from message length
    const lengthScore = Math.min(text.length / config.scoring.lengthDivisor, config.scoring.maxLengthScore);
    score += lengthScore;
    Logger.debug(`[COMPLEXITY:${analysisId}] Length analysis`, {
        lengthScore: lengthScore.toFixed(1),
        textLength: text.length
    });
    
    // Semantic complexity analysis
    const semanticAnalysis = detectSemanticComplexity(text);
    score += semanticAnalysis.score;
    if (semanticAnalysis.score > 0) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Semantic complexity`, {
            score: semanticAnalysis.score,
            relationships: semanticAnalysis.details.relationshipCount,
            abstract: semanticAnalysis.details.abstractCount,
            quantitative: semanticAnalysis.details.quantitativeCount
        });
    }
    
    // Structural complexity analysis
    const structuralAnalysis = analyzeTextStructure(text);
    score += structuralAnalysis.score;
    if (structuralAnalysis.score > 0) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Structural complexity`, {
            score: structuralAnalysis.score.toFixed(1),
            commas: structuralAnalysis.details.commaCount,
            semicolons: structuralAnalysis.details.semicolonCount,
            colons: structuralAnalysis.details.colonCount
        });
    }
    
    // Dynamic pattern-based detection
    let patternScore = 0;
    const matchedCategories = new Set();
    const patternMatches = [];
    
    config.patterns.forEach(pattern => {
        if (pattern.regex.test(text)) {
            const categoryMultiplier = config.categoryMultipliers[pattern.category] || 1.0;
            const adjustedScore = Math.round(pattern.baseScore * categoryMultiplier);
            patternScore += adjustedScore;
            matchedCategories.add(pattern.category);
            patternMatches.push({
                type: pattern.type,
                score: adjustedScore,
                baseScore: pattern.baseScore,
                multiplier: categoryMultiplier.toFixed(2)
            });
        }
    });
    
    if (patternMatches.length > 0) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Pattern matches`, {
            totalPatternScore: patternScore,
            matches: patternMatches
        });
    }
    
    // Category combination bonus
    const categoryBonus = calculateDynamicCategoryBonus(matchedCategories, config.categoryMultipliers);
    if (categoryBonus > 0) {
        patternScore += categoryBonus;
        Logger.debug(`[COMPLEXITY:${analysisId}] Category combination bonus`, {
            bonus: categoryBonus,
            categoriesCount: matchedCategories.size,
            categories: Array.from(matchedCategories)
        });
    }
    
    score += patternScore;
    
    // Dynamic keyword scoring with category awareness
    let keywordScore = 0;
    const keywordMatches = {};
    const keywordResults = [];
    
    Object.entries(config.keywordCategories).forEach(([category, categoryConfig]) => {
        keywordMatches[category] = [];
        categoryConfig.words.forEach(keyword => {
            if (text.includes(keyword)) {
                keywordMatches[category].push(keyword);
            }
        });
        
        if (keywordMatches[category].length > 0) {
            // Apply diminishing returns for multiple keywords in same category
            const categoryMultiplier = config.categoryMultipliers[category] || 1.0;
            const diminishingFactor = Math.min(1.0, 1.0 / Math.sqrt(keywordMatches[category].length));
            const totalKeywords = keywordMatches[category].length;
            const adjustedScore = Math.round(categoryConfig.baseScore * categoryMultiplier * totalKeywords * diminishingFactor);
            
            keywordScore += adjustedScore;
            keywordResults.push({
                category: category,
                keywords: keywordMatches[category],
                count: totalKeywords,
                score: adjustedScore,
                diminishingFactor: diminishingFactor.toFixed(2)
            });
        }
    });
    
    if (keywordResults.length > 0) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Keyword analysis`, {
            totalKeywordScore: keywordScore,
            categoryMatches: keywordResults
        });
    }
    
    // Dynamic punctuation scoring
    const questionMarks = (text.match(/\?/g) || []).length;
    const questionScore = questionMarks * config.scoring.questionMultiplier;
    score += questionScore;
    
    const exclamationMarks = (text.match(/!/g) || []).length;
    const excitationScore = exclamationMarks * config.scoring.exclamationMultiplier;
    score += excitationScore;
    
    Logger.debug(`[COMPLEXITY:${analysisId}] Punctuation analysis`, {
        questionScore: questionScore,
        questionMarks: questionMarks,
        excitationScore: excitationScore,
        exclamationMarks: exclamationMarks
    });
    
    // Dynamic sentence complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const sentenceScore = Math.max(0, (sentences - 1) * config.scoring.sentenceMultiplier);
    score += sentenceScore;
    
    // Dynamic word complexity analysis
    const words = text.split(/\s+/);
    const complexWords = words.filter(word => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        return cleanWord.length > config.scoring.complexWordThreshold;
    }).length;
    const complexWordScore = complexWords * config.scoring.complexWordMultiplier;
    score += complexWordScore;
    
    Logger.debug(`[COMPLEXITY:${analysisId}] Text structure analysis`, {
        sentenceScore: sentenceScore,
        sentenceCount: sentences,
        complexWordScore: complexWordScore.toFixed(1),
        complexWordCount: complexWords
    });
    
    // Dynamic reduction scoring
    let reductionScore = 0;
    const reductionMatches = [];
    Object.entries(config.reductionRules).forEach(([ruleName, rule]) => {
        rule.words.forEach(word => {
            if (text === word || text === word + '!') {
                reductionScore += rule.penalty;
                reductionMatches.push({
                    rule: ruleName,
                    word: word,
                    penalty: rule.penalty
                });
            }
        });
    });
    
    score += keywordScore + reductionScore;
    
    if (reductionMatches.length > 0) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Reduction analysis`, {
            totalReduction: reductionScore,
            matches: reductionMatches
        });
    }
    
    // Dynamic time-based adjustment
    const hour = new Date().getHours();
    let timeScore = 0;
    let timeAdjustment = null;
    config.timeAdjustments.forEach(adjustment => {
        const [start, end] = adjustment.hourRange;
        if ((start <= end && hour >= start && hour <= end) || 
            (start > end && (hour >= start || hour <= end))) {
            timeScore = adjustment.score;
            timeAdjustment = adjustment;
        }
    });
    score += timeScore;
    
    if (timeAdjustment) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Time-based adjustment`, {
            timeScore: timeScore,
            currentHour: hour,
            description: timeAdjustment.description
        });
    }
    
    // Adaptive scoring adjustment
    const categoryContext = Array.from(matchedCategories);
    const adaptiveScore = adaptiveScoring(score, text.length, categoryContext);
    if (adaptiveScore !== score) {
        Logger.debug(`[COMPLEXITY:${analysisId}] Adaptive adjustment`, {
            originalScore: score,
            adaptiveScore: adaptiveScore,
            textLength: text.length,
            categories: categoryContext
        });
        score = adaptiveScore;
    }
    
    // Apply final constraints
    const finalScore = Math.max(config.scoring.minScore, Math.min(config.scoring.maxScore, Math.round(score)));
    
    Logger.debug(`[COMPLEXITY:${analysisId}] Final result`, {
        finalScore: finalScore,
        breakdown: {
            length: lengthScore.toFixed(1),
            semantic: semanticAnalysis.score,
            structural: structuralAnalysis.score.toFixed(1),
            patterns: patternScore,
            keywords: keywordScore,
            punctuation: questionScore + excitationScore,
            sentences: sentenceScore,
            complexWords: complexWordScore.toFixed(1),
            reductions: reductionScore,
            timeAdjustment: timeScore,
            adaptive: adaptiveScore !== score ? `${score} → ${adaptiveScore}` : 'none'
        }
    });
    
    return finalScore;
}

function calculateMeowCount(complexity) {
    Logger.debug(`Calculating meow count for complexity: ${complexity}`);
    
    // Extended mapping with ~2x longer responses: complexity (2-80) to meow count (2-120)
    let meowCount;
    let range;
    
    if (complexity <= 6) {
        meowCount = Math.floor(Math.random() * 4) + 2; // 2-5 meows (very short)
        range = 'Very short response range (2-5 meows)';
    } else if (complexity <= 12) {
        meowCount = Math.floor(Math.random() * 6) + 5; // 5-10 meows (short)
        range = 'Short response range (5-10 meows)';
    } else if (complexity <= 20) {
        meowCount = Math.floor(Math.random() * 10) + 10; // 10-19 meows (medium-short)
        range = 'Medium-short response range (10-19 meows)';
    } else if (complexity <= 30) {
        meowCount = Math.floor(Math.random() * 15) + 20; // 20-34 meows (medium)
        range = 'Medium response range (20-34 meows)';
    } else if (complexity <= 45) {
        meowCount = Math.floor(Math.random() * 20) + 30; // 30-49 meows (long)
        range = 'Long response range (30-49 meows)';
    } else if (complexity <= 60) {
        meowCount = Math.floor(Math.random() * 25) + 45; // 45-69 meows (very long)
        range = 'Very long response range (45-69 meows)';
    } else {
        meowCount = Math.floor(Math.random() * 35) + 60; // 60-94 meows (extremely long)
        range = 'Extremely long response range (60-94 meows)';
    }
    
    Logger.debug(`Generated meow count: ${meowCount} (${range})`);
    return meowCount;
}

// Simplified Sentiment Analysis using Natural.js
function analyzeSentimentWithNatural(text) {
    const startTime = Date.now();
    
    // Use Natural's simple sentiment analysis approach
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Calculate sentiment using a simple word-based approach with Natural's tools
    let sentimentScore = 0;
    let analyzedWords = 0;
    
    // Basic positive/negative word lists that work well with Natural
    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'like', 'happy', 'wonderful', 'excellent', 'fantastic', 'perfect', 'beautiful', 'nice', 'cute', 'adorable', 'sweet', 'fun', 'exciting', 'brilliant', 'superb', 'hey', 'hi', 'hello'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disgusting', 'stupid', 'annoying', 'boring', 'sad', 'angry', 'frustrated', 'disappointed', 'upset', 'worried', 'stressed', 'mean', 'rude', 'nasty', 'pathetic'];
    
    tokens.forEach(token => {
        const stemmed = natural.PorterStemmer.stem(token);
        const originalToken = token;
        
        if (positiveWords.includes(originalToken) || positiveWords.includes(stemmed)) {
            sentimentScore += 1;
            analyzedWords++;
        } else if (negativeWords.includes(originalToken) || negativeWords.includes(stemmed)) {
            sentimentScore -= 1;
            analyzedWords++;
        }
    });
    
    // Normalize score based on word count (this is Natural.js's pure output)
    const naturalScore = analyzedWords > 0 ? sentimentScore / analyzedWords : 0;
    
    // Determine sentiment category and intensity based purely on Natural.js score
    let sentiment, intensity;
    const absScore = Math.abs(naturalScore);
    
    if (naturalScore > 0.05) {
        sentiment = 'positive';
        if (absScore > 0.6) intensity = 'extreme';
        else if (absScore > 0.35) intensity = 'high';
        else if (absScore > 0.15) intensity = 'moderate';
        else intensity = 'low';
    } else if (naturalScore < -0.05) {
        sentiment = 'negative';
        if (absScore > 0.6) intensity = 'extreme';
        else if (absScore > 0.35) intensity = 'high';
        else if (absScore > 0.15) intensity = 'moderate';
        else intensity = 'low';
    } else {
        sentiment = 'neutral';
        intensity = 'none';
    }
    
    const analysisTime = Date.now() - startTime;
    
    const result = {
        sentiment: sentiment,
        intensity: intensity,
        score: naturalScore,
        tokensAnalyzed: tokens.length,
        wordsAnalyzed: analyzedWords,
        analysisMethod: 'natural-pure',
        processingTime: analysisTime
    };
    
    Logger.debug(`[SENTIMENT-NATURAL] Analysis complete`, {
        message: text.length > 50 ? text.substring(0, 50) + '...' : text,
        messageLength: text.length,
        sentiment: sentiment,
        intensity: intensity,
        score: naturalScore.toFixed(3),
        tokensAnalyzed: tokens.length,
        wordsAnalyzed: analyzedWords,
        processingTime: `${analysisTime}ms`
    });
    
    return result;
}

// Main sentiment analysis function with fallback
function analyzeSentiment(text) {
    try {
        // Try using Natural.js first (more accurate)
        return analyzeSentimentWithNatural(text);
    } catch (error) {
        Logger.warn(`[SENTIMENT] Natural.js analysis failed, using fallback`, {
            error: error.message,
            text: text.length > 30 ? text.substring(0, 30) + '...' : text
        });
        
        // Fallback to original lexicon-based method
        return analyzeSentimentFallback(text);
    }
}

// Fallback sentiment analysis (original lexicon-based method)
function analyzeSentimentFallback(text) {
    const normalizedText = text.toLowerCase();
    
    // Sentiment lexicon with intensity weights
    const sentimentWords = {
        // Extremely positive (weight: 3)
        extremely_positive: {
            words: ['amazing', 'fantastic', 'incredible', 'wonderful', 'brilliant', 'outstanding', 'perfect', 'excellent', 'spectacular', 'marvelous', 'fabulous', 'superb', 'magnificent', 'extraordinary', 'phenomenal'],
            weight: 3
        },
        // Very positive (weight: 2)
        very_positive: {
            words: ['great', 'awesome', 'lovely', 'beautiful', 'exciting', 'excited', 'thrilled', 'delighted', 'overjoyed', 'ecstatic', 'elated', 'jubilant', 'euphoric', 'blissful'],
            weight: 2
        },
        // Positive (weight: 1)
        positive: {
            words: ['good', 'nice', 'happy', 'glad', 'pleased', 'content', 'satisfied', 'cheerful', 'joyful', 'optimistic', 'positive', 'comfortable', 'relaxed', 'calm', 'peaceful', 'cute', 'adorable', 'sweet', 'fun', 'enjoyable', 'pleasant', 'love', 'like', 'appreciate', 'thank', 'thanks'],
            weight: 1
        },
        // Negative (weight: -1)
        negative: {
            words: ['bad', 'sad', 'upset', 'disappointed', 'worried', 'concerned', 'frustrated', 'annoyed', 'bored', 'tired', 'exhausted', 'stressed', 'anxious', 'nervous', 'uncomfortable', 'dislike', 'hate', 'angry', 'mad', 'irritated', 'mean', 'rude', 'nasty', 'stupid', 'dumb', 'annoying', 'sucks', 'lame', 'boring', 'pathetic'],
            weight: -1
        },
        // Very negative (weight: -2)
        very_negative: {
            words: ['terrible', 'horrible', 'awful', 'disgusting', 'devastating', 'heartbroken', 'miserable', 'depressed', 'furious', 'enraged', 'livid', 'outraged', 'disgusted', 'appalled', 'hate', 'despise', 'loathe', 'hideous', 'repulsive', 'vile', 'toxic', 'worthless', 'useless', 'garbage'],
            weight: -2
        },
        // Extremely negative (weight: -3)
        extremely_negative: {
            words: ['devastating', 'catastrophic', 'disastrous', 'abysmal', 'atrocious', 'horrendous', 'nightmarish', 'unbearable', 'excruciating', 'agonizing', 'abhorrent', 'detestable', 'revolting', 'monstrous', 'evil', 'hellish', 'diabolic'],
            weight: -3
        }
    };
    
    // Intensity modifiers
    const intensifiers = {
        very: 1.5,
        really: 1.4,
        extremely: 2.0,
        incredibly: 1.8,
        absolutely: 1.7,
        totally: 1.6,
        completely: 1.8,
        quite: 1.2,
        rather: 1.1,
        somewhat: 0.8,
        slightly: 0.6,
        barely: 0.4,
        hardly: 0.3
    };
    
    // Negation words
    const negationWords = ['not', 'no', 'never', 'nothing', 'nowhere', 'nobody', 'none', 'neither', 'nor', 'cannot', "can't", "won't", "shouldn't", "wouldn't", "couldn't", "doesn't", "don't", "isn't", "aren't", "wasn't", "weren't"];
    
    let sentimentScore = 0;
    let wordCount = 0;
    let matchedWords = [];
    
    const words = normalizedText.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation
        let currentWordSentiment = 0;
        let matchedCategory = null;
        
        // Check sentiment words
        for (const [category, config] of Object.entries(sentimentWords)) {
            if (config.words.includes(word)) {
                currentWordSentiment = config.weight;
                matchedCategory = category;
                break;
            }
        }
        
        if (currentWordSentiment !== 0) {
            // Check for intensifiers before this word
            let intensifierMultiplier = 1.0;
            if (i > 0) {
                const prevWord = words[i - 1].replace(/[^\w]/g, '');
                if (intensifiers[prevWord]) {
                    intensifierMultiplier = intensifiers[prevWord];
                }
            }
            
            // Check for negation in the previous 3 words
            let isNegated = false;
            for (let j = Math.max(0, i - 3); j < i; j++) {
                const prevWord = words[j].replace(/[^\w]/g, '');
                if (negationWords.includes(prevWord)) {
                    isNegated = true;
                    break;
                }
            }
            
            // Apply modifiers
            let finalSentiment = currentWordSentiment * intensifierMultiplier;
            if (isNegated) {
                finalSentiment *= -1; // Flip sentiment if negated
            }
            
            sentimentScore += finalSentiment;
            wordCount++;
            
            matchedWords.push({
                word: word,
                category: matchedCategory,
                baseScore: currentWordSentiment,
                intensifier: intensifierMultiplier,
                negated: isNegated,
                finalScore: finalSentiment
            });
        }
    }
    
    // Calculate contextual sentiment based on punctuation and structure
    let contextualBonus = 0;
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const capsWords = (text.match(/[A-Z]{2,}/g) || []).length;
    
    // Moderate exclamation mark amplification - toned down from extreme
    if (exclamationCount > 0) {
        // Multiple exclamations indicate strong emotion, but not as extreme
        let exclamationBonus = exclamationCount * (sentimentScore > 0 ? 0.8 : -0.6);
        // Extra bonus for multiple exclamations, but reduced
        if (exclamationCount >= 3) {
            exclamationBonus *= 1.3; // Reduced from 2.0
        }
        contextualBonus += exclamationBonus;
    }
    
    // ALL CAPS indicates strong emotion - reduced sensitivity
    if (capsWords > 0) {
        let capsBonus = capsWords * (sentimentScore > 0 ? 0.5 : -0.4);
        // If the entire message is caps, it's strong but not extreme
        const totalWords = words.length;
        if (capsWords >= totalWords * 0.7) { // 70% or more words are caps
            capsBonus *= 1.5; // Reduced from 2.5
        }
        contextualBonus += capsBonus;
    }
    
    // Additional context: repeated letters (like "sooooo" or "reallyyy") - reduced impact
    const repeatedLetterPattern = /([a-z])\1{2,}/gi;
    const repeatedLetters = (text.match(repeatedLetterPattern) || []).length;
    if (repeatedLetters > 0) {
        contextualBonus += repeatedLetters * (sentimentScore > 0 ? 0.4 : -0.3); // Reduced from 0.8/-0.6
    }
    
    sentimentScore += contextualBonus;
    
    // Normalize sentiment score (-1 to 1 range) - balanced normalization
    const maxPossibleScore = Math.max(words.length * 2.5, 5); // Slightly higher baseline
    const normalizedScore = Math.max(-1, Math.min(1, sentimentScore / maxPossibleScore));
    
    // Determine sentiment category and intensity - balanced thresholds
    let sentiment, intensity;
    const absScore = Math.abs(normalizedScore);
    
    if (normalizedScore > 0.08) { // Slightly higher than very reactive
        sentiment = 'positive';
        if (absScore > 0.55) intensity = 'extreme';      // Raised from 0.35 
        else if (absScore > 0.30) intensity = 'high';     // Raised from 0.20
        else if (absScore > 0.15) intensity = 'moderate'; // Raised from 0.10
        else intensity = 'low';
    } else if (normalizedScore < -0.08) { // Slightly higher than very reactive
        sentiment = 'negative';
        if (absScore > 0.55) intensity = 'extreme';      // Raised from 0.35
        else if (absScore > 0.30) intensity = 'high';     // Raised from 0.20
        else if (absScore > 0.15) intensity = 'moderate'; // Raised from 0.10
        else intensity = 'low';
    } else {
        sentiment = 'neutral';
        intensity = 'none';
    }
    
    const result = {
        sentiment: sentiment,
        intensity: intensity,
        score: normalizedScore,
        rawScore: sentimentScore,
        wordsAnalyzed: wordCount,
        matchedWords: matchedWords,
        contextualFactors: {
            exclamationMarks: exclamationCount,
            questionMarks: questionCount,
            capsWords: capsWords,
            repeatedLetters: repeatedLetters,
            contextualBonus: contextualBonus
        }
    };
    
    Logger.debug(`[SENTIMENT] Analysis complete`, {
        message: text.length > 50 ? text.substring(0, 50) + '...' : text,
        messageLength: text.length,
        totalWordsProcessed: words.length,
        sentiment: sentiment,
        intensity: intensity,
        score: normalizedScore.toFixed(3),
        wordsAnalyzed: wordCount,
        keyWords: matchedWords.length > 0 ? matchedWords.map(w => `${w.word}(${w.finalScore.toFixed(1)})`).join(', ') : 'none',
        contextual: {
            exclamations: exclamationCount,
            questions: questionCount,
            caps: capsWords,
            bonus: contextualBonus.toFixed(1)
        }
    });
    
    return result;
}

// Calculate emoticon probability based on sentiment
function calculateEmoticonProbability(sentimentData) {
    const baseProbability = 0.2; // 20% base chance
    
    // Intensity multipliers - more balanced
    const intensityMultipliers = {
        'none': 1.0,
        'low': 1.1,      // Reduced from 1.2
        'moderate': 1.25, // Reduced from 1.5
        'high': 1.6,     // Reduced from 2.0
        'extreme': 2.2   // Reduced from 3.0
    };
    
    // Sentiment type multipliers
    let sentimentMultiplier = 1.0;
    if (sentimentData.sentiment === 'positive' || sentimentData.sentiment === 'negative') {
        sentimentMultiplier = 1.5; // Emotional content gets more emoticons
    }
    
    const intensityMultiplier = intensityMultipliers[sentimentData.intensity] || 1.0;
    const finalProbability = Math.min(0.8, baseProbability * sentimentMultiplier * intensityMultiplier);
    
    Logger.debug(`[EMOTICON] Probability calculated`, {
        sentiment: sentimentData.sentiment,
        intensity: sentimentData.intensity,
        baseProbability: baseProbability,
        sentimentMultiplier: sentimentMultiplier,
        intensityMultiplier: intensityMultiplier,
        finalProbability: finalProbability.toFixed(2)
    });
    
    return finalProbability;
}

function generateMeowVariations(message, count, clientTime = null) {
    const text = message.toLowerCase();
    
    // Analyze sentiment for emoticon probability calculation
    const sentimentData = analyzeSentiment(message);
    const emoticonProbability = calculateEmoticonProbability(sentimentData);
    
    const catSoundsWithContext = [];
    
    // Check if it's night time using client's local time (or fallback to server time)
    const isCurrentlyNightTime = clientTime ? isNightTimeForClient(clientTime) : isNightTime();
    const hasExplicitSleepWords = text.includes('tired') || text.includes('sleep') || text.includes('nap');
    const shouldBeSleepy = hasExplicitSleepWords || (isCurrentlyNightTime && Math.random() < 0.25); // 25% chance at night
    
    // Log time information for debugging
    if (clientTime) {
        Logger.debug(`[TIME] Using client time for sleepy detection`, {
            clientHour: clientTime.hour,
            clientTimezone: clientTime.timezone,
            isNightTime: isCurrentlyNightTime,
            shouldBeSleepy: shouldBeSleepy,
            hasExplicitSleepWords: hasExplicitSleepWords
        });
    } else {
        Logger.debug(`[TIME] Using server time for sleepy detection (client time not provided)`, {
            serverHour: new Date().getHours(),
            isNightTime: isCurrentlyNightTime,
            shouldBeSleepy: shouldBeSleepy
        });
    }
    
    // Expanded variety of cat sounds with different emotional contexts
    // Removed most punctuation from individual sounds - will be added at sentence level
    const standardSounds = ['meow', 'mrow', 'mrrow', 'mew', 'miau'];
    const questionSounds = ['meow', 'mrow', 'mrrow', 'mew']; // question context, no punctuation yet
    const excitedSounds = ['MEOW', 'MROW', 'meow', 'mrow', 'MEW']; // excited context, no punctuation yet
    const contentSounds = ['purr', 'purrr', 'mrrrr', 'prrrr'];
    const playfulSounds = ['mrow', 'mrp', 'prr', 'mew', 'mewmew', 'miau'];
    const sadSounds = ['mew', 'meow', 'mrow']; // sad context, no punctuation yet
    const sleepyTiredSounds = ['mrow', 'mrrrr', 'yawn', '*yawn*', 'zzz'];
    const curiousSounds = ['mrow', 'mrrow', 'mew', 'meow', 'miau']; // curious context, no punctuation yet
    const demandingSounds = ['MEOW', 'MROW', 'MEW', 'FEED ME', "OVERTHROW THE GOVERNMENT"]; // demanding context, no punctuation yet
    const affectionateSounds = ['purr', 'mrow', 'meow', 'mrrow'];
    
    // NEW: Defensive and hostile sounds for negative sentiment
    const defensiveSounds = ['hiss', 'spit', 'growl', 'grr', 'mrow', 'mrr'];
    const hostileSounds = ['HISS', 'SPIT', 'GROWL', 'GRR', 'YOWL', '*hiss*', '*spit*'];
    const annoyedSounds = ['meh', 'mrr', 'hmph', 'mrow', 'tch'];
    const warySound = ['mrr', 'mrow', 'hm', 'mew'];
    
    for (let i = 0; i < count; i++) {
        let soundType = standardSounds;
        let context = 'standard';
        
        // Check for forced sleepy mode first (once per message decision)
        if (shouldBeSleepy && Math.random() < 0.2) { // 20% of sounds will be sleepy when in sleepy mode
            soundType = sleepyTiredSounds;
            context = 'sleepy';
        } else {
            // PRIMARY: Use sentiment analysis to determine cat behavior
            if (sentimentData.sentiment === 'negative') {
            // Negative sentiment handling based on intensity
            if (sentimentData.intensity === 'extreme') {
                // Extremely negative - hostile and defensive
                soundType = Math.random() < 0.7 ? hostileSounds : defensiveSounds;
                context = Math.random() < 0.7 ? 'hostile' : 'defensive';
            } else if (sentimentData.intensity === 'high') {
                // High negative - defensive or annoyed
                soundType = Math.random() < 0.6 ? defensiveSounds : annoyedSounds;
                context = Math.random() < 0.6 ? 'defensive' : 'annoyed';
            } else if (sentimentData.intensity === 'moderate') {
                // Moderate negative - annoyed or wary
                soundType = Math.random() < 0.5 ? annoyedSounds : warySound;
                context = Math.random() < 0.5 ? 'annoyed' : 'wary';
            } else {
                // Low negative - just wary or sad
                soundType = Math.random() < 0.6 ? warySound : sadSounds;
                context = Math.random() < 0.6 ? 'wary' : 'sad';
            }
        } else if (sentimentData.sentiment === 'positive') {
            // Positive sentiment handling based on intensity
            if (sentimentData.intensity === 'extreme') {
                // Extremely positive - excited or ecstatic
                soundType = excitedSounds;
                context = 'excited';
            } else if (sentimentData.intensity === 'high') {
                // High positive - excited or affectionate
                soundType = Math.random() < 0.7 ? excitedSounds : affectionateSounds;
                context = Math.random() < 0.7 ? 'excited' : 'affectionate';
            } else if (sentimentData.intensity === 'moderate') {
                // Moderate positive - content or playful
                soundType = Math.random() < 0.5 ? contentSounds : playfulSounds;
                context = Math.random() < 0.5 ? 'content' : 'playful';
            } else {
                // Low positive - content or standard
                soundType = Math.random() < 0.6 ? contentSounds : standardSounds;
                context = Math.random() < 0.6 ? 'content' : 'standard';
            }
        } else {
            // Neutral sentiment - use traditional keyword detection
            if (text.includes('?') && Math.random() < 0.4) {
                soundType = Math.random() < 0.5 ? questionSounds : curiousSounds;
                context = Math.random() < 0.5 ? 'question' : 'curious';
            } else if ((text.includes('tired') || text.includes('sleep') || text.includes('nap')) && Math.random() < 0.4) {
                soundType = sleepyTiredSounds;
                context = 'sleepy';
            } else if ((text.includes('food') || text.includes('hungry') || text.includes('treat') || text.includes('feed')) && Math.random() < 0.4) {
                soundType = demandingSounds;
                context = 'demanding';
            } else if (Math.random() < 0.3) {
                // Random variety for neutral messages
                const neutralVariety = [...playfulSounds, ...contentSounds, ...curiousSounds];
                soundType = neutralVariety;
                context = 'playful';
            }
        }
        }
        
        // Select random sound from the chosen type
        const selectedSound = soundType[Math.floor(Math.random() * soundType.length)];
        catSoundsWithContext.push({ sound: selectedSound, context: context });
    }
    
    return formatCatSoundsIntoSentences(catSoundsWithContext, emoticonProbability, sentimentData);
}

function formatCatSoundsIntoSentences(catSoundsWithContext, emoticonProbability = 0.2, sentimentData = null) {
    // Group cat sounds into sentences with proper punctuation
    const sentences = [];
    let currentSentence = [];
    let sentenceContext = 'standard';
    
    for (let i = 0; i < catSoundsWithContext.length; i++) {
        const { sound, context } = catSoundsWithContext[i];
        currentSentence.push(sound);
        
        // Update sentence context to match strongest emotion
        if (context !== 'standard' && sentenceContext === 'standard') {
            sentenceContext = context;
        }
        
        // Decide when to end a sentence (every 3-6 sounds)
        const sentenceLength = Math.floor(Math.random() * 4) + 3; // 3-6 sounds per sentence
        const isLastSound = i === catSoundsWithContext.length - 1;
        
        if (currentSentence.length >= sentenceLength || isLastSound) {
            // Enhanced cat emoticons organized by context with sentiment variations
            const catEmoticons = {
                standard: [':3', ':>', '=^.^=', '^.^', '~(＾◡＾)~'],
                question: [':3?', ':>?', '=^.^=?', '^.^?', '(・・)?', '(´・ω・`)?'],
                excited: [':3!', 'X3', '=^o^=', '^o^', '>:3', '(＾◡＾)', ':D', '=^_^=!'],
                demanding: ['>:3', '>:(', '=^x^=', '(>_<)', '~(>_<)~', '>:/', '=^o^=!'],
                sad: [':(', ':c', ';-;', '(╥﹏╥)', '=T.T=', ';_;', '(｡•́︿•̀｡)'],
                sleepy: ['=.=', '-.-', '=~.~=', '(-.-)', 'zzz :3', '(－_－) zzZ', '=.= zzz'],
                content: [':3', '=^.^=', '^.^', '(￣▾￣)', '~(＾◡＾)~', '=^ㅇ^=', '(´∀｀)'],
                affectionate: [':3♡', '=^.^=♡', '(◡ ‿ ◡)', '♡~', '(´∀｀)♡', '=^.^=❤'],
                playful: [':3', ':P', 'X3', '=^.^=', '>:3', '^o^', '=^ω^=', '(=^･ｪ･^=)'],
                curious: [':3?', '=^.^=?', '(・・)?', '(´・ω・`)?', '^.^?', '(･_･)?'],
                
                // NEW: Negative sentiment emoticons
                hostile: ['>:(', '>:/', '=`ε´=', '>_<', '=^x^=', '(;¬_¬)', '●~*'],
                defensive: ['=~n~=', '(・_・)', '~_~', '=^.^=;;', '(・・;)', '(-.-;)', '=.=;;'],
                annoyed: ['=.=', '-_-', '¬_¬', '=~=', '(－_－)', '(ーー;)', '=_='],
                wary: ['(・_・)', '(¬_¬)', '=^.^=;', '(；･_･)', '~(>_<)~', '(・・;)']
            };
            
            // Enhanced emoticons for extreme sentiments
            const extremePositiveEmoticons = ['\\(^o^)/', '=^o^=!!!', 'X3!!!', '(＾◡＾)♡♡', ':3', '=^.^=★'];
            const extremeNegativeEmoticons = [
                // Extremely hostile/angry
                '(╬ಠ益ಠ)', '>:((', '=`皿´=', '(＃゜皿゜)', '●~*', '=^x^=!!!',
                // Extremely defensive/scared
                '(╥﹏╥)', '=T.T=', ';_____;', '(｡•́︿•̀｡)', ':(((', '=;_;=',
                // Mixed extreme negative
                '>_<!!!', '=~n~=;;;', '(;¬д¬)', '(ーー;;;;;)'
            ];
            
            // Calculate final emoticon probability with sentiment adjustment
            let finalEmoticonProbability = emoticonProbability;
            
            // Boost probability for extreme sentiments - reduced boost
            if (sentimentData && sentimentData.intensity === 'extreme') {
                finalEmoticonProbability = Math.min(0.80, finalEmoticonProbability * 1.25); // Reduced from 0.85 and 1.5
                Logger.debug(`[EMOTICON] Extreme sentiment boost`, {
                    originalProbability: emoticonProbability.toFixed(2),
                    boostedProbability: finalEmoticonProbability.toFixed(2)
                });
            }
            
            // Use sentiment-based emoticon probability instead of fixed 20%
            let punctuation;
            const useEmoticon = Math.random() < finalEmoticonProbability;
            
            if (useEmoticon && catEmoticons[sentenceContext]) {
                let selectedEmoticons = catEmoticons[sentenceContext];
                
                // Override with extreme emoticons for extreme sentiments
                if (sentimentData && sentimentData.intensity === 'extreme') {
                    if (sentimentData.sentiment === 'positive') {
                        // Mix extreme positive with context-appropriate ones
                        selectedEmoticons = [...extremePositiveEmoticons, ...selectedEmoticons];
                    } else if (sentimentData.sentiment === 'negative') {
                        // Mix extreme negative with context-appropriate ones
                        selectedEmoticons = [...extremeNegativeEmoticons, ...selectedEmoticons];
                    }
                }
                
                // Use cat emoticon for this context
                punctuation = ' ' + selectedEmoticons[Math.floor(Math.random() * selectedEmoticons.length)];
                
                Logger.debug(`[EMOTICON] Selected emoticon`, {
                    emoticon: punctuation.trim(),
                    context: sentenceContext,
                    sentiment: sentimentData ? `${sentimentData.sentiment}/${sentimentData.intensity}` : 'unknown',
                    probability: finalEmoticonProbability.toFixed(2)
                });
            } else {
                // Use regular punctuation
                punctuation = '.';
                if (sentenceContext === 'question' || sentenceContext === 'curious') {
                    punctuation = '?';
                } else if (sentenceContext === 'excited' || sentenceContext === 'demanding') {
                    punctuation = '!';
                } else if (sentenceContext === 'sad' || sentenceContext === 'sleepy') {
                    punctuation = '...';
                }
                
                // Add extra punctuation for extreme sentiments
                if (sentimentData && sentimentData.intensity === 'extreme') {
                    if (sentimentData.sentiment === 'positive' && punctuation === '!') {
                        punctuation = '!!!';
                    } else if (sentimentData.sentiment === 'negative' && punctuation === '...') {
                        punctuation = '......';
                    }
                }
            }
            
            // Join the sentence and add punctuation
            const sentence = currentSentence.join(' ') + punctuation;
            sentences.push(sentence);
            
            // Reset for next sentence
            currentSentence = [];
            sentenceContext = 'standard';
        }
    }
    
    return sentences;
}

function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 22 || hour <= 5;
}

function isNightTimeForClient(clientTime) {
    // Use client's local hour for more accurate night-time detection
    const clientHour = clientTime.hour;
    return clientHour >= 22 || clientHour <= 5;
}

function generateWelcomeMeows() {
    // Generate 5-7 welcome meows using only standard, question, and excited sounds
    const welcomeCount = Math.floor(Math.random() * 3) + 5; // 5-7 meows
    const welcomeSounds = [];
    
    const standardSounds = ['meow', 'mrow', 'mrrow', 'mew', 'miau'];
    const questionSounds = ['meow', 'mrow', 'mrrow', 'mew'];
    const excitedSounds = ['MEOW', 'MROW', 'meow', 'mrow', 'MEW'];
    
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
    
    // Add appropriate punctuation for welcome message
    const welcomeSentence = welcomeSounds.join(' ');
    const finalRand = Math.random();
    return finalRand < 0.75 ? welcomeSentence + '!' : welcomeSentence + '?';
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    const clientInfo = {
        id: socket.id,
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'],
        connectTime: Date.now()
    };
    
    serverStats.totalConnections++;
    serverStats.activeConnections++;
    
    Logger.socket(socket.id, 'CONNECT', 'User connected', {
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        totalConnections: serverStats.totalConnections,
        activeConnections: serverStats.activeConnections
    });
    
    // Generate a unique conversation ID for this session
    const conversationId = Date.now().toString();
    conversations.set(conversationId, []);
    
    Logger.socket(socket.id, 'SESSION', `New conversation created: ${conversationId}`);
    
    socket.emit('conversation-id', conversationId);
    
    // Send welcome meows for the subtitle
    const welcomeMeows = generateWelcomeMeows();
    Logger.socket(socket.id, 'WELCOME', `Sending welcome meows: "${welcomeMeows}"`);
    socket.emit('welcome-meows', welcomeMeows);
    
    socket.on('send-message', async (data) => {
        const messageStartTime = Date.now();
        const { message, conversationId, clientTime } = data;
        
        serverStats.totalMessages++;
        
        Logger.socket(socket.id, 'MESSAGE', `Received message (${message.length} chars)`, {
            conversationId,
            messagePreview: message.length > 50 ? message.substring(0, 50) + '...' : message,
            messageLength: message.length,
            totalMessages: serverStats.totalMessages,
            clientTime: clientTime ? {
                hour: clientTime.hour,
                timezone: clientTime.timezone,
                localTime: clientTime.timestamp
            } : 'not provided'
        });
        
        // Store user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        if (conversations.has(conversationId)) {
            conversations.get(conversationId).push(userMessage);
            Logger.socket(socket.id, 'STORE', `User message stored in conversation ${conversationId}`, {
                conversationLength: conversations.get(conversationId).length
            });
        } else {
            Logger.socket(socket.id, 'ERROR', `Conversation ${conversationId} not found`);
        }
        
        // Send user message back to client
        socket.emit('user-message', userMessage);
        Logger.socket(socket.id, 'EMIT', 'User message echoed to client');
        
        // Analyze the complexity to determine streaming speed
        const complexityStartTime = Date.now();
        const complexity = analyzePromptComplexity(message);
        const complexityDuration = Date.now() - complexityStartTime;
        
        Logger.socket(socket.id, 'ANALYSIS', `Complexity analysis completed`, {
            complexity,
            analysisTime: `${complexityDuration}ms`
        });
        
        // Generate contextual cat sound response based on user input
        const generationStartTime = Date.now();
        const catSentences = generateMeowResponse(message, clientTime);
        const generationDuration = Date.now() - generationStartTime;
        
        // Split sentences into individual words for streaming
        const words = catSentences.join(' ').split(' ');
        
        Logger.socket(socket.id, 'GENERATION', `Cat response generated`, {
            sentences: catSentences.length,
            totalWords: words.length,
            generationTime: `${generationDuration}ms`,
            responsePreview: words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '')
        });
        
        // Create AI message object
        const aiMessage = {
            type: 'ai',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };
        
        // Start streaming response
        socket.emit('ai-message-start', aiMessage);
        Logger.socket(socket.id, 'STREAM', 'Started streaming response');
        
        const streamingStartTime = Date.now();
        let totalStreamingDelay = 0;
        
        // Simulate realistic tokenizer behavior with variable delays
        for (let i = 0; i < words.length; i++) {
            // Calculate delay based on tokenizer-like behavior
            let delay = calculateTokenizerDelay(words[i], i, words.length, complexity);
            totalStreamingDelay += delay;
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            aiMessage.content += (i > 0 ? ' ' : '') + words[i];
            socket.emit('ai-message-chunk', {
                content: aiMessage.content,
                isComplete: i === words.length - 1
            });
            
            // Log progress every 10 words or at the end
            if (i % 10 === 0 || i === words.length - 1) {
                Logger.socket(socket.id, 'CHUNK', `Streaming progress: ${i + 1}/${words.length} words`);
            }
        }
        
        const streamingDuration = Date.now() - streamingStartTime;
        
        // Finalize the message
        aiMessage.isStreaming = false;
        if (conversations.has(conversationId)) {
            conversations.get(conversationId).push(aiMessage);
        }
        
        socket.emit('ai-message-complete', aiMessage);
        
        const totalResponseTime = Date.now() - messageStartTime;
        serverStats.totalResponses++;
        serverStats.addResponseTime(totalResponseTime);
        
        Logger.socket(socket.id, 'COMPLETE', `Response completed`, {
            totalResponseTime: `${totalResponseTime}ms`,
            streamingTime: `${streamingDuration}ms`,
            totalStreamingDelay: `${totalStreamingDelay}ms`,
            wordsStreamed: words.length,
            avgWordDelay: `${(totalStreamingDelay / words.length).toFixed(1)}ms`,
            totalResponses: serverStats.totalResponses,
            avgResponseTime: `${serverStats.averageResponseTime.toFixed(2)}ms`
        });
    });
    
    socket.on('get-conversation', (conversationId) => {
        Logger.socket(socket.id, 'REQUEST', `Conversation history requested: ${conversationId}`);
        
        if (conversations.has(conversationId)) {
            const conversation = conversations.get(conversationId);
            socket.emit('conversation-history', conversation);
            Logger.socket(socket.id, 'HISTORY', `Sent conversation history`, {
                conversationId,
                messageCount: conversation.length
            });
        } else {
            Logger.socket(socket.id, 'ERROR', `Conversation ${conversationId} not found for history request`);
        }
    });
    
    socket.on('request-welcome-meows', () => {
        Logger.socket(socket.id, 'REQUEST', 'Welcome meows requested');
        const welcomeMeows = generateWelcomeMeows();
        socket.emit('welcome-meows', welcomeMeows);
        Logger.socket(socket.id, 'WELCOME', `New welcome meows sent: "${welcomeMeows}"`);
    });
    
    socket.on('disconnect', (reason) => {
        const sessionDuration = Date.now() - clientInfo.connectTime;
        serverStats.activeConnections--;
        
        Logger.socket(socket.id, 'DISCONNECT', `User disconnected: ${reason}`, {
            sessionDuration: `${(sessionDuration / 1000).toFixed(1)}s`,
            activeConnections: serverStats.activeConnections,
            ip: clientInfo.ip
        });
    });
    
    socket.on('error', (error) => {
        Logger.socket(socket.id, 'ERROR', `Socket error occurred`, error);
    });
});

const PORT = process.env.PORT || 7342;

// Enhanced server startup with detailed logging
server.listen(PORT, () => {
    Logger.info(`CatGPT server starting up...`);
    Logger.info(`Server listening on port ${PORT}`);
    Logger.info(`Server URL: http://localhost:${PORT}`);
    Logger.info(`Node.js version: ${process.version}`);
    Logger.info(`Platform: ${process.platform} ${process.arch}`);
    Logger.info(`Memory usage:`, process.memoryUsage());
    Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    Logger.info(`🐱 CatGPT server ready to meow! 🐱`);
    
    // Log server stats every 5 minutes
    setInterval(() => {
        Logger.info(`📊 Server Statistics:`, serverStats.getStats());
    }, 5 * 60 * 1000); // 5 minutes
});

// Graceful shutdown handling
let isShuttingDown = false;

function gracefulShutdown(signal) {
    if (isShuttingDown) {
        Logger.warn(`${signal} received again, forcing exit...`);
        process.exit(1);
    }
    
    isShuttingDown = true;
    Logger.info(`${signal} received, shutting down gracefully...`);
    
    // Set a timeout to force exit if graceful shutdown takes too long
    const forceExitTimeout = setTimeout(() => {
        Logger.error('Graceful shutdown timed out, forcing exit...');
        process.exit(1);
    }, 5000); // 5 seconds timeout
    
    server.close((err) => {
        clearTimeout(forceExitTimeout);
        if (err) {
            Logger.error('Error during server shutdown:', err);
            process.exit(1);
        }
        Logger.info('Server closed successfully');
        process.exit(0);
    });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Error handling
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Express error handling middleware
app.use((error, req, res, next) => {
    Logger.error('Express error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    Logger.warn(`404 Not Found: ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json({ error: 'Not found' });
});