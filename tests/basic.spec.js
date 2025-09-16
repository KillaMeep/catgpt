const { test, expect } = require('@playwright/test');

test.describe('CatGPT Basic Functionality', () => {
    test('should load the welcome screen', async ({ page }) => {
        await page.goto('http://localhost:7342');
        
        // Check if the main elements are present
        await expect(page.locator('.welcome-title')).toBeVisible();
        await expect(page.locator('.welcome-title')).toHaveText('How can I help you today?');
        
        // Check if the input field is present
        await expect(page.locator('#messageInput')).toBeVisible();
    });

    test('should enable send button when text is entered', async ({ page }) => {
        await page.goto('http://localhost:7342');
        
        const messageInput = page.locator('#messageInput');
        const sendBtn = page.locator('#sendBtn');
        
        // Initially disabled
        await expect(sendBtn).toBeDisabled();
        
        // Type some text
        await messageInput.fill('Hello kitty');
        
        // Should be enabled now
        await expect(sendBtn).toBeEnabled();
    });

    test('should send message when enter key is pressed', async ({ page }) => {
        await page.goto('http://localhost:7342');
        
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
    });
});