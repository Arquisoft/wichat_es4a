import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AddUser } from './AddUser';
import { MemoryRouter } from 'react-router';
import i18n from 'i18next';

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
    );
  }

  // Function to fill the form and submit it with the given values
  const fillAndSubmitForm = async ({ username, password, confirmPassword }) => {
    const usernameText = i18n.t('username-message');
    const passwordText = i18n.t('password-message');
    const passwordConfirmText = i18n.t('password-edit-confirm');

    const usernameInput = screen.getByLabelText(usernameText);
    const passwordInput = screen.getByLabelText(passwordText);
    const passwordConfirm = screen.getByLabelText(passwordConfirmText);
    const addUserButton = screen.getByRole('button', { name: /Sign Up/i });

    await act(async () => {
      if (username) await userEvent.type(usernameInput, username);
      if (password) await userEvent.type(passwordInput, password);
      if (confirmPassword) await userEvent.type(passwordConfirm, confirmPassword);
      await userEvent.click(addUserButton);
    });
  };

  it('should add user successfully and show confirmation message', async () => {
    renderComponent();

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/adduser').reply(200);

    await fillAndSubmitForm({
      username: 'testUser',
      password: 'testPassword1',
      confirmPassword: 'testPassword1'
    });

    const confirmMessage = i18n.t('user-added');
    expect(screen.getByText(confirmMessage)).toBeInTheDocument();
  });

  it('should show error because password is not secure', async () => {
    renderComponent();

    await fillAndSubmitForm({
      username: 'testUser',
      password: 'test',
      confirmPassword: 'test'
    });

    const errorMessage = i18n.t('user-not-added') + i18n.t('password-error-content');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show error because password and confirm password do not match', async () => {
    render(
        <MemoryRouter>
          <AddUser />
        </MemoryRouter>
    );

    await fillAndSubmitForm({
      username: 'testUser',
      password: 'testPassword1',
      confirmPassword: 'testPassword2'
    });

    const errorMessage = i18n.t('user-not-added') + i18n.t('password-mismatch-error');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});