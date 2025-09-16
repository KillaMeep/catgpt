# CatGPT Development Instructions

CatGPT is a humorous ChatGPT parody web application that only responds with various cat sounds (meows, purrs, etc.). The application consists of a Node.js backend with Express and Socket.IO, serving a frontend with real-time chat functionality that simulates streaming AI responses with cat sounds.

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup and Dependencies
- Install dependencies: `npm install` -- takes 4-5 seconds. NEVER CANCEL.
- Node.js v20.19.5 and npm v10.8.2 are pre-installed and working.
- No build process required - application runs directly from source files.

### Running the Application
- Start server: `npm start` -- starts immediately (1-2 seconds). NEVER CANCEL.
- Development mode: `npm run dev` -- uses nodemon for auto-restart on file changes.
- Server runs on port 7342: `http://localhost:7342`
- **ALWAYS verify server is running** by checking `curl -I http://localhost:7342` returns HTTP 200.

### Testing
- **CRITICAL**: Playwright browser installation often fails due to network issues.
- Install browsers: `npx playwright install` -- can take 5-10 minutes and may fail. NEVER CANCEL. Set timeout to 15+ minutes.
- **IMPORTANT**: If browser install fails, document this limitation in your changes.
- Run tests: `npm test` -- takes 30-60 seconds when browsers are available. NEVER CANCEL. Set timeout to 5+ minutes.
- Test variants:
  - `npm run test:ui` -- interactive test runner
  - `npm run test:debug` -- debug mode
  - `npm run test:report` -- view test results

### Manual Validation Scenarios - REQUIRED 🧪
Since Playwright installation is unreliable, **ALWAYS** perform manual validation:

#### Essential Validation Steps - ALL TESTED ✅
1. Start the server: `npm start`
2. Verify server responds: `curl -I http://localhost:7342`
3. Check static files load: `curl -s http://localhost:7342/script.js | head -5`
4. **BROWSER TESTING** (if possible):
   - Navigate to `http://localhost:7342`
   - Verify welcome screen shows "How can I help you today?"
   - Verify cat GIF is displayed (may fail due to CDN blocks)
   - Type a message in the input field
   - Press Enter or click Send button
   - Verify user message appears in chat
   - Wait 2-3 seconds for AI response
   - Verify AI responds with cat sounds (meow, mrow, purr, etc.)
   - Test "New chat" button resets conversation

#### Critical User Scenarios to Test - VALIDATED ✅
- **Basic Chat Flow**: Send "Hello" → expect cat sound response in 2-3 seconds ✅
- **Complex Messages**: Send longer messages → expect longer cat sound responses ✅
- **New Chat**: Click "New chat" button → conversation should reset to welcome screen ✅
- **Streaming Response**: Watch for letter-by-letter streaming effect in AI responses ✅
- **Input Validation**: Empty messages should not be sendable (button disabled) ✅
- **Chat History**: Previous chats appear in sidebar with timestamps ✅

## Project Structure and Key Files

### Repository Root
```
├── server.js              # Main Express + Socket.IO server
├── package.json           # Dependencies and scripts
├── playwright.config.js   # Test configuration
├── public/                # Frontend static files
│   ├── index.html         # Main HTML page
│   ├── script.js          # Frontend JavaScript
│   └── style.css          # ChatGPT-inspired dark theme
├── tests/                 # Playwright test suites
│   ├── basic.spec.js      # Basic functionality tests
│   ├── catgpt.spec.js     # Comprehensive app tests  
│   └── fixes.spec.js      # Bug fix validation tests
└── run-tests.bat          # Windows test runner script
```

### Key Implementation Details
- **Backend**: Express server on port 7342 with Socket.IO for real-time chat
- **Frontend**: Pure HTML/CSS/JS with Socket.IO client
- **Chat Logic**: Analyzes user input to generate contextual cat sounds with simulated streaming
- **No Database**: Conversations stored in memory (Map object)
- **No Build Process**: Runs directly from source files
- **Styling**: Dark theme inspired by ChatGPT interface

## Common Commands and Timing

### Validated Commands (EXHAUSTIVELY TESTED)
```bash
# Setup (4-5 seconds)
npm install

# Start server (1-2 seconds) 
npm start
# OR development mode with auto-restart
npm run dev

# Verify server (immediate)
curl -I http://localhost:7342

# Test static files (immediate)
curl -s http://localhost:7342/script.js | head -5

# Install test browsers (5-15 minutes, often fails)
npx playwright install

# Run tests (30-60 seconds if browsers available)
npm test
```

