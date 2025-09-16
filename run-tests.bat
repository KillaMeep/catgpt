@echo off
echo Stopping any existing server processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2
echo Running Playwright tests...
npx playwright test tests/basic.spec.js
pause