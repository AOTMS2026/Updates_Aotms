const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Automated Tasks Test...');
  
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

    console.log('🔄 Navigating to Tasks page...');
    // Look for the "Tasks" sidebar link and click it
    try {
      await page.waitForSelector('a[href="#/work/tasks"]', { timeout: 5000 });
      await page.click('a[href="#/work/tasks"]');
    } catch (e) {
      // Fallback navigation
      console.log('⚠️ Could not click sidebar link, using direct navigation...');
      await page.goto('https://updates-aotms-mcvw.vercel.app/#/work/tasks');
    }

    // Wait for the Add Task button to appear on the Tasks page
    await page.waitForSelector('#addTaskBtn', { visible: true, timeout: 10000 });
    console.log('✅ Tasks page loaded!');

    console.log('🖱️  Clicking + New Task...');
    await page.click('#addTaskBtn');

    // Wait for the modal to open
    await page.waitForSelector('#taskModal', { visible: true });
    await page.waitForSelector('#taskTitle', { visible: true });
    
    console.log('⌨️  Filling out random Task data...');
    
    const randomId = Math.floor(Math.random() * 10000);
    const taskTitle = `Random Automated Feature Task #${randomId}`;
    
    // Type in Title
    await page.type('#taskTitle', taskTitle, { delay: 50 });
    
    // Select Priority (Randomize between LOW, MEDIUM, HIGH)
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    await page.select('#taskPriority', randomPriority);

    // Select Status (Randomize)
    const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    await page.select('#taskStatus', randomStatus);
    
    console.log('🖱️  Saving Task...');
    // Submit the form
    await page.click('#taskForm button[type="submit"]');

    // Wait for the modal to close
    console.log('⏳ Waiting for modal to close and data to refresh...');
    await page.waitForSelector('#taskModal', { hidden: true, timeout: 10000 });
    
    // Wait a couple seconds for the API fetch and render to complete
    await new Promise(r => setTimeout(r, 3000));

    console.log('✅ Task Successfully Added!');
    
    // Take a screenshot of the successful registration
    console.log('📸 Taking a screenshot of the Tasks page...');
    await page.screenshot({ path: 'tasks-success-screenshot.png' });
    console.log('💾 Screenshot saved as tasks-success-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    try {
      await page.screenshot({ path: 'tasks-error-screenshot.png' });
      console.log('📸 Saved error screenshot as tasks-error-screenshot.png');
    } catch (e) {}
  } finally {
    console.log('Closing browser in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
    console.log('🏁 Test completed.');
  }
})();
