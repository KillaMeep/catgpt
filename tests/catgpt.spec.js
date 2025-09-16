const { test, expect } = require('@playwright/test');

test.describe('CatGPT Application', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the CatGPT application
        await page.goto('http://localhost:7342');
        
        // Wait for the page to load completely
        await page.waitForLoadState('networkidle');
    });

    test('should load the welcome screen with proper elements', async ({ page }) => {
        // Check if the main elements are present
        await expect(page.locator('.welcome-title')).toBeVisible();
        await expect(page.locator('.welcome-title')).toHaveText('How can I help you today?');
        
        // Check if the cat logo is present
        await expect(page.locator('.cat-gif')).toBeVisible();
        
        // Check if the input field is present
        await expect(page.locator('#messageInput')).toBeVisible();
        await expect(page.locator('#messageInput')).toHaveAttribute('placeholder', 'Message CatGPT');
        
        // Check if the send button is present and initially disabled
        await expect(page.locator('#sendBtn')).toBeVisible();
        await expect(page.locator('#sendBtn')).toBeDisabled();
        
        // Check if the new chat button is present
        await expect(page.locator('#newChatBtn')).toBeVisible();
    });

    test('should display random meow subtitle on load', async ({ page }) => {
        // Wait for socket connection and welcome meows
        await page.waitForTimeout(1000);
        
        // Check if the welcome subtitle contains meow-like sounds
        const subtitle = await page.locator('#welcomeSubtitle').textContent();
        
        // Should contain cat sounds (meow variations)
        expect(subtitle).toMatch(/\b(meow|mrow|mrrow|mew|miau)/i);
        
        // Should not be the default static text
        expect(subtitle).not.toBe("I'm an AI assistant that only speaks cat. Ask me anything, and I'll respond with various cat sounds!");
        
        // Should be 5-7 words (meow sounds)
        const words = subtitle.split(' ').filter(word => word.trim() !== '');
        expect(words.length).toBeGreaterThanOrEqual(5);
        expect(words.length).toBeLessThanOrEqual(7);
    });

    test('should enable send button when text is entered', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        const sendBtn = page.locator('#sendBtn');
        
        // Initially disabled
        await expect(sendBtn).toBeDisabled();
        
        // Type some text
        await messageInput.fill('Hello kitty');
        
        // Should be enabled now
        await expect(sendBtn).toBeEnabled();
        
        // Clear the text
        await messageInput.fill('');
        
        // Should be disabled again
        await expect(sendBtn).toBeDisabled();
    });

    test('should send message when enter key is pressed', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Type a message
        await messageInput.fill('Hello CatGPT');
        
        // Press Enter
        await messageInput.press('Enter');
        
        // Wait for the message to appear
        await page.waitForSelector('.message.user', { timeout: 5000 });
        
        // Check if user message is displayed
        const userMessage = page.locator('.message.user').last();
        await expect(userMessage).toBeVisible();
        await expect(userMessage.locator('.message-content')).toContainText('Hello CatGPT');
        
        // Check if input is cleared
        await expect(messageInput).toHaveValue('');
    });

    test('should send message when send button is clicked', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        const sendBtn = page.locator('#sendBtn');
        
        // Type a message
        await messageInput.fill('Test message');
        
        // Click send button
        await sendBtn.click();
        
        // Wait for the message to appear
        await page.waitForSelector('.message.user', { timeout: 5000 });
        
        // Check if user message is displayed
        const userMessage = page.locator('.message.user').last();
        await expect(userMessage).toBeVisible();
        await expect(userMessage.locator('.message-content')).toContainText('Test message');
    });

    test('should receive AI response with cat sounds', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Send a message
        await messageInput.fill('How are you today?');
        await messageInput.press('Enter');
        
        // Wait for AI response to start
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Wait for streaming to complete
        await page.waitForTimeout(3000);
        
        // Check if AI message is displayed
        const aiMessage = page.locator('.message.ai').last();
        await expect(aiMessage).toBeVisible();
        
        // Check if the response contains cat sounds
        const responseText = await aiMessage.locator('.message-content').textContent();
        expect(responseText).toMatch(/\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i);
        
        // Should have multiple cat sounds
        const catSounds = responseText.split(' ').filter(word => 
            /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
        );
        expect(catSounds.length).toBeGreaterThan(1);
    });

    test('should handle streaming response correctly', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Send a complex message to get a longer response
        await messageInput.fill('Please write me a comprehensive analysis of quantum physics and its implications for modern technology');
        await messageInput.press('Enter');
        
        // Wait for AI response to start
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Monitor streaming behavior
        const aiMessage = page.locator('.message.ai').last();
        let previousLength = 0;
        let streamingDetected = false;
        
        // Check if content is growing (streaming)
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(500);
            const currentText = await aiMessage.locator('.message-content').textContent();
            if (currentText.length > previousLength) {
                streamingDetected = true;
                previousLength = currentText.length;
            }
        }
        
        expect(streamingDetected).toBe(true);
        
        // Wait for streaming to complete
        await page.waitForTimeout(5000);
        
        // Final response should be longer for complex queries
        const finalText = await aiMessage.locator('.message-content').textContent();
        const words = finalText.split(' ').filter(word => word.trim() !== '');
        expect(words.length).toBeGreaterThan(10); // Should be a longer response
    });

    test('should start new chat and reset conversation', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        const newChatBtn = page.locator('#newChatBtn');
        
        // Send a message first
        await messageInput.fill('First message');
        await messageInput.press('Enter');
        
        // Wait for response
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Start new chat
        await newChatBtn.click();
        
        // Should show welcome screen again
        await expect(page.locator('.welcome-section')).toBeVisible();
        
        // Should have new welcome meows
        await page.waitForTimeout(1000);
        const subtitle = await page.locator('#welcomeSubtitle').textContent();
        expect(subtitle).toMatch(/\b(meow|mrow|mrrow|mew|miau)/i);
        
        // Previous messages should be gone
        await expect(page.locator('.message')).toHaveCount(0);
    });

    test('should prevent sending empty messages', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        const sendBtn = page.locator('#sendBtn');
        
        // Try to send empty message
        await messageInput.fill('   '); // Just whitespace
        await expect(sendBtn).toBeDisabled();
        
        // Try pressing enter with empty input
        await messageInput.fill('');
        await messageInput.press('Enter');
        
        // No message should be sent
        await page.waitForTimeout(1000);
        await expect(page.locator('.message')).toHaveCount(0);
    });

    test('should handle different types of user inputs correctly', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        const testCases = [
            { input: 'Hello!', expectedPattern: /meow|mrow|miau/i },
            { input: 'How are you?', expectedPattern: /meow\?|mrow\?/i },
            { input: 'I love cats', expectedPattern: /purr|meow/i },
            { input: 'Tell me a story', expectedPattern: /meow|mrow/i },
        ];
        
        for (const testCase of testCases) {
            // Send message
            await messageInput.fill(testCase.input);
            await messageInput.press('Enter');
            
            // Wait for response
            await page.waitForSelector('.message.ai', { timeout: 10000 });
            await page.waitForTimeout(2000); // Wait for streaming to complete
            
            // Check response
            const aiMessage = page.locator('.message.ai').last();
            const responseText = await aiMessage.locator('.message-content').textContent();
            expect(responseText).toMatch(testCase.expectedPattern);
            
            // Wait a bit before next test
            await page.waitForTimeout(500);
        }
    });

    test('should maintain chat history in sidebar', async ({ page }) => {
        // Send a message to create a chat
        const messageInput = page.locator('#messageInput');
        await messageInput.fill('Test message for history');
        await messageInput.press('Enter');
        
        // Wait for response
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Check if chat appears in history
        await page.waitForTimeout(1000);
        const chatHistory = page.locator('#chatHistory');
        await expect(chatHistory).toBeVisible();
        
        // Should have at least one chat item
        const chatItems = page.locator('.chat-item');
        await expect(chatItems).toHaveCountGreaterThan(0);
    });

    test('should auto-resize textarea based on content', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Get initial height
        const initialHeight = await messageInput.evaluate(el => el.style.height);
        
        // Type multiple lines
        const longText = 'This is a very long message that should cause the textarea to expand\nwith multiple lines\nto test the auto-resize functionality';
        await messageInput.fill(longText);
        
        // Get new height
        const newHeight = await messageInput.evaluate(el => el.style.height);
        
        // Height should have changed (assuming it grows)
        // Note: This test might need adjustment based on the exact implementation
        expect(newHeight).not.toBe(initialHeight);
    });
});

test.describe('CatGPT Error Handling', () => {
    test('should handle server disconnection gracefully', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Simulate network disconnection by going offline
        await page.context().setOffline(true);
        
        // Try to send a message
        const messageInput = page.locator('#messageInput');
        await messageInput.fill('Test message during disconnection');
        await messageInput.press('Enter');
        
        // The app should handle this gracefully without crashing
        // (exact behavior depends on implementation)
        await page.waitForTimeout(2000);
        
        // Restore connection
        await page.context().setOffline(false);
    });
});