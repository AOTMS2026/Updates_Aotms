const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Automated Reports Test...');
  
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
    
    // Wait for the login form to be visible
    await page.waitForSelector('#loginForm', { visible: true });
    
    console.log('⌨️  Entering credentials...');
    // Type in email and password
    await page.type('#loginEmail', 'ramanadhamjayaveer@gmail.com', { delay: 50 });
    await page.type('#loginPassword', 'Jayaveer!@#1837', { delay: 50 });
    
    console.log('🖱️  Clicking Sign In...');
    await page.click('#loginForm button[type="submit"]');
    
    console.log('⏳ Waiting for Dashboard to load...');
    await page.waitForSelector('.sidebar-nav', { visible: true, timeout: 10000 });
    console.log('✅ Login Successful!');

    // Wait a brief moment to ensure full render
    await new Promise(r => setTimeout(r, 2000));

    console.log('🔄 Navigating to Reports page...');
    // Look for the "Reports" sidebar link and click it
    try {
      await page.waitForSelector('a[href="#/work/reports"]', { timeout: 5000 });
      await page.click('a[href="#/work/reports"]');
    } catch (e) {
      // Fallback navigation
      console.log('⚠️ Could not click sidebar link, using direct navigation...');
      await page.goto('https://updates-aotms-mcvw.vercel.app/#/work/reports');
    }

    // Wait for the Submit Update button to appear on the Reports page
    await page.waitForSelector('#submitUpdateBtn', { visible: true, timeout: 10000 });
    console.log('✅ Reports page loaded!');

    console.log('🖱️  Clicking Submit My Daily Update...');
    await page.click('#submitUpdateBtn');

    // Wait for the modal to open
    await page.waitForSelector('#updateModal', { visible: true });
    await page.waitForSelector('#updProgress', { visible: true });
    
    console.log('⌨️  Filling out random Report Update data...');
    
    // Random progress between 10 and 100
    const randomProgress = Math.floor(Math.random() * 90) + 10;
    
    // Type in Progress
    await page.type('#updProgress', randomProgress.toString(), { delay: 50 });

    // Type in Issues
    await page.type('#updIssues', 'No major blockers today, everything is running smoothly in automated testing.', { delay: 30 });

    // Type in Plan
    await page.type('#updPlan', 'Will continue to run Puppeteer automated scripts to ensure UI functionality.', { delay: 30 });
    
    console.log('🖱️  Submitting Update...');
    // Submit the form
    await page.click('#updateForm button[type="submit"]');

    // Wait for the modal to close
    console.log('⏳ Waiting for modal to close and data to refresh...');
    await page.waitForSelector('#updateModal', { hidden: true, timeout: 10000 });
    
    // Wait a couple seconds for the API fetch and render to complete
    await new Promise(r => setTimeout(r, 3000));

    console.log('✅ Daily Update Successfully Submitted!');
    
    // Take a screenshot of the successful update submission
    console.log('📸 Taking a screenshot of the Reports page...');
    await page.screenshot({ path: 'reports-success-screenshot.png' });
    console.log('💾 Screenshot saved as reports-success-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    try {
      await page.screenshot({ path: 'reports-error-screenshot.png' });
      console.log('📸 Saved error screenshot as reports-error-screenshot.png');
    } catch (e) {}
  } finally {
    console.log('Closing browser in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
    console.log('🏁 Test completed.');
  }
})();
