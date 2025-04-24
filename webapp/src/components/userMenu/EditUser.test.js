import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { EditUser } from './EditUser';
import { AuthProvider } from '../contextProviders/AuthContext';
import { MemoryRouter } from 'react-router';
import i18n from 'i18next';

const mockAxios = new MockAdapter(axios);

// Mock the changePassword function from UserProfileService
// This is necessary to avoid making actual API calls during the tests
jest.mock('../../services/UserProfileService', () => ({
  changePassword: jest.fn()
}));
import { changePassword } from '../../services/UserProfileService';
  

describe('EditUser component', () => {
  const renderComponent = () =>
    render(
      <AuthProvider>
        <MemoryRouter>
          <EditUser userName="testUser" />
        </MemoryRouter>
      </AuthProvider>
    );

  beforeEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  it('should show error when password and confirm password do not match', async () => {
    renderComponent();

    await act(async () => {
        await userEvent.type(screen.getByLabelText(i18n.t('current-password')), 'OldPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit')), 'NewPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit-confirm')), 'DifferentPassword');
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: i18n.t('save-changes-button') }));
    });

    expect(screen.getByText(i18n.t('password-mismatch-error'))).toBeInTheDocument();
  });

  it('should show error when password does not meet content requirements', async () => {
    renderComponent();
    await act(async () => {
        await userEvent.type(screen.getByLabelText(i18n.t('current-password')), 'OldPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit')), 'weakpass');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit-confirm')), 'weakpass');
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: i18n.t('save-changes-button') }));
    });

    expect(screen.getByText(i18n.t('password-error-content'))).toBeInTheDocument();
  });

  it('should update password successfully and show modal', async () => {
    //This line prepares the mock to return a successful response when the changePassword function is called
    changePassword.mockResolvedValue({ success: true });

    renderComponent();
    await act(async () => {
        await userEvent.type(screen.getByLabelText(i18n.t('current-password')), 'OldPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit')), 'NewPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit-confirm')), 'NewPassword1');
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: i18n.t('save-changes-button') }));
    });

    expect(await screen.findByText(i18n.t('password-update-success'))).toBeInTheDocument();
  });

  it('should show server error message if password update fails', async () => {
    //This line prepares the mock to return a wrong response when the changePassword function is called
    //In this case, we simulate a server error by throwing an error
    changePassword.mockRejectedValue(new Error('Server error'));

    renderComponent();
    await act(async () => {
        await userEvent.type(screen.getByLabelText(i18n.t('current-password')), 'OldPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit')), 'NewPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit-confirm')), 'NewPassword1');
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: i18n.t('save-changes-button') }));
    });

    expect(await screen.findByText(i18n.t('password-update-failure'))).toBeInTheDocument();
  });

  it('should show error from response if update fails due to bad current password', async () => {
    //This line prepares the mock to return a wrong response when the changePassword function is called
    changePassword.mockResolvedValue({ success: false, error: 'Incorrect current password' });

    renderComponent();
    await act(async () => {
        await userEvent.type(screen.getByLabelText(i18n.t('current-password')), 'wrongPassword');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit')), 'NewPassword1');
        await userEvent.type(screen.getByLabelText(i18n.t('password-edit-confirm')), 'NewPassword1');
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: i18n.t('save-changes-button') }));
    });

    expect(await screen.findByText('Incorrect current password')).toBeInTheDocument();
  });
});
