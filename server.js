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
    
    console.log('Complexity configuration updated');
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
    
    console.log(`\n=== Analyzing: "${message}" ===`);
    
    // Dynamic base score from message length
    const lengthScore = Math.min(text.length / config.scoring.lengthDivisor, config.scoring.maxLengthScore);
    score += lengthScore;
    console.log(`Length score: ${lengthScore.toFixed(1)} (length: ${text.length})`);
    
    // Semantic complexity analysis
    const semanticAnalysis = detectSemanticComplexity(text);
    score += semanticAnalysis.score;
    if (semanticAnalysis.score > 0) {
        console.log(`Semantic complexity: +${semanticAnalysis.score} (relationships: ${semanticAnalysis.details.relationshipCount}, abstract: ${semanticAnalysis.details.abstractCount}, quantitative: ${semanticAnalysis.details.quantitativeCount})`);
    }
    
    // Structural complexity analysis
    const structuralAnalysis = analyzeTextStructure(text);
    score += structuralAnalysis.score;
    if (structuralAnalysis.score > 0) {
        console.log(`Structural complexity: +${structuralAnalysis.score.toFixed(1)} (commas: ${structuralAnalysis.details.commaCount}, semicolons: ${structuralAnalysis.details.semicolonCount}, colons: ${structuralAnalysis.details.colonCount})`);
    }
    
    // Dynamic pattern-based detection
    let patternScore = 0;
    const matchedCategories = new Set();
    
    config.patterns.forEach(pattern => {
        if (pattern.regex.test(text)) {
            const categoryMultiplier = config.categoryMultipliers[pattern.category] || 1.0;
            const adjustedScore = Math.round(pattern.baseScore * categoryMultiplier);
            patternScore += adjustedScore;
            matchedCategories.add(pattern.category);
            console.log(`Pattern match: ${pattern.type} (+${adjustedScore}, base: ${pattern.baseScore}, multiplier: ${categoryMultiplier.toFixed(2)})`);
        }
    });
    
    // Category combination bonus
    const categoryBonus = calculateDynamicCategoryBonus(matchedCategories, config.categoryMultipliers);
    if (categoryBonus > 0) {
        patternScore += categoryBonus;
        console.log(`Category combination bonus: +${categoryBonus} (${matchedCategories.size} categories)`);
    }
    
    score += patternScore;
    
    // Dynamic keyword scoring with category awareness
    let keywordScore = 0;
    const keywordMatches = {};
    
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
            console.log(`${category} keywords (${totalKeywords}): ${keywordMatches[category].join(', ')} (+${adjustedScore}, diminishing: ${diminishingFactor.toFixed(2)})`);
        }
    });
    
    // Dynamic punctuation scoring
    const questionMarks = (text.match(/\?/g) || []).length;
    const questionScore = questionMarks * config.scoring.questionMultiplier;
    score += questionScore;
    console.log(`Question score: ${questionScore} (${questionMarks} question marks)`);
    
    const exclamationMarks = (text.match(/!/g) || []).length;
    const excitationScore = exclamationMarks * config.scoring.exclamationMultiplier;
    score += excitationScore;
    console.log(`Excitation score: ${excitationScore} (${exclamationMarks} exclamation marks)`);
    
    // Dynamic sentence complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const sentenceScore = Math.max(0, (sentences - 1) * config.scoring.sentenceMultiplier);
    score += sentenceScore;
    console.log(`Sentence score: ${sentenceScore} (${sentences} sentences)`);
    
    // Dynamic word complexity analysis
    const words = text.split(/\s+/);
    const complexWords = words.filter(word => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        return cleanWord.length > config.scoring.complexWordThreshold;
    }).length;
    const complexWordScore = complexWords * config.scoring.complexWordMultiplier;
    score += complexWordScore;
    console.log(`Complex words score: ${complexWordScore.toFixed(1)} (${complexWords} complex words)`);
    
    // Dynamic reduction scoring
    let reductionScore = 0;
    Object.entries(config.reductionRules).forEach(([ruleName, rule]) => {
        rule.words.forEach(word => {
            if (text === word || text === word + '!') {
                reductionScore += rule.penalty;
                console.log(`${ruleName}: "${word}" (${rule.penalty})`);
            }
        });
    });
    
    score += keywordScore + reductionScore;
    console.log(`Keyword score: ${keywordScore}, Reduction score: ${reductionScore}`);
    
    // Dynamic time-based adjustment
    const hour = new Date().getHours();
    let timeScore = 0;
    config.timeAdjustments.forEach(adjustment => {
        const [start, end] = adjustment.hourRange;
        if ((start <= end && hour >= start && hour <= end) || 
            (start > end && (hour >= start || hour <= end))) {
            timeScore = adjustment.score;
            console.log(`Time-based score: ${timeScore} (hour: ${hour}, ${adjustment.description})`);
        }
    });
    score += timeScore;
    
    // Adaptive scoring adjustment
    const categoryContext = Array.from(matchedCategories);
    const adaptiveScore = adaptiveScoring(score, text.length, categoryContext);
    if (adaptiveScore !== score) {
        console.log(`Adaptive adjustment: ${score} -> ${adaptiveScore} (length: ${text.length}, categories: ${categoryContext.join(', ')})`);
        score = adaptiveScore;
    }
    
    // Apply final constraints
    const finalScore = Math.max(config.scoring.minScore, Math.min(config.scoring.maxScore, Math.round(score)));
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
    const catSoundsWithContext = [];
    
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
    
    for (let i = 0; i < count; i++) {
        let soundType = standardSounds;
        let context = 'standard';
        
        // Choose sound type based on message analysis and context
        if (text.includes('?') && Math.random() < 0.4) {
            soundType = Math.random() < 0.5 ? questionSounds : curiousSounds;
            context = Math.random() < 0.5 ? 'question' : 'curious';
        } else if ((text.includes('!') || text.includes('excited') || text.includes('happy') || text.includes('amazing')) && Math.random() < 0.35) {
            soundType = excitedSounds;
            context = 'excited';
        } else if ((text.includes('love') || text.includes('cute') || text.includes('adorable') || text.includes('sweet')) && Math.random() < 0.3) {
            soundType = affectionateSounds;
            context = 'affectionate';
        } else if ((text.includes('sad') || text.includes('sorry') || text.includes('terrible') || text.includes('awful')) && Math.random() < 0.25) {
            soundType = sadSounds;
            context = 'sad';
        } else if ((text.includes('tired') || text.includes('sleep') || text.includes('nap') || isNightTime()) && Math.random() < 0.25) {
            soundType = sleepyTiredSounds;
            context = 'sleepy';
        } else if ((text.includes('play') || text.includes('fun') || text.includes('game') || text.includes('toy')) && Math.random() < 0.3) {
            soundType = playfulSounds;
            context = 'playful';
        } else if ((text.includes('food') || text.includes('hungry') || text.includes('treat') || text.includes('feed')) && Math.random() < 0.4) {
            soundType = demandingSounds;
            context = 'demanding';
        } else if ((text.includes('good') || text.includes('nice') || text.includes('relaxed') || text.includes('comfortable')) && Math.random() < 0.25) {
            soundType = contentSounds;
            context = 'content';
        } else if (Math.random() < 0.2) {
            // Random variety to keep things interesting
            const allSpecialSounds = [...playfulSounds, ...contentSounds, ...curiousSounds];
            soundType = allSpecialSounds;
            context = 'playful';
        }
        
        // Select random sound from the chosen type
        const selectedSound = soundType[Math.floor(Math.random() * soundType.length)];
        catSoundsWithContext.push({ sound: selectedSound, context: context });
    }
    
    return formatCatSoundsIntoSentences(catSoundsWithContext);
}

