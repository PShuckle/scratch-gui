// adapted from https://forkphorus.github.io/sb-downloader/

import webdriver, {
    By
} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';

const downloadProjects = async () => {
    // set options for Chrome browser
    const chromeCapabilities = webdriver.Capabilities.chrome();

    chromeCapabilities.set('goog:chromeOptions', {
        'args': ['disable-infobars'],
        'prefs': {
            'download': {
                // CHANGE THIS
                'default_directory': 'C:\\Users\\nicho\\Downloads\\scratch-downloads',
                'prompt_for_download': 'false'
            },
            'profile.default_content_setting_values.automatic_downloads': 1
        }
    });

    var driver = new webdriver.Builder()
        .withCapabilities(chromeCapabilities)
        .build();

    const projectURLs = [];

    // get list of projects by search term
    if (process.argv[2] == 'search') {
        // search for the search term on scratch
        var searchURL = 'https://scratch.mit.edu/search/projects?q=' + process.argv[3];
        await driver.get(searchURL);

        const buttons = await driver.findElements(By.className('button'));

        // find the button that allows loading more projects
        var nextButton;

        for (let i = 0; i < buttons.length; i++) {
            var text = await buttons[i].getAttribute('innerText');
            if (text == 'Load More') {
                nextButton = buttons[i];
            }
        }

        // create list of IDs of matching projects
        var projects = await driver.findElements(By.className('thumbnail-image'));

        while (projects.length < process.argv[4]) {
            nextButton.click();
            projects = await driver.findElements(By.className('thumbnail-image'));
        }

        for (let i = 0; i < projects.length; i++) {
            var href = await projects[i].getAttribute('href');
            projectURLs.push(href.substring(0, href.length - 1));
        }

    } else if (process.argv[2] == 'url') {
        // get ID of a single project
        projectURLs.push(process.argv[3]);
    }

    await driver.get(process.cwd() + '\\src\\lib\\project-scraper\\index.html');

    const downloadButtons = await driver.findElements(By.className('download-button'));

    const generateSb3Button = downloadButtons[2];

    for (let i = 0; i < projectURLs.length; i++) {
        var url = projectURLs[i];

        // write the project id into the user input box
        var script = "document.getElementById('project-select').setAttribute('value', '" + url + "');";
        await driver.executeScript(script);

        generateSb3Button.click();
    };
}

downloadProjects();
