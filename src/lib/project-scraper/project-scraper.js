import webdriver, {
    By
} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';
// const {
//     By
// } = webdriver;

const downloadProjects = async () => {
    const chromeCapabilities = webdriver.Capabilities.chrome();

    chromeCapabilities.set('goog:chromeOptions', {
        'args': ['disable-infobars'],
        'prefs': {
            'download': {
                'default_directory': 'C:\\Users\\nicho\\Downloads\\scratch-downloads',
                'prompt_for_download': 'false'
            }, 
            'profile.default_content_setting_values.automatic_downloads': 1
        }
    });

    var driver = new webdriver.Builder()
        .withCapabilities(chromeCapabilities)
        .build();

    if (process.argv[2] == 'search') {
        var searchURL = 'https://scratch.mit.edu/search/projects?q=' + process.argv[3];
        await driver.get(searchURL);

        const buttons = await driver.findElements(By.className('button'));

        var nextButton;

        for (let i = 0; i < buttons.length; i++) {
            var text = await buttons[i].getAttribute('innerText');
            if (text == 'Load More') {
                nextButton = buttons[i];
            }
        }

        const projectURLs = [];

        var projects = await driver.findElements(By.className('thumbnail-image'));

        while (projects.length < process.argv[4]) {
            nextButton.click();
            projects = await driver.findElements(By.className('thumbnail-image'));
        }

        for (let i = 0; i < projects.length; i++) {
            var href = await projects[i].getAttribute('href');
            // projectURLs.push(href.match(/\d+/)[0]);
            projectURLs.push(href.substring(0, href.length - 1));
        }

        await driver.get('C:\\Users\\nicho\\Documents\\Development\\srs-chatbot-2021\\scratch-gui\\src\\lib\\project-scraper\\index.html');

        // const inputBar = await driver.findElement(By.id('project-select'));

        const downloadButtons = await driver.findElements(By.className('download-button'));

        const generateSb3Button = downloadButtons[2];

        for (let i = 0; i < projectURLs.length; i++) {
            var url = projectURLs[i];
            var script = "document.getElementById('project-select').setAttribute('value', '" + url + "');";
            await driver.executeScript(script);


            generateSb3Button.click();

            // download(url, 'sb3');

        };

    }

    // driver.close();
}

downloadProjects();
