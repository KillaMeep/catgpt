const { test, expect } = require('@playwright/test');

test.describe('CatGPT Fixed Issues', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:7342');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Give time for socket connection
    });

    test('should start new chat and reset conversation', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        const newChatBtn = page.locator('#newChatBtn');
        
        // Send a message first
        await messageInput.fill('First message');
        await messageInput.press('Enter');
        
        // Wait for response
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Verify we have messages
        const messagesBefore = await page.locator('.message').count();
        expect(messagesBefore).toBeGreaterThan(0);
        
        // Start new chat
        await newChatBtn.click();
        
        // Wait for reset to complete
        await page.waitForTimeout(2000);
        
        // Should show welcome screen again
        await expect(page.locator('.welcome-section')).toBeVisible();
        
        // Should have new welcome meows (check that subtitle changed)
        const subtitle = await page.locator('#welcomeSubtitle').textContent();
        expect(subtitle).toMatch(/\b(meow|mrow|mrrow|mew|miau)/i);
        
        // Previous messages should be gone
        const messagesAfter = await page.locator('.message').count();
        expect(messagesAfter).toBe(0);
    });

    test('should maintain chat history in sidebar', async ({ page }) => {
        // Send a message to create a chat
        const messageInput = page.locator('#messageInput');
        await messageInput.fill('Test message for history');
        await messageInput.press('Enter');
        
        // Wait for response
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Wait a bit more for chat to be added to history
        await page.waitForTimeout(2000);
        
        // Check if chat appears in history
        const chatHistory = page.locator('#chatHistory');
        await expect(chatHistory).toBeVisible();
        
        // Should have at least one chat item
        const chatItems = page.locator('.chat-item');
        const chatItemCount = await chatItems.count();
        expect(chatItemCount).toBeGreaterThan(0);
        
        // Verify the chat item contains expected text
        const firstChatItem = chatItems.first();
        await expect(firstChatItem).toBeVisible();
        const chatText = await firstChatItem.textContent();
        expect(chatText).toContain('Chat');
    });

    test('should show welcome section by default', async ({ page }) => {
        // Should show welcome screen on load
        await expect(page.locator('.welcome-section')).toBeVisible();
        await expect(page.locator('.welcome-title')).toHaveText('How can I help you today?');
        
        // Should not have any messages initially
        const messageCount = await page.locator('.message').count();
        expect(messageCount).toBe(0);
    });

    test('should handle chat history properly after multiple messages', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Send first message
        await messageInput.fill('First message');
        await messageInput.press('Enter');
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        
        // Send second message
        await messageInput.fill('Second message');
        await messageInput.press('Enter');
        await page.waitForSelector('.message.ai:nth-of-type(2)', { timeout: 10000 });
        
        // Should still have only one chat in history (same conversation)
        await page.waitForTimeout(1000);
        const chatItems = page.locator('.chat-item');
        const chatItemCount = await chatItems.count();
        expect(chatItemCount).toBe(1);
        
        // Should have multiple messages in the conversation
        const messageCount = await page.locator('.message').count();
        expect(messageCount).toBeGreaterThanOrEqual(4); // 2 user + 2 AI messages
    });
});