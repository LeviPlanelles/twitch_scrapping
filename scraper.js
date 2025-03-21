const puppeteer = require('puppeteer');
const { ipcMain } = require('electron');

function scrapeTwitch(mainWindow) {
    (async () => {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        await page.goto('https://www.twitch.tv/');
        
        await page.waitForSelector('[data-a-target="consent-banner-accept"]');
        await page.click('[data-a-target="consent-banner-accept"]');

        await page.waitForSelector('[data-test-selector="recommended-channel"]');

        const recomendados = await page.evaluate(() => {
            const items = document.querySelectorAll('[data-test-selector="recommended-channel"]');
            const arr = [];
            for (let item of items) {
                const canal = {};
                canal.name = item.querySelector('[data-a-target="side-nav-title"]')?.innerText || 'Sin nombre';
                canal.image = item.querySelector('div > img')?.src || 'https://via.placeholder.com/150';
                canal.category = item.querySelector('[data-a-target="side-nav-game-title"] > p')?.innerText || 'Sin categoría';
                canal.viewers = item.querySelector('[data-a-target="side-nav-live-status"] span')?.innerText || '0';
                const linkElement = item.querySelector('a');
                canal.url = linkElement ? linkElement.href : 'https://www.twitch.tv/';
                //canal.url = item.querySelector('[data-test-selector="recommended-channel"]').href;
                arr.push(canal);
            }
            return arr;
        });

        // Enviar los datos a la ventana de Electron
        mainWindow.webContents.send('scraping-data', recomendados);

        await browser.close();
    })();
}

module.exports = { scrapeTwitch };