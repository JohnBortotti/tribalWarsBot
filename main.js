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
const delayTime = prompt('Delay for actions (in minutes): ')

function sleep(milliseconds) { 
  let timeStart = new Date().getTime(); 
  while (true) { 
      let elapsedTime = new Date().getTime() - timeStart; 
      if (elapsedTime > milliseconds) { 
          break; 
      } 
  } 
} 


const launchAndGetPage = async() => {

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.tribalwars.net/en-dk/');

  return page;
}

const login = async(instance, usr, password) => {

  const usernameInput = await instance.$('#user');
  await usernameInput.click();
  await instance.keyboard.type(`${usr}`);

  const passwordInput = await instance.$('#password');
  await passwordInput.click();
  await instance.keyboard.type(`${password}`);

  const submitButton = await instance.$('.btn-login');
  await submitButton.click();
  await instance.waitFor(5000)
  if (!await instance.$('#headerlink-logout')) { // -> Verify if logout link is displayed
    console.log("\n- Can't Login -".red)
    process.exit()
  } 
  else {
    console.log('\n+ Logged In +\n'.green)
    const currentWorld = await instance.$('.world_button_active'); // -> Select the first current world
    await currentWorld.click();
    await instance.waitForNavigation();
  }

  return instance;

}


const showResources = async(instance) => {

  const woodElement = await instance.$('#wood'); // -> wood
  const woodValue = await instance.evaluate(el => el.textContent, woodElement) // -> wood

  const clayElement = await instance.$('#stone'); // -> clay
  const clayValue = await instance.evaluate(el => el.textContent, clayElement) // -> clay

  const ironElement = await instance.$('#iron'); // -> iron
  const ironValue = await instance.evaluate(el => el.textContent, ironElement) // -> iron

  const storageElement = await instance.$('#storage'); // -> storage capacity
  const storageValue = await instance.evaluate(el => el.textContent, storageElement) // -> storage capacity

  const currFarmElement = await instance.$('#pop_current_label'); // -> current farm
  const currFarmValue = await instance.evaluate(el => el.textContent, currFarmElement) // -> current farm

  const maxFarmElement = await instance.$('#pop_max_label'); // -> max farm
  const maxFarmValue = await instance.evaluate(el => el.textContent, maxFarmElement) // -> max farm

  const resourcesTable = new Table({
    chars: { 'top': '-' , 'top-mid': '+' , 'top-left': '+' , 'top-right': '+'
         , 'bottom': '-' , 'bottom-mid': '-' , 'bottom-left': '+' , 'bottom-right': '+'
         , 'left': '|' , 'left-mid': '|' , 'mid': '-' , 'mid-mid': '-'
         , 'right': '|' , 'right-mid': '|' , 'middle': '|' }
  });

  resourcesTable.push(
    [`Wood`, `Clay`, `Iron`, `Storage`, `Farm`],
    [`${woodValue}`, `${clayValue}`, `${ironValue}`, `${storageValue}`, `${currFarmValue}/${maxFarmValue}` ]
  );

  console.log(resourcesTable.toString() + '\n');

  return instance;
}

const gotoUpdatesPage = async(instance) => {
  const headquarters = await instance.$('canvas.visual-anim:nth-child(31)');
  await headquarters.click();
  await instance.waitForNavigation();

  return instance
}


const updateBuilding = async(instance, building) => {
  console.log(`+ Trying to update ${building} +`.yellow)
  //const buildingRow = await instance.$(`#main_buildrow_${building} > td:nth-child(7)`)  
  //await buildingRow.click();
}

launchAndGetPage()
  .then(page => login(page, username, password))
  .then(page => showResources(page))
  .then(page => gotoUpdatesPage(page))
  .then(page => { while(true) {
    updateBuilding(page, 'headquarters')
    sleep(delayTime * 60000)
  }
  })
