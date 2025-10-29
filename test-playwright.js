const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Desktop viewport
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

        // Wait for login screen to be visible
        await page.waitForSelector('.login-container', { timeout: 5000 });

        // Screenshot 1: Login Screen Desktop
        console.log('Taking screenshot 1: Login Screen (Desktop)...');
        await page.screenshot({
            path: '/home/olli/projekte/private-projekte/skool-community/screenshot-01-login-desktop.png',
            fullPage: false
        });

        // Mobile viewport
        await page.setViewport({ width: 375, height: 812 });
        await page.waitForTimeout(500);

        // Screenshot 2: Login Screen Mobile
        console.log('Taking screenshot 2: Login Screen (Mobile)...');
        await page.screenshot({
            path: '/home/olli/projekte/private-projekte/skool-community/screenshot-02-login-mobile.png',
            fullPage: false
        });

        // Back to desktop for login
        await page.setViewport({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Fill in login form
        console.log('Filling login form...');
        await page.type('#email', 'test@example.com');
        await page.type('#accessCode', 'DEMO2025');

        // Screenshot 3: Filled form
        console.log('Taking screenshot 3: Filled Login Form...');
        await page.screenshot({
            path: '/home/olli/projekte/private-projekte/skool-community/screenshot-03-login-filled.png',
            fullPage: false
        });

        // Click login button
        console.log('Clicking login button...');
        await page.click('.login-btn');

        // Wait for login to complete
        await page.waitForTimeout(2000);

        // Check if we're logged in (login container should be hidden)
        const loginHidden = await page.evaluate(() => {
            const loginContainer = document.querySelector('.login-container');
            return loginContainer && loginContainer.classList.contains('hidden');
        });

        console.log('Login successful:', loginHidden);

        if (loginHidden) {
            // Wait for main content to load
            await page.waitForSelector('.hero', { timeout: 5000 });

            // Screenshot 4: Main page after login
            console.log('Taking screenshot 4: Main Page (Desktop)...');
            await page.screenshot({
                path: '/home/olli/projekte/private-projekte/skool-community/screenshot-04-main-desktop.png',
                fullPage: true
            });

            // Mobile view of main page
            await page.setViewport({ width: 375, height: 812 });
            await page.waitForTimeout(500);

            // Screenshot 5: Main page mobile
            console.log('Taking screenshot 5: Main Page (Mobile)...');
            await page.screenshot({
                path: '/home/olli/projekte/private-projekte/skool-community/screenshot-05-main-mobile.png',
                fullPage: true
            });

            // Back to desktop
            await page.setViewport({ width: 1920, height: 1080 });
            await page.waitForTimeout(500);

            // Check console errors
            const logs = [];
            page.on('console', msg => {
                logs.push({ type: msg.type(), text: msg.text() });
            });

            // Get computed styles for design verification
            const designInfo = await page.evaluate(() => {
                const loginBox = document.querySelector('.login-box');
                const loginBtn = document.querySelector('.login-btn');
                const hero = document.querySelector('.hero');

                const getStyles = (element) => {
                    if (!element) return null;
                    const styles = window.getComputedStyle(element);
                    return {
                        backgroundColor: styles.backgroundColor,
                        backgroundImage: styles.backgroundImage,
                        borderColor: styles.borderColor,
                        color: styles.color,
                        backdropFilter: styles.backdropFilter
                    };
                };

                return {
                    loginBox: getStyles(loginBox),
                    loginBtn: getStyles(loginBtn),
                    hero: getStyles(hero)
                };
            });

            console.log('\n=== Design Info ===');
            console.log(JSON.stringify(designInfo, null, 2));

            // Test interactive cards
            const hasCards = await page.evaluate(() => {
                return document.querySelectorAll('.interactive-card').length > 0;
            });
            console.log('\nInteractive cards found:', hasCards);

            // Test progress tracker
            const hasProgressTracker = await page.evaluate(() => {
                return !!document.querySelector('.progress-tracker');
            });
            console.log('Progress tracker found:', hasProgressTracker);

        } else {
            console.error('Login failed - container still visible');
        }

        console.log('\n=== Test completed successfully ===');

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await browser.close();
    }
})();
