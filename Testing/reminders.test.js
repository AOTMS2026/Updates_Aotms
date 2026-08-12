const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Automated Reminders Test...');
  
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

    console.log('🔄 Navigating to Reminders page...');
    // Look for the "Reminders" sidebar link and click it
    try {
      await page.waitForSelector('a[href="#/tracking/reminders"]', { timeout: 5000 });
      await page.click('a[href="#/tracking/reminders"]');
    } catch (e) {
      // Fallback navigation
      console.log('⚠️ Could not click sidebar link, using direct navigation...');
      await page.goto('https://updates-aotms-mcvw.vercel.app/#/tracking/reminders');
    }

    // Wait for the Set Reminder button to appear on the Reminders page
    await page.waitForSelector('#addReminderBtn', { visible: true, timeout: 10000 });
    console.log('✅ Reminders page loaded!');

    console.log('🖱️  Clicking + Set Reminder...');
    await page.click('#addReminderBtn');

    // Wait for the modal to open
    await page.waitForSelector('#reminderModal', { visible: true });
    await page.waitForSelector('#remTitle', { visible: true });
    
    console.log('⌨️  Filling out random Reminder data...');
    
    const randomId = Math.floor(Math.random() * 10000);
    const remTitle = `Random Automated Reminder #${randomId}`;
    
    // Type in Title
    await page.type('#remTitle', remTitle, { delay: 50 });

    // Pick a date slightly in the future (e.g. 2 hours from now)
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);
    futureDate.setMinutes(futureDate.getMinutes() - futureDate.getTimezoneOffset());
    const dateString = futureDate.toISOString().slice(0, 16);
    
    // Clear and type the datetime
    await page.click('#remTime');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#remTime', dateString);

    // Select Repeat Mode (Randomize between ONE_TIME, DAILY, WEEKLY, MONTHLY)
    const repeats = ['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY'];
    const randomRepeat = repeats[Math.floor(Math.random() * repeats.length)];
    await page.select('#remRepeat', randomRepeat);
    
    console.log('🖱️  Saving Reminder...');
    // Submit the form
    await page.click('#reminderForm button[type="submit"]');

    // Wait for the modal to close
    console.log('⏳ Waiting for modal to close and data to refresh...');
    await page.waitForSelector('#reminderModal', { hidden: true, timeout: 10000 });
    
    // Wait a couple seconds for the API fetch and render to complete
    await new Promise(r => setTimeout(r, 3000));

    console.log('✅ Reminder Successfully Set!');
    
    // Take a screenshot of the successful reminder creation
    console.log('📸 Taking a screenshot of the Reminders page...');
    await page.screenshot({ path: 'reminders-success-screenshot.png' });
    console.log('💾 Screenshot saved as reminders-success-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    try {
      await page.screenshot({ path: 'reminders-error-screenshot.png' });
      console.log('📸 Saved error screenshot as reminders-error-screenshot.png');
    } catch (e) {}
  } finally {
    console.log('Closing browser in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
    console.log('🏁 Test completed.');
  }
})();
