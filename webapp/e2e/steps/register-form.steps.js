const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/register-form.feature');

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
      timeout: 180000,
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
      await page.waitForSelector('[data-testid="register-username-input"]',  {
        visible: true,
        timeout: 300000
      });

      await expect(page).toFill('[data-testid="register-username-input"]', username);
      await expect(page).toFill('[data-testid="register-password-input"]', password);
      await expect(page).toFill('[data-testid="register-confirm-password-input"]', confirmPassword);
     
      await expect(page).toClick('[data-testid="register-button"]');
      
    });

    then('A success message should appear', async () => {
      await expect(page).toMatchElement("div.alert-success");
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
      await page.waitForSelector('[data-testid="register-username-input"]',  {
        visible: true,
        timeout: 300000
      });

      await expect(page).toFill('[data-testid="register-username-input"]', username);
      await expect(page).toFill('[data-testid="register-password-input"]', password);
      await expect(page).toFill('[data-testid="register-confirm-password-input"]', confirmPassword);
     
      await expect(page).toClick('[data-testid="register-button"]');
    });

    then('An error message about password content should appear', async () => { 
      await expect(page).toMatchElement("div.alert-danger");
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
      await page.waitForSelector('[data-testid="register-username-input"]',  {
        visible: true,
        timeout: 300000
      });

      await expect(page).toFill('[data-testid="register-username-input"]', username);
      await expect(page).toFill('[data-testid="register-password-input"]', password);
      await expect(page).toFill('[data-testid="register-confirm-password-input"]', confirmPassword);
     
      await expect(page).toClick('[data-testid="register-button"]');
    });

    then('An error message about password mismatch should appear', async () => {
      await expect(page).toMatchElement("div.alert-danger");
    });
  });

  test("The user tries to register with an existing username", ({ given, when, then }) => {
    given("A user that is already registered", async () => {
      username = "alreadyExistsUser";
      password = "ValidPass123";
      confirmPassword = "ValidPass123";

      await page.waitForSelector('[data-testid="register-username-input"]',  {
        visible: true,
        timeout: 300000
      });
      // Register the user first
      await expect(page).toFill('[data-testid="register-username-input"]', username);
      await expect(page).toFill('[data-testid="register-password-input"]', password);
      await expect(page).toFill('[data-testid="register-confirm-password-input"]', confirmPassword);
     
      await expect(page).toClick('[data-testid="register-button"]');

      // Wait for the success message
      await expect(page).toMatchElement("div.alert-success");

      // Reload the page to reset the form
      await page.reload({ waitUntil: "networkidle0" });
    });

    when("I fill the registration form with the same username and submit it", async () => {
      await page.waitForSelector('[data-testid="register-username-input"]',  {
        visible: true,
        timeout: 300000
      });

      await expect(page).toFill('[data-testid="register-username-input"]', username);
      await expect(page).toFill('[data-testid="register-password-input"]', password);
      await expect(page).toFill('[data-testid="register-confirm-password-input"]', confirmPassword);
     
      await expect(page).toClick('[data-testid="register-button"]');
    });

    then("An error message about existing username should appear", async () => {
      await expect(page).toMatchElement("div.alert-danger");
    });
  });


  afterAll(async () => {
    await browser.close();
  });
});
