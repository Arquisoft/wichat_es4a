const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/change-password.feature');
const i18n = require('../i18n-test-helper.js');
const { expect } = require('expect-puppeteer');
const axios = require('axios');

let page;
let browser;

const username = "validUser";
const password = "ValidPassword123";

/**
 * Auxiliar method that registers a user with the username "validUser" and the password "ValidPassword123".
 */
const registerNewUser = async () => {
    // Register the user if not already registered
    await axios.post('http://localhost:8000/adduser', {
        username: username,
        password: password,
        confirmPassword: password,
    });
}

/**
 * Auxiliar method that logs in with the registered user and goes to the user page.
 * The user has the username "validUser" and the password "ValidPassword123".
 */
const setupAuthenticatedUser = async () => {
    // Log in with the user's credentials
    await axios.post('http://localhost:8000/login', {
        username: username,
        password: password,
    });

    // Goes to the user page after logging in
    await page.goto("http://localhost:3000/user", {
        waitUntil: "networkidle0",
    });
}

defineFeature(feature, test => {

    // Launches the tests in a headless browser or a non-headless browser based on the environment (GITHUB_ACTIONS)
    // Sets the default timeout for Puppeteer actions to 30 seconds
    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            : await puppeteer.launch({ headless: false, slowMo: 10 });

        page = await browser.newPage();
        setDefaultOptions({ timeout: 30000 });

        registerNewUser();
    });

    // Redirects to the home page and waits for the page to load
    beforeEach(async () => {
        await page.goto("http://localhost:3000/", {
            waitUntil: "networkidle0",
        });
    });

    test('User successfully changes their password', ({ given, when, then }) => {
        const newPassword = 'NewValidPassword123';

        given('A user logged in', async () => {
            setupAuthenticatedUser();
        });

        when('They fill in the change password form and submit it', async () => {
            

            await expect(page).toFill('[data-testid="current-password-input"]', password)
            await expect(page).toFill('[data-testid="new-password-input"]', newPassword)
            await expect(page).toFill('[data-testid="confirm-new-password-input"]', newPassword)

            await expect(page).toClick('button', { text: i18n.t('save-changes-button') });
        });

        then('A confirmation modal should be shown', async () => {
            await expect(page).toMatchElement('span', { text: i18n.t('modal-title-edit-profile') });
        });
        then('The password should be updated for their account', async () => {
            await page.goto("http://localhost:3000/", {
                waitUntil: "networkidle0",
            });

            await expect(page).toClick('button', { text: i18n.t('logout-message') });

            // Waits for the logout icon to be visible
            await page.waitForSelector('nav [data-testid="logout-icon"]');
            // logs out
            await page.click('nav [data-testid="logout-icon"]');
            // Tries to log in with the old password
            await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
            await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
            await expect(page).toClick('button', { text: i18n.t('login-message') });
            await expect(page).toMatchElement("div.alert-danger", { text: i18n.t('password-error-content') });
            // Tries to log in with the new password
            await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
            await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, newPassword);
            await expect(page).toClick('button', { text: i18n.t('login-message') });

            await expect(page).toMatchElement('h1', { text: i18n.t('welcome-home') });
        });

    });
});