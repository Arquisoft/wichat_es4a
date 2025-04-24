import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Home } from './Home';
import i18n from 'i18next';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

// Mocking the Configuration component to control its behavior in tests
jest.mock('./Configuration', () => ({ onClose }) => (
  <div>
    <p>Configuration Component</p>
    <button onClick={onClose}>Close</button>
  </div>
));

// Mocking the NavBar component so it doesn't interfere with the test output
jest.mock('../NavBar', () => () => <div>Mocked NavBar</div>);

// Mocks the translation hook from react-i18next to return the key itself
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Returns the key instead of a translated string
  }),
}));

describe('Home component', () => {
  // Test to check that the main elements render correctly
  it('renders the initial content properly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

     // Verifies that key elements are present in the DOM
    expect(screen.getByText('welcome-home')).toBeInTheDocument();
    expect(screen.getByText('quickGame-home')).toBeInTheDocument();
    expect(screen.getByText('chaosMode-home')).toBeInTheDocument();
    expect(screen.getByText('Mocked NavBar')).toBeInTheDocument();
  });

  // Tests that clicking "Quick Game" shows the Configuration component
  it('shows Configuration component when Quick Game button is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const quickGameButton = screen.getByText('quickGame-home');
    await act(async () => {
      await userEvent.click(quickGameButton);
    });

    expect(screen.getByText('Configuration Component')).toBeInTheDocument();
  });

  // Tests that clicking "Chaos Mode" displays the chaos modal
  it('shows Chaos Mode modal when Chaos Mode button is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const chaosModeButton = screen.getByText('chaosMode-home');
    await act(async () => {
      await userEvent.click(chaosModeButton);
    });

    expect(screen.getByText('chaosMode-intro-title')).toBeInTheDocument();
    expect(screen.getByText('chaosMode-intro-body')).toBeInTheDocument();
    expect(screen.getByText('playChaos')).toBeInTheDocument();
  });

  // Ensures the Configuration component is hidden when the "Close" button is clicked
  it('hides Configuration component when Close is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const quickGameButton = screen.getByText('quickGame-home');
    await act(async () => {
      await userEvent.click(quickGameButton);
    });

    // Verify Configuration component is displayed
    expect(screen.getByText('Configuration Component')).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });

    // Wait for the Configuration component to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText('Configuration Component')).not.toBeInTheDocument();
    });
  });
});
