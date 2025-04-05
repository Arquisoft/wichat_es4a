import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Login } from './Login';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './contextProviders/AuthContext';
import i18n from 'i18next';

const mockAxios = new MockAdapter(axios);

describe('Login component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should log in successfully and show a confirmation message', async () => {
    // Render the Login component with i18n in English and MemoryRouter
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    // Gets the username and password labels from i18n translations
    const usernameText = i18n.t('username-message');
    const passwordText = i18n.t('password-message');

    // Get the username and password input fields and the login button
    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/login').reply(200, { success: true });

    // Use act to wrap the user interactions
    await act(async () => {
      // Simulate user input
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'testPassword');
      await userEvent.click(loginButton);
    });

    // Verify that the confirm login message is displayed
    const confirmMessage = i18n.t('login-success');
    expect(screen.getByText(confirmMessage)).toBeInTheDocument();
  });


  it('should handle error when logging in and show an error message', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    // Gets the username and password labels from i18n translations
    const usernameText = i18n.t('username-message');
    const passwordText = i18n.t('password-message');

    // Get the username and password input fields and the login button
    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Mock the axios.post request to simulate an error response
    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Unauthorized' });

    // Use act to wrap the user interactions
    await act(async () => {
      // Simulate user input
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'testPassword');
      await userEvent.click(loginButton);
    });

    // Verify that the error login message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