function formatCatSoundsIntoSentences(catSoundsWithContext) {
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
            // Cat emoticons organized by context
            const catEmoticons = {
                standard: [':3', ':>', '=^.^=', '^.^', '~(＾◡＾)~'],
                question: [':3?', ':>?', '=^.^=?', '^.^?', '(・・)?'],
                excited: [':D', ':3!', 'X3', '=^o^=', '^o^', '>:3', '(＾◡＾)'],
                demanding: ['>:3', '>:(', '=^x^=', '(>_<)', '~(>_<)~'],
                sad: [':(', ':c', ';-;', '(╥﹏╥)', '=T.T='],
                sleepy: ['=.=', '-.-', '=~.~=', '(-.-)', 'zzz :3'],
                content: [':3', '=^.^=', '^.^', '(￣▾￣)', '~(＾◡＾)~'],
                affectionate: ['♡(˃͈ દ ˂͈ ༶)', ':3♡', '=^.^=♡', '(◡ ‿ ◡)', '♡~'],
                playful: [':3', ':P', 'X3', '=^.^=', '>:3', '^o^'],
                curious: [':3?', '=^.^=?', '(・・)?', '(´・ω・`)?', '^.^?']
            };
            
            // 20% chance to use cat emoticons instead of regular punctuation
            let punctuation;
            if (Math.random() < 0.2 && catEmoticons[sentenceContext]) {
                // Use cat emoticon for this context
                const emoticons = catEmoticons[sentenceContext];
                punctuation = ' ' + emoticons[Math.floor(Math.random() * emoticons.length)];
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
        const catSentences = generateMeowVariations(message, complexity);
        // Split sentences into individual words for streaming
        const words = catSentences.join(' ').split(' ');
        
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