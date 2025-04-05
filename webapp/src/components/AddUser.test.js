import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AddUser } from './AddUser';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './contextProviders/AuthContext';
import i18n from 'i18next';

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should add user successfully and show confirmation message', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AddUser />
        </MemoryRouter>
      </AuthProvider>
    );

    const usernameText = i18n.t('username-message');
    const passwordText = i18n.t('password-message');
    const passwordConfirmText = i18n.t('password-edit-confirm');

    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const passwordConfirm = screen.getByLabelText(passwordConfirmText);
    const addUserButton = screen.getByRole('button', { name: /Sign Up/i });

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/adduser').reply(200);

    // Use act to wrap the user interactions
    await act(async () => {
      // Simulate user input
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'testPassword1');
      await userEvent.type(passwordConfirm, 'testPassword1');
      await userEvent.click(addUserButton);
    });

    const confirmMessage = i18n.t('user-added');
    expect(screen.getByText(confirmMessage)).toBeInTheDocument();
  });

  it('should show error because password is not secure', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AddUser />
        </MemoryRouter>
      </AuthProvider>
    );

    const usernameText = i18n.t('username-message');
    const passwordText = i18n.t('password-message');
    const passwordConfirmText = i18n.t('password-edit-confirm');

    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const passwordConfirm = screen.getByLabelText(passwordConfirmText);
    const addUserButton = screen.getByRole('button', { name: /Sign Up/i });

    // Use act to wrap the user interactions
    await act(async () => {
      // Simulate user input
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'test');
      await userEvent.type(passwordConfirm, 'test');
      await userEvent.click(addUserButton);
    });

    const errorMessage = i18n.t('user-not-added') + i18n.t('password-error-content');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show error because password and confirm password do not match', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AddUser />
        </MemoryRouter>
      </AuthProvider>
    );

    const usernameText = i18n.t('username-message');
    const passwordText = i18n.t('password-message');
    const passwordConfirmText = i18n.t('password-edit-confirm');

    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const passwordConfirm = screen.getByLabelText(passwordConfirmText);
    const addUserButton = screen.getByRole('button', { name: /Sign Up/i });

    // Use act to wrap the user interactions
    await act(async () => {
      // Simulate user input
      await userEvent.type(usernameInput, 'testUser');
      await userEvent.type(passwordInput, 'testPassword1');
      await userEvent.type(passwordConfirm, 'testPassword2');
      await userEvent.click(addUserButton);
    });

    const errorMessage = i18n.t('user-not-added') + i18n.t('password-mismatch-error');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
