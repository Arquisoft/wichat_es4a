// src/e2e/steps/login-form.steps.js
const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/login-form.feature');
const i18n = require('../i18n-test-helper.js'); 
const axios = require('axios');


let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 10 });

    page = await browser.newPage();
    setDefaultOptions({ timeout: 30000 });
  });

  beforeEach(async () => {
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle0",
    });
  });

  let username, password;

  test('The user logs in successfully', ({ given, when, then }) => {
    given('A registered user with valid credentials', async () => {
      username = "validUser";
      password = "ValidPassword123";

       // Register the user if not already registered
       await axios.post('http://localhost:8000/adduser', {
        username: username,
        password: password,
        confirmPassword: password,
      });
    });

    when('I fill the login form and submit it', async () => {
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toClick('button', { text: i18n.t('login-message') });
    });

    then('I should be redirected to the homepage', async () => {
        await expect(page).toMatchElement('h1', { text: i18n.t('welcome-home') });
        

         // Hacer clic en las tres rayitas para desplegar el menú
      await page.click('.navbar-toggler');  // Esto abre el menú hamburguesa en dispositivos móviles

      // Esperamos que el botón de logout sea visible ahora
      await page.waitForSelector('nav [data-testid="logout-icon"]'); // Esperamos que el icono de logout sea visible

      // Hacemos clic en el icono de logout
      await page.click('nav [data-testid="logout-icon"]');

      // Esperamos a que el modal de confirmación aparezca
      await page.waitForSelector('.modal-footer button.btn-danger');  // Esperamos el botón de confirmación

      // Hacemos clic en el botón de "Confirmar" del modal para cerrar sesión
      await page.click('.modal-footer button.btn-danger');
    });
  });

  test('The user logs in with invalid credentials', ({ given, when, then }) => {
    given('A user with invalid credentials', async () => {
      username = "invalidUser";
      password = "WrongPassword123";
    });

    when('I fill the login form and submit it', async () => {
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
      await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
      await expect(page).toClick('button', { text: i18n.t('login-message') });
    });

    then('An error message should appear indicating invalid credentials', async () => {
      await expect(page).toMatchElement("div.alert-danger", { text: i18n.t('auth-error-bad-credentials') });
    });
  });

  test('The user attempts to log in more than 5 times with incorrect credentials and is told to try again later', ({ given, when, then }) => {
    given('A user who attempts to log in more than 5 times with incorrect credentials', async () => {
      username = "lockedUser";
      password = "WrongPassword123";
    });

    when('I attempt to log in with invalid credentials more than 5 times', async () => {
      for (let i = 0; i < 4; i++) {
        await expect(page).toFill(`input[placeholder="${i18n.t('enter-username-placeholder')}"]`, username);
        await expect(page).toFill(`input[placeholder="${i18n.t('enter-password-placeholder')}"]`, password);
        await expect(page).toClick('button', { text: i18n.t('login-message') });
      }
    });

    then('A security message should appear saying to try again later', async () => {
      await expect(page).toMatchElement("div.alert-danger", { text: i18n.t('auth-error-too-many-attempts') });
    });
  });

  

  afterAll(async () => {
    await browser.close();
  });
});