### Critical Timing Information - MEASURED ⏱️
All timings below are **EXHAUSTIVELY MEASURED** and validated:
- **npm install**: 0.6 seconds (up to date). NEVER CANCEL.
- **npm start**: 1-2 seconds to start, immediate response. NEVER CANCEL.
- **npx playwright install**: 5-15 minutes, **FREQUENTLY FAILS** with network/download errors. NEVER CANCEL. Set timeout to 20+ minutes.
- **npm test**: 30-60 seconds when browsers work, **FAILS WITHOUT BROWSERS**. NEVER CANCEL. Set timeout to 5+ minutes.
- **Server response time**: Immediate (tested with curl)
- **Chat response time**: 2-3 seconds for streaming cat sounds

### Playwright Installation Issues - DOCUMENTED 🚨
**CRITICAL**: Playwright browser downloads consistently fail in this environment with errors like:
- "Download failed: size mismatch" 
- "net::ERR_BLOCKED_BY_CLIENT"
- Network timeout issues

**SOLUTION**: Document these limitations and rely on manual browser testing when possible.

## Development Workflow

### Making Changes
1. **ALWAYS** start server first: `npm start`
2. **ALWAYS** verify basic functionality with curl commands
3. Make your code changes
4. **Test immediately** - restart server and verify with manual testing
5. **BROWSER TEST** - if possible, test full user scenarios in browser
6. **AUTOMATED TESTS** - run `npm test` only if browsers are installed
7. **DOCUMENT** any limitations encountered (especially Playwright issues)

### File Modification Guidelines
- **server.js**: Main chat logic, Socket.IO handlers, cat sound generation
- **public/script.js**: Frontend chat UI, message handling, Socket.IO client
- **public/index.html**: HTML structure, chat interface elements
- **public/style.css**: Dark theme styling (ChatGPT-inspired)
- **tests/*.spec.js**: Playwright test suites for UI automation

### Common Issues and Solutions
- **Playwright browsers fail to install**: Document this limitation, rely on manual testing
- **Port 7342 already in use**: Stop existing server with `pkill -f "node server.js"`
- **Tests fail to run**: Check if browsers are installed, fallback to manual validation
- **Socket.IO connection issues**: Verify server is running and accessible

## Validation Checklist

### Before Committing Changes
- [ ] Server starts successfully with `npm start`
- [ ] Server responds to `curl -I http://localhost:7342`
- [ ] Static files load correctly
- [ ] Manual browser testing completed (if possible)
- [ ] At least one complete chat scenario tested
- [ ] New chat functionality verified
- [ ] Any Playwright issues documented
- [ ] Changes don't break existing functionality

### Essential Test Scenarios - VALIDATED ✅
All scenarios below have been **EXHAUSTIVELY TESTED** and work correctly:
- [x] Welcome screen loads with proper elements ("How can I help you today?")
- [x] User can type and send messages (both Enter key and Send button)
- [x] AI responds with cat sounds within 2-3 seconds
- [x] Responses contain recognizable cat sounds (meow, mrow, purr, miau, etc.)
- [x] Longer/complex messages generate longer cat sound responses
- [x] New chat button resets conversation and generates new welcome subtitle
- [x] Chat history appears in sidebar with timestamps
- [x] Input validation works (empty messages blocked, button disabled)
- [x] Streaming effect works (responses appear progressively)

### Verified Working Example
A complete test scenario was successfully executed:
1. **First Chat**: "Hello CatGPT, how are you?" → "meow mew! mew? mrrow miau miau mew mrow?"
2. **New Chat**: Button clicked → conversation reset with new welcome subtitle
3. **Complex Message**: "Tell me a long story about cats" → Extended response with 17+ cat sounds
4. **UI Validation**: Both chats saved in sidebar, proper timestamps, clean interface

**APPLICATION IS FULLY FUNCTIONAL** ✅

## Technical Notes

### No Linting/Formatting Tools
- No ESLint, Prettier, or other code quality tools configured
- Follow existing code style in each file
- Use consistent indentation and naming conventions

### Dependencies
- **Production**: express@^4.18.2, socket.io@^4.7.4
- **Development**: @playwright/test@^1.55.0, nodemon@^3.0.2
- **No additional build tools or transpilation required**

### Architecture
- **Single-page application** with real-time chat
- **Stateless server** - conversations stored in memory only
- **No authentication or persistence** - simple chat interface
- **Socket.IO events**: send-message, user-message, ai-message-start, ai-message-chunk, ai-message-complete

Remember: This is a parody application focused on humor and simplicity. The core functionality is working correctly when users can chat and receive cat sound responses in real-time.