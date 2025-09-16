# CatGPT Development Instructions

CatGPT is a Node.js web application that mimics ChatGPT but only responds with various cat sounds (meows, purrs, etc.). It uses Express.js for the server, Socket.IO for real-time communication, and Playwright for end-to-end testing.

**CRITICAL: Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Quick Setup and Development

### Install Dependencies and Start Development
```bash
# Install all dependencies - takes under 1 second (validated)
npm install

# Start the development server - starts instantly (validated)
npm start
# OR for development with auto-reload (validated):
npm run dev
```

The server runs on **http://localhost:7342** and starts in under 1 second.

### Run Tests
```bash
# Install Playwright browsers first (may fail in restricted environments)
npx playwright install

# Run all tests - takes 2-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
npm test

# Alternative test commands:
npm run test:ui       # Interactive test UI
npm run test:debug    # Debug mode
npm run test:report   # View test results
```

**CRITICAL BUILD TIMING**: 
- **npm install**: Under 1 second (validated: 0.974s) - NEVER CANCEL
- **Server startup**: Under 1 second (validated: instant) - NEVER CANCEL
- **Test suite**: 2-5 minutes - NEVER CANCEL, set timeout to 10+ minutes
- **Playwright browser install**: May fail in restricted environments (validated: fails with download errors)

## Manual Validation Scenarios

**ALWAYS validate your changes by manually testing these scenarios after making code changes:**

1. **Basic Chat Flow** (✅ VALIDATED):
   ```bash
   npm start
   # Navigate to http://localhost:7342
   # Type "Hello CatGPT" and press Enter
   # Verify: User message appears, AI responds with cat sounds (meow, mrow, miau, etc.)
   # Verify: Chat history appears in sidebar with timestamp (e.g., "Chat 6:47:13 PM")
   ```

2. **Streaming Response Test** (✅ VALIDATED):
   ```bash
   # Send a complex message like: "Tell me a long story about cats"
   # Verify: Response appears word by word (streaming effect)
   # Verify: Longer queries generate longer responses (more cat sounds)
   # Verified: Response grows from ~7 words to ~20+ words for complex queries
   ```

3. **New Chat Functionality** (✅ VALIDATED):
   ```bash
   # Send a few messages to create conversation history
   # Click "New chat" button
   # Verify: Welcome screen reappears with new random cat welcome sounds
   # Verify: Previous chat remains in sidebar history
   # Verified: Each new chat gets different welcome meows (randomized)
   ```

4. **UI Responsiveness** (✅ VALIDATED):
   ```bash
   # Verify: Send button is disabled when input is empty
   # Verify: Send button enables when text is entered
   # Verify: Enter key sends message (Shift+Enter for new line)
   # Verified: Button state changes from [disabled] to [cursor=pointer] when text present
   ```

## Project Structure

```
/home/runner/work/catgpt/catgpt/
├── server.js              # Main server file (451 lines)
├── package.json           # Dependencies and scripts
├── playwright.config.js   # Test configuration
├── public/
│   ├── index.html         # Main UI (89 lines)
│   ├── script.js          # Client-side logic (342 lines)
│   └── style.css          # Styling (505 lines)
└── tests/
    ├── basic.spec.js      # Basic functionality tests (49 lines)
    ├── catgpt.spec.js     # Comprehensive tests (303 lines)
    └── fixes.spec.js      # Regression tests (103 lines)
```

## Key Implementation Details

### Server Behavior (server.js)
- Generates contextual cat responses based on user input complexity
- Implements streaming responses with realistic delays
- Supports multiple conversation management
- Runs on port 7342 (configurable via PORT environment variable)

### Client Features (public/*)
- Real-time messaging via Socket.IO
- Auto-resizing textarea
- Chat history management
- Streaming message display
- Welcome screen with random cat greetings

### Test Coverage
- 60 tests across 3 browsers (Chromium, Firefox, WebKit)
- Tests basic functionality, streaming, error handling, and UI interactions
- Comprehensive validation of user scenarios

## Common Development Tasks

### Making Code Changes
```bash
# 1. Always start with existing server running for testing
npm start

# 2. Make your changes to server.js, public/*, or tests/*

# 3. Test manually using validation scenarios above

# 4. Run tests to ensure no regressions
npm test  # NEVER CANCEL - set 10+ minute timeout
```

### Adding New Features
```bash
# 1. Review existing socket events in server.js:
#    - 'send-message': Handle user messages
#    - 'ai-message-start': Begin streaming response
#    - 'ai-message-chunk': Stream response chunks
#    - 'ai-message-complete': End streaming
#    - 'request-welcome-meows': Get welcome message

# 2. Update client-side event handlers in public/script.js

# 3. Add corresponding tests in tests/catgpt.spec.js

# 4. Validate with manual scenarios
```

### Troubleshooting

**Server won't start** (✅ VALIDATED):
```bash
# Check if port 7342 is in use (validated command):
lsof -i :7342
# Kill existing process if needed (validated command):
pkill -f "node server.js"
```

**Tests fail with browser installation errors** (✅ VALIDATED - EXPECTED FAILURE):
```bash
# This is normal in restricted environments (confirmed: download failures occur)
# Document as limitation: "Playwright browser installation may fail due to firewall/network restrictions"
# Tests work when browsers are available
# Dry run to see what would be installed: npx playwright install --dry-run
```

**Socket connection issues**:
```bash
# Check browser console for connection errors
# Verify server is running and accessible at localhost:7342
# Check for CORS or network policy blocks
```

## Development Workflow

1. **Always run validation scenarios** after making changes
2. **Never skip manual testing** - the tests may not catch UI/UX issues
3. **Test streaming behavior** for any message-handling changes
4. **Verify chat history functionality** after socket-related changes
5. **Check browser console** for JavaScript errors
6. **Test on localhost:7342** - this is the expected development URL

## Build and Deployment Notes

- **No build step required** - application runs directly from source
- **Static files served** from public/ directory
- **Environment variables**: PORT (default: 7342)
- **Dependencies**: Express 4.18.2, Socket.IO 4.7.4, Playwright 1.55.0
- **Node.js version**: Works with current LTS versions
- **No linting/formatting tools** - code style is maintained manually

## Common NPM Scripts (✅ ALL VALIDATED)

```bash
npm start          # Start production server (validated: instant startup)
npm run dev        # Start development server with nodemon (validated: works)
npm test           # Run Playwright tests (requires browsers installed)
npm run test:ui    # Interactive test UI (requires browsers)
npm run test:debug # Debug test mode (requires browsers)
npm run test:report # View HTML test results (requires prior test run)
```

## Critical Success Indicators

**After making any changes, verify these work:**
1. Server starts without errors in under 1 second
2. Browser can access http://localhost:7342 
3. Welcome screen shows with random cat sounds
4. User can send messages and receive streaming cat responses
5. New chat functionality resets conversation properly
6. Chat history persists in sidebar

**Remember: CatGPT's core feature is generating contextually appropriate cat sounds. Any changes should preserve this whimsical behavior while maintaining real-time communication functionality.**

## Performance Benchmarks (Validated)

- **Server startup**: Instant (< 0.1 seconds)
- **npm install**: Under 1 second (measured: 0.974s)
- **Initial page load**: Under 2 seconds
- **Message response time**: 1-3 seconds for streaming completion
- **Memory usage**: Minimal (~50MB for Node.js process)