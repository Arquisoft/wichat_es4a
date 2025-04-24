const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/register-form.feature');
const i18n = require('../i18n-test-helper.js');


let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 10 });

    page = await browser.newPage();
    setDefaultOptions({ timeout: 10000 });
  });

  beforeEach(async () => {
    await page.goto("http://localhost:3000/adduser", {
      waitUntil: "networkidle0",
    });
  });

  let username, password, confirmPassword;

  test('The user is not registered in the site', ({ given, when, then }) => {
    given('An unregistered user', async () => {
      const timestamp = Date.now();
      username = `user${timestamp}`;
      password = "Test1234";
      confirmPassword = "Test1234";
    });

    when('I fill the registration form and submit it', async () => {
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-confirm-password-placeholder')}"]`, confirmPassword);
      await expect(page).toClick('button', { text: i18n.t('signup-message') });
    });

    then('A success message should appear', async () => {
      await expect(page).toMatchElement("div.alert-success", { text: i18n.t('user-added') });
    });
  });

  test('The user is not registered but the password is invalid', ({ given, when, then }) => {
    given('An unregistered user with an invalid password', async () => {
      const timestamp = Date.now();
      username = `invalidpass${timestamp}`;
      password = "abc";
      confirmPassword = "abc";
    });

    when('I fill the registration form and submit it', async () => {
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-confirm-password-placeholder')}"]`, confirmPassword);
      await expect(page).toClick('button', { text: i18n.t('signup-message') });
    });

    then('An error message about password content should appear', async () => { 
      await expect(page).toMatchElement("div.alert-danger", { text: i18n.t('password-error-content') });
    });
  });

  test("The user is not registered, the password is valid but they don't match", ({ given, when, then }) => {
    given('An unregistered user with valid but mismatching passwords', async () => {
      const timestamp = Date.now();
      username = `mismatch${timestamp}`;
      password = "ValidPass1";
      confirmPassword = "DifferentPass1";
    });

    when('I fill the registration form and submit it', async () => {
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-confirm-password-placeholder')}"]`, confirmPassword);
      await expect(page).toClick('button', { text: i18n.t('signup-message') });
    });

    then('An error message about password mismatch should appear', async () => {
      await expect(page).toMatchElement("div.alert-danger", { text: i18n.t('password-mismatch-error') });
    });
  });

  test("The user tries to register with an existing username", ({ given, when, then }) => {
    given("A user that is already registered", async () => {
      username = "alreadyExistsUser";
      password = "ValidPass123";
      confirmPassword = "ValidPass123";

      // Register the user first
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-confirm-password-placeholder')}"]`, confirmPassword);
      await expect(page).toClick('button', { text: i18n.t('signup-message') });

      // Wait for the success message
      await expect(page).toMatchElement("div.alert-success", { text: i18n.t('user-added') });

      // Reload the page to reset the form
      await page.reload({ waitUntil: "networkidle0" });
    });

    when("I fill the registration form with the same username and submit it", async () => {
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-confirm-password-placeholder')}"]`, confirmPassword);
      await expect(page).toClick('button', { text: i18n.t('signup-message') });
    });

    then("An error message about existing username should appear", async () => {
      await expect(page).toMatchElement("div.alert-danger", { text: i18n.t('user-not-added') + i18n.t('username-already-exists') });
    });
  });


  afterAll(async () => {
    await browser.close();
  });
});
