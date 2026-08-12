const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Automated Auth Test...');
  
  // Launch the browser
  // headless: false means you will actually see the browser open and perform the actions
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to Vercel deployment login page...');
    await page.goto('https://updates-aotms-mcvw.vercel.app/#/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for the login form to be visible
    await page.waitForSelector('#loginForm', { visible: true });
    
    console.log('⌨️  Entering credentials...');
    // Type in email
    await page.type('#loginEmail', 'ramanadhamjayaveer@gmail.com', { delay: 50 });
    
    // Type in password
    await page.type('#loginPassword', 'Jayaveer!@#1837', { delay: 50 });
    
    console.log('🖱️  Clicking Sign In...');
    // Click the submit button inside the login form
    await page.click('#loginForm button[type="submit"]');
    
    console.log('⏳ Waiting for Dashboard to load...');
    // Wait for the Dashboard to appear. We can check for the Top Header or Sidebar
    // Specifically waiting for the sidebar nav to appear which indicates successful login
    await page.waitForSelector('.sidebar-nav', { visible: true, timeout: 10000 });
    
    console.log('✅ Login Successful! Dashboard loaded.');
    
    // Take a screenshot of the successful login
    console.log('📸 Taking a screenshot of the Dashboard...');
    await page.screenshot({ path: 'success-screenshot.png' });
    console.log('💾 Screenshot saved as success-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    // Take an error screenshot if possible
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 Saved error screenshot as error-screenshot.png');
    } catch (e) {}
  } finally {
    // Keep browser open for 3 seconds so the user can see the result before closing
    console.log('Closing browser in 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
    console.log('🏁 Test completed.');
  }
})();
