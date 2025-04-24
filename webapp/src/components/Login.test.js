import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import { MemoryRouter } from 'react-router';
import i18n from 'i18next';
import AuthContext from './contextProviders/AuthContext';

const mockLogin = jest.fn();

// It makes the import of the AuthContext to be mocked so it's not the real one
// and it uses the mock one instead
jest.mock('./contextProviders/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext({});
  return {
    __esModule: true,
    default: AuthContext,
  };
});

// Function thta renders the component with the AuthContext provider with the login function mocked
const renderWithAuth = (ui) => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Login component', () => {
  const usernameText = i18n.t('username-message');
  const passwordText = i18n.t('password-message');

  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('should log in successfully and show a confirmation message', async () => {
    mockLogin.mockImplementation((user, pass, callback) => {
      callback({ success: true });
    });

    renderWithAuth(<Login />);

    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Input the username and password and click the login button
    await act(async () => {
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'testPassword');
      await userEvent.click(loginButton);
    });

    expect(screen.getByText(i18n.t('login-success'))).toBeInTheDocument();
  });

  it('should show an error message on failed login', async () => {
    mockLogin.mockImplementation((user, pass, callback) => {
      callback({ success: false, error: 'Invalid credentials' });
    });

    renderWithAuth(<Login />);

    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Input the username and password and click the login button
    await act(async () => {
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'wrongPassword');
      await userEvent.click(loginButton);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});