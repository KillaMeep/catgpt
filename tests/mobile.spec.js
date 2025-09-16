const { test, expect } = require('@playwright/test');

test.describe('Mobile Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show hamburger menu on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Hamburger menu should be visible on mobile
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    await expect(mobileMenuBtn).toBeVisible();
    
    // Sidebar should be hidden initially
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('should hide hamburger menu on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Hamburger menu should be hidden on desktop
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    await expect(mobileMenuBtn).not.toBeVisible();
  });

  test('should open and close mobile sidebar', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    const sidebar = page.locator('.sidebar');
    const overlay = page.locator('#mobileOverlay');
    
    // Click hamburger menu to open sidebar
    await mobileMenuBtn.click();
    
    // Sidebar should be open
    await expect(sidebar).toHaveClass(/open/);
    await expect(overlay).toHaveClass(/active/);
    
    // Click overlay to close sidebar
    await overlay.click();
    
    // Sidebar should be closed
    await expect(sidebar).not.toHaveClass(/open/);
    await expect(overlay).not.toHaveClass(/active/);
  });

  test('should close mobile menu with escape key', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    const sidebar = page.locator('.sidebar');
    
    // Open sidebar
    await mobileMenuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    
    // Press escape to close
    await page.keyboard.press('Escape');
    
    // Sidebar should be closed
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('should work properly on mobile for chat functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    // Type a message
    await messageInput.fill('Hello mobile test');
    
    // Send button should be enabled
    await expect(sendBtn).not.toBeDisabled();
    
    // Send message
    await page.keyboard.press('Enter');
    
    // Check that message appears
    await expect(page.getByText('Hello mobile test')).toBeVisible();
    
    // Check that AI response appears
    await expect(page.locator('.message.ai')).toBeVisible();
  });

  test('should allow accessing chat history on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Send a message to create chat history
    const messageInput = page.locator('#messageInput');
    await messageInput.fill('Test message');
    await page.keyboard.press('Enter');
    
    // Wait for response
    await expect(page.locator('.message.ai')).toBeVisible();
    
    // Open mobile menu
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    await mobileMenuBtn.click();
    
    // Chat history should be visible
    const chatHistory = page.locator('.chat-history');
    await expect(chatHistory).toBeVisible();
    
    // Should have at least one chat item
    const chatItem = page.locator('.chat-item');
    await expect(chatItem).toHaveCount(1);
  });

  test('should close mobile menu when starting new chat', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    const sidebar = page.locator('.sidebar');
    const newChatBtn = page.locator('#newChatBtn');
    
    // Open sidebar
    await mobileMenuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    
    // Click new chat
    await newChatBtn.click();
    
    // Sidebar should be closed
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.locator('#mobileMenuBtn').click();
    
    // Check touch target sizes (should be at least 44px)
    const newChatBtn = page.locator('#newChatBtn');
    const boundingBox = await newChatBtn.boundingBox();
    
    expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    
    // Check send button size
    const sendBtn = page.locator('#sendBtn');
    const sendBtnBox = await sendBtn.boundingBox();
    
    expect(sendBtnBox.width).toBeGreaterThanOrEqual(34);
    expect(sendBtnBox.height).toBeGreaterThanOrEqual(34);
  });

  test('should handle different mobile screen sizes', async ({ page }) => {
    // Test iPhone SE size (small mobile)
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Should still be usable
    const mobileMenuBtn = page.locator('#mobileMenuBtn');
    await expect(mobileMenuBtn).toBeVisible();
    
    // Test larger mobile
    await page.setViewportSize({ width: 414, height: 896 });
    
    // Should still work
    await expect(mobileMenuBtn).toBeVisible();
    
    // Test tablet portrait
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Should hide hamburger menu on tablet
    await expect(mobileMenuBtn).not.toBeVisible();
  });
});