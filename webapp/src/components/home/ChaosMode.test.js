import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChaosButton } from './ChaosMode';
import { TextEncoder } from 'util';

// Ensures global availability of TextEncoder, required in some environments for encoding operations
global.TextEncoder = TextEncoder;

// Create a mock function to simulate setConfig from the context
const mockSetConfig = jest.fn();

// Mock the useConfig hook to inject the mocked setConfig function
jest.mock('../contextProviders/GameConfigProvider', () => ({
  useConfig: () => ({
    setConfig: mockSetConfig,
  }),
}));

// Mock i18n translation hook to return keys directly, avoiding the need for translations during testing
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('ChaosButton component', () => {
  beforeEach(() => {
    // Clear all mocks to ensure test isolation
    jest.clearAllMocks();
    // Reset window.location to a mutable object so we can test redirection
    delete window.location;
    window.location = { href: '' };
  });

  it('renders chaos mode button', () => {
    // Render the component
    render(<ChaosButton />);
    // Check if the chaos mode button is rendered
    expect(screen.getByText('chaosMode-home')).toBeInTheDocument();
  });

  it('shows chaos mode modal on click', async () => {
    // Render the component
    render(<ChaosButton />);
    const button = screen.getByText('chaosMode-home');

    // Simulate user clicking the chaos mode button
    await act(async () => {
      await userEvent.click(button);
    });

    // Check that modal content appears after clicking
    expect(screen.getByText('chaosMode-intro-title')).toBeInTheDocument();
    expect(screen.getByText('chaosMode-intro-body')).toBeInTheDocument();
    expect(screen.getByText('playChaos')).toBeInTheDocument();
  });

  it('triggers chaos config and redirects on Play Chaos click', async () => {
    // Render the component
    render(<ChaosButton />);
    const chaosButton = screen.getByText('chaosMode-home');

    // Open the chaos mode modal
    await act(async () => {
      await userEvent.click(chaosButton);
    });

    // Find and click the "Play Chaos" button
    const playChaosButton = screen.getByText('playChaos');

    await act(async () => {
      await userEvent.click(playChaosButton);
    });

    // Ensure setConfig was called with a valid chaos mode configuration
    expect(mockSetConfig).toHaveBeenCalledWith(expect.objectContaining({
      questions: expect.any(Number),
      timePerRound: expect.any(Number),
      topics: expect.any(Array),
      isChaos: true
    }));

    // Ensure the page redirected to the /game route
    expect(window.location.href).toBe('/game');
  });
});
