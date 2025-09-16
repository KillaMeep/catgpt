const { test, expect } = require('@playwright/test');

test.describe('Dynamic Complexity Analysis', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:7342');
        await page.waitForLoadState('networkidle');
    });

    test('should analyze simple greetings with low complexity', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Test simple greetings
        const simpleInputs = ['hi', 'hello', 'hey', 'hey!'];
        
        for (const input of simpleInputs) {
            await messageInput.fill(input);
            await messageInput.press('Enter');
            
            // Wait for response
            await page.waitForSelector('.message.ai', { timeout: 10000 });
            await page.waitForTimeout(2000); // Wait for streaming to complete
            
            // Check that response is short (simple greeting should get 2-5 meows)
            const lastAiMessage = page.locator('.message.ai').last();
            const responseText = await lastAiMessage.locator('.message-content').textContent();
            const meowCount = responseText.split(' ').filter(word => 
                /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
            ).length;
            
            expect(meowCount).toBeGreaterThanOrEqual(2);
            expect(meowCount).toBeLessThanOrEqual(8); // Allow some variance for simple greetings
        }
    });

    test('should analyze complex academic prompts with high complexity', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        const complexPrompts = [
            'Write me a comprehensive analysis of quantum physics and its relationship to consciousness',
            'Explain the theoretical framework of machine learning algorithms and their implementation',
            'Analyze the philosophical implications of artificial intelligence on human society',
            'Describe the mathematical principles underlying quantum mechanics and relativity theory'
        ];
        
        for (const prompt of complexPrompts) {
            await messageInput.fill(prompt);
            await messageInput.press('Enter');
            
            // Wait for response
            await page.waitForSelector('.message.ai', { timeout: 10000 });
            await page.waitForTimeout(5000); // Wait longer for complex responses
            
            // Check that response is long (complex prompt should get 45+ meows)
            const lastAiMessage = page.locator('.message.ai').last();
            const responseText = await lastAiMessage.locator('.message-content').textContent();
            const meowCount = responseText.split(' ').filter(word => 
                /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
            ).length;
            
            expect(meowCount).toBeGreaterThanOrEqual(20); // Should be substantial response
            expect(meowCount).toBeLessThanOrEqual(100); // But within reasonable bounds
        }
    });

    test('should detect semantic complexity indicators', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Prompts with relationship words and abstract concepts
        const semanticPrompts = [
            'Explain how quantum physics relates to consciousness, therefore impacting our understanding of reality',
            'Analyze the concept of artificial intelligence, however considering the philosophical implications',
            'Describe the methodology for research, moreover examining the theoretical framework'
        ];
        
        for (const prompt of semanticPrompts) {
            await messageInput.fill(prompt);
            await messageInput.press('Enter');
            
            // Wait for response
            await page.waitForSelector('.message.ai', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // Should get medium to long responses due to semantic complexity
            const lastAiMessage = page.locator('.message.ai').last();
            const responseText = await lastAiMessage.locator('.message-content').textContent();
            const meowCount = responseText.split(' ').filter(word => 
                /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
            ).length;
            
            expect(meowCount).toBeGreaterThanOrEqual(15); // Should show increased complexity
        }
    });

    test('should apply category multipliers correctly', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Test different category combinations
        const categoryTests = [
            { prompt: 'Write a creative story about programming algorithms', categories: ['creative', 'technical'] },
            { prompt: 'Analyze the academic research on machine learning theory', categories: ['academic', 'technical'] },
            { prompt: 'Explain the philosophical framework of consciousness studies', categories: ['academic', 'complexity'] }
        ];
        
        for (const test of categoryTests) {
            await messageInput.fill(test.prompt);
            await messageInput.press('Enter');
            
            // Wait for response
            await page.waitForSelector('.message.ai', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // Combination of categories should produce longer responses
            const lastAiMessage = page.locator('.message.ai').last();
            const responseText = await lastAiMessage.locator('.message-content').textContent();
            const meowCount = responseText.split(' ').filter(word => 
                /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
            ).length;
            
            expect(meowCount).toBeGreaterThanOrEqual(18); // Category combinations should boost score
        }
    });

    test('should apply diminishing returns for repeated keywords', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Prompt with many repeated academic keywords
        const promptWithRepeats = 'Analyze the physics theory of quantum physics and the theoretical physics framework for understanding quantum theory';
        
        await messageInput.fill(promptWithRepeats);
        await messageInput.press('Enter');
        
        // Wait for response
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        await page.waitForTimeout(3000);
        
        // Should get a reasonable response despite keyword repetition
        const lastAiMessage = page.locator('.message.ai').last();
        const responseText = await lastAiMessage.locator('.message-content').textContent();
        const meowCount = responseText.split(' ').filter(word => 
            /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
        ).length;
        
        // Should be long but not excessively long due to diminishing returns
        expect(meowCount).toBeGreaterThanOrEqual(20);
        expect(meowCount).toBeLessThanOrEqual(60);
    });

    test('should detect structural complexity', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        // Prompt with complex structure (commas, semicolons, parentheses)
        const structuralPrompt = 'Explain quantum physics (including wave-particle duality), its relationship to consciousness; moreover, analyze the implications for understanding reality, measurement, and observation.';
        
        await messageInput.fill(structuralPrompt);
        await messageInput.press('Enter');
        
        // Wait for response
        await page.waitForSelector('.message.ai', { timeout: 10000 });
        await page.waitForTimeout(4000);
        
        // Should get longer response due to structural complexity
        const lastAiMessage = page.locator('.message.ai').last();
        const responseText = await lastAiMessage.locator('.message-content').textContent();
        const meowCount = responseText.split(' ').filter(word => 
            /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
        ).length;
        
        expect(meowCount).toBeGreaterThanOrEqual(25); // Structural complexity should boost score
    });

    test('should handle mixed complexity levels appropriately', async ({ page }) => {
        const messageInput = page.locator('#messageInput');
        
        const mixedTests = [
            { prompt: 'yes', expectedRange: [2, 6] }, // Simple response
            { prompt: 'How are you?', expectedRange: [5, 12] }, // Basic question
            { prompt: 'Tell me about cats', expectedRange: [10, 20] }, // Medium request
            { prompt: 'Write a poem about artificial intelligence', expectedRange: [18, 35] }, // Creative + technical
            { prompt: 'Analyze the comprehensive theoretical framework of quantum consciousness research', expectedRange: [30, 70] } // Maximum complexity
        ];
        
        for (const test of mixedTests) {
            await messageInput.fill(test.prompt);
            await messageInput.press('Enter');
            
            // Wait for response
            await page.waitForSelector('.message.ai', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            const lastAiMessage = page.locator('.message.ai').last();
            const responseText = await lastAiMessage.locator('.message-content').textContent();
            const meowCount = responseText.split(' ').filter(word => 
                /\b(meow|mrow|mrrow|mew|miau|purr|MEOW|MROW)/i.test(word)
            ).length;
            
            expect(meowCount).toBeGreaterThanOrEqual(test.expectedRange[0]);
            expect(meowCount).toBeLessThanOrEqual(test.expectedRange[1]);
        }
    });
});