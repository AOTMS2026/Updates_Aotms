const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Automated Sign-Up Test...');
  
  // Launch the browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to Vercel deployment login page...');
    await page.goto('https://updates-aotms-mcvw.vercel.app/#/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for the login form to be visible, then click the "Sign Up" link
    await page.waitForSelector('#showSignup', { visible: true });
    console.log('🔄 Switching to Sign Up form...');
    await page.click('#showSignup');
    
    // Wait for the Sign Up form to become visible
    await page.waitForSelector('#signupForm', { visible: true });
    
    console.log('⌨️  Entering new account details...');
    
    // Type in name
    await page.type('#signupName', 'Jayaveer Tester', { delay: 50 });
    
    // Type in email (using the one provided)
    await page.type('#signupEmail', 'jayaveer@gmail.com', { delay: 50 });
    
    // Type in password
    await page.type('#signupPassword', 'jayaveer@gmail.com', { delay: 50 });
    
    // Type in confirm password
    await page.type('#signupConfirm', 'jayaveer@gmail.com', { delay: 50 });
    
    console.log('🖱️  Clicking Create Account...');
    // Click the submit button inside the signup form
    await page.click('#signupForm button[type="submit"]');
    
    console.log('⏳ Waiting for Dashboard to load...');
    // Wait for the Dashboard to appear
    await page.waitForSelector('.sidebar-nav', { visible: true, timeout: 10000 });
    
    console.log('✅ Account Creation Successful! Dashboard loaded.');
    
    // Take a screenshot of the successful registration
    console.log('📸 Taking a screenshot of the Dashboard...');
    await page.screenshot({ path: 'signup-success-screenshot.png' });
    console.log('💾 Screenshot saved as signup-success-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    try {
      await page.screenshot({ path: 'signup-error-screenshot.png' });
      console.log('📸 Saved error screenshot as signup-error-screenshot.png');
    } catch (e) {}
  } finally {
    console.log('Closing browser in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
    console.log('🏁 Test completed.');
  }
})();
