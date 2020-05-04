const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
const colors = require('colors');
const Table = require('cli-table');

console.log(`
_______   _ _           _   ____        _   
|__   __| (_) |         | | |  _ \\      | |  
   | |_ __ _| |__   __ _| | | |_) | ___ | |_ 
   | | '__| | '_ \\ / _' | | |  _ < / _ \\| __|
   | | |  | | |_) | (_| | | | |_) | (_) | |_ 
   |_|_|  |_|_.__/ \\__,_|_| |____/ \\___/ \\__|                                                                                         
`.magenta)

console.log('\nCreated by: John Bortotti\n')
const username = prompt('username: ');
const password = prompt('password: ');

const main = async (username, password) => {

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.tribalwars.net/en-dk/');


  // Login //

  // Username Input //
  const usernameInput = await page.$('#user');
  await usernameInput.click();
  await page.keyboard.type(`${username}`);

  // Password Input //
  const passwordInput = await page.$('#password');
  await passwordInput.click();
  await page.keyboard.type(`${password}`);

  // Submit Button //
  const submitButton = await page.$('.btn-login');
  await submitButton.click();
  await page.waitFor(5000)
  if (!await page.$('#headerlink-logout')) { // -> Verify if logout link is displayed
    console.log("\n- Can't Login -".red)
    process.exit()
  } else {
    console.log('\n+ Logged In +\n'.green)
    // Select World // 
    const currentWorld = await page.$('.world_button_active'); // -> Select the first current world
    await currentWorld.click();
    await page.waitForNavigation();
  }
  // ---------------------------------------------------------------------- //

  // Show Resources //

  const woodElement = await page.$('#wood'); // -> wood
  const woodValue = await page.evaluate(el => el.textContent, woodElement) // -> wood

  const clayElement = await page.$('#stone'); // -> clay
  const clayValue = await page.evaluate(el => el.textContent, clayElement) // -> clay

  const ironElement = await page.$('#iron'); // -> iron
  const ironValue = await page.evaluate(el => el.textContent, ironElement) // -> iron

  const storageElement = await page.$('#storage'); // -> storage capacity
  const storageValue = await page.evaluate(el => el.textContent, storageElement) // -> storage capacity

  const currFarmElement = await page.$('#pop_current_label'); // -> current farm
  const currFarmValue = await page.evaluate(el => el.textContent, currFarmElement) // -> current farm

  const maxFarmElement = await page.$('#pop_max_label'); // -> max farm
  const maxFarmValue = await page.evaluate(el => el.textContent, maxFarmElement) // -> max farm

  const resourcesTable = new Table({
    head: ['Resource', 'Value'],
    colWidths: [20, 25],
    chars: { 'top': '-' , 'top-mid': '+' , 'top-left': '+' , 'top-right': '+'
         , 'bottom': '-' , 'bottom-mid': '-' , 'bottom-left': '+' , 'bottom-right': '+'
         , 'left': '|' , 'left-mid': '|' , 'mid': '-' , 'mid-mid': '-'
         , 'right': '|' , 'right-mid': '|' , 'middle': '|' }
  });

  resourcesTable.push(
    [`Wood`, `${woodValue}`],
    [`Clay`, `${clayValue}`],
    [`Iron`, `${ironValue}`],
    [`Storage`, `${storageValue}`],
    [`Farm`, `${currFarmValue}/${maxFarmValue}` ]    
  );

  console.log(resourcesTable.toString());

  // ---------------------------------------------------------------- //

}

main(username, password)
