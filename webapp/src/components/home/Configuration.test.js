import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router'; // Provides router context for components using routing
import Configuration from './Configuration';
import { useConfig } from '../contextProviders/GameConfigProvider';
import { useNavigate } from 'react-router';

// Mock i18next translation hook to return translation keys directly
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock useNavigate to track navigation without performing real routing
const mockedNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockedNavigate,
}));

// Mock config context functions
const mockSetConfig = jest.fn();
const mockResetConfig = jest.fn();

jest.mock('../contextProviders/GameConfigProvider', () => ({
  useConfig: () => ({
    config: {},
    setConfig: mockSetConfig,
    resetConfig: mockResetConfig,
  }),
}));

describe('Configuration component', () => {
  const mockOnClose = jest.fn(); // Local mock function for closing the config panel

  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test
  });

  it('renders correctly with initial values', () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );

    // Check for presence of basic UI elements
    expect(screen.getByText('title-configuration')).toBeInTheDocument();
    expect(screen.getByText('numberQuestions-configuration')).toBeInTheDocument();
    expect(screen.getByText('time-configuration')).toBeInTheDocument();
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'play-configuration' })).toBeDisabled();
  });

  it('calls onClose and resetConfig when close button is clicked', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );

    const closeBtn = screen.getByLabelText('Close configuration');
    await act(async () => {
      await userEvent.click(closeBtn);
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockResetConfig).toHaveBeenCalled();
  });

  it('updates number of questions correctly', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );

    const questionsDropdownToggle = screen.getByText('30');

    await act(async () => {
      await userEvent.click(questionsDropdownToggle);
    });

    const option20 = await screen.findByText('20');

    await act(async () => {
      await userEvent.click(option20);
    });

    // Verify setConfig was called with updated questions count
    expect(mockSetConfig).toHaveBeenCalledTimes(1);
    const callArg = mockSetConfig.mock.calls[0][0];
    const result = callArg({});
    expect(result).toEqual(expect.objectContaining({ questions: 20 }));
  });

  it('updates time correctly', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );

    const timeDropdownToggle = screen.getByText('120s');

    await act(async () => {
      await userEvent.click(timeDropdownToggle);
    });

    const option60 = await screen.findByText('60s');

    await act(async () => {
      await userEvent.click(option60);
    });

    expect(mockSetConfig).toHaveBeenCalledTimes(1);
    const callArg = mockSetConfig.mock.calls[0][0];
    const result = callArg({});
    expect(result).toEqual(expect.objectContaining({ timePerRound: 60 }));
  });

  it('enables play button when a topic is selected', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );

    const historyButton = screen.getByText('history-configuration');

    await act(async () => {
      await userEvent.click(historyButton);
    });

    // Confirm that config is updated with selected topic
    expect(mockSetConfig).toHaveBeenCalled();
    const callArg = mockSetConfig.mock.calls[0][0];
    const result = callArg({ topics: [] });
    expect(result).toEqual(expect.objectContaining({ topics: ['history'] }));

    // Play button should now be enabled
    expect(screen.getByRole('button', { name: 'play-configuration' })).toBeEnabled();
  });

  it('navigates to /game with correct state when play button is clicked', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );

    const historyButton = screen.getByText('history-configuration');
    await act(async () => {
      await userEvent.click(historyButton);
    });

    const playButton = screen.getByRole('button', { name: 'play-configuration' });

    await act(async () => {
      await userEvent.click(playButton);
    });

    // Should navigate to the game page with expected state
    expect(mockedNavigate).toHaveBeenCalledWith('/game', { state: { questionTime: 120 } });
  });

  it('removes topic from config when deselected', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );
  
    const historyButton = screen.getByText('history-configuration');
  
    // Select topic, then deselect it
    await act(async () => {
      await userEvent.click(historyButton);
    });
  
    await act(async () => {
      await userEvent.click(historyButton);
    });
  
    const lastCallArg = mockSetConfig.mock.calls.at(-1)[0];
    const result = lastCallArg({ topics: ['history'] });
    // Should result in an empty topics list
    expect(result).toEqual(expect.objectContaining({ topics: [] }));
    // Play button should now be disabled
    expect(screen.getByRole('button', { name: 'play-configuration' })).toBeDisabled();
  });

  it('adds multiple topics to config when selected', async () => {
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );
  
    const historyButton = screen.getByText('history-configuration');
    const artButton = screen.getByText('art-configuration');
  
    await act(async () => {
      await userEvent.click(historyButton);
    });
  
    let result = mockSetConfig.mock.calls.at(-1)[0]({ topics: [] });
    expect(result).toEqual(expect.objectContaining({ topics: ['history'] }));
  
    await act(async () => {
      await userEvent.click(artButton);
    });
  
    result = mockSetConfig.mock.calls.at(-1)[0]({ topics: ['history'] });
    expect(result).toEqual(expect.objectContaining({ topics: ['history', 'art'] }));
  });
  

  it('calls resetConfig on mount', () => {
    // Ensure that config is reset every time the component mounts
    render(
      <MemoryRouter>
        <Configuration onClose={mockOnClose} />
      </MemoryRouter>
    );
  
    expect(mockResetConfig).toHaveBeenCalledTimes(1);
  });
  
  
});

