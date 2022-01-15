from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import sys
import os

DOWNLOAD_PATH = 'C:\\Users\\nicho\\Downloads\\scratch-downloads'

chrome_options = webdriver.ChromeOptions()
chrome_options.add_experimental_option("detach", True)

chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--incognito")

prefs = {"download.default_directory": DOWNLOAD_PATH}
chrome_options.add_experimental_option("prefs", prefs)

browser = webdriver.Chrome(
    executable_path=ChromeDriverManager().install(), options=chrome_options)

searchURL = ''

if (sys.argv[1] == 'search'):
    searchURL = 'https://scratch.mit.edu/search/projects?q=' + sys.argv[2]
    browser.get(searchURL)

    projects = browser.find_elements(By.CLASS_NAME, 'thumbnail-image')

    projectURLs = []

    for project in projects:

        projectURLs.append(project.get_attribute('href'))
elif sys.argv[1] == 'url':
    projectURLs = ['https://scratch.mit.edu/projects/' + sys.argv[2] + '/']


print(projectURLs)

for projURL in projectURLs:
    path, dirs, files = next(os.walk(DOWNLOAD_PATH))
    fileCount = len(files)

    browser.get(projURL + 'editor/')

    loader = browser.find_elements(By.CLASS_NAME, 'loader_background_2DPrW')

    while len(loader) != 0:
        loader = browser.find_elements(
            By.CLASS_NAME, 'loader_background_2DPrW')

    menuBarItems = browser.find_elements(
        By.CLASS_NAME, 'menu-bar_hoverable_c6WFB')

    while len(menuBarItems) == 0:
        print(menuBarItems)
        menuBarItems = browser.find_elements(
            By.CLASS_NAME, 'menu-bar_hoverable_c6WFB')

    for i in range(len(menuBarItems)):
        if (menuBarItems[i].text) == 'File':
            menuBarItems[i].click()

    fileMenuItems = browser.find_elements(
        By.CLASS_NAME, "menu_hoverable_3u9dt")

    for i in range(len(fileMenuItems)):
        if (fileMenuItems[i].text) == 'Save to your computer':
            fileMenuItems[i].click()

    newFileCount = fileCount
    while (newFileCount == fileCount):
        path, dirs, files = next(os.walk(DOWNLOAD_PATH))
        newFileCount = len(files)
    

