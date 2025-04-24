import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../userMenu/UserProfile';
import { AuthProvider } from '../contextProviders/AuthContext';
import { MemoryRouter } from 'react-router';
import i18n from 'i18next';

// Mocks de los servicios
jest.mock('../../services/UserProfileService', () => ({
  getUserHistory: jest.fn(),
  getQuestionsById: jest.fn(),
}));

import { getUserHistory, getQuestionsById } from '../../services/UserProfileService';

describe('UserProfile game history interaction', () => {
  const mockGames = [
    {
      _id: 'game123',
      points: 10,
      numberOfCorrectAnswers: 2,
      numberOfQuestions: 3,
      date: '2024-04-05T10:00:00Z',
      gameMode: 'classic',
    },
  ];

  const mockQuestions = [
    {
      text: '¿Cuál es la capital de Francia?',
      imageUrl: 'logo.png', // We use the logo image for testing purposes
      selectedAnswer: 'París',
      answers: [
        { text: 'París', isCorrect: true },
        { text: 'Madrid', isCorrect: false },
        { text: 'Roma', isCorrect: false },
        { text: 'Berlín', isCorrect: false }
      ],
    },
  ];

  const renderComponent = () =>
    render(
      <AuthProvider>
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      </AuthProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    getUserHistory.mockResolvedValue(mockGames);
    getQuestionsById.mockResolvedValue(mockQuestions);
  });

  it('should show question accordion after clicking a GameHistoryButton', async () => {
    renderComponent();

    // Wait for the game history list to be displayed
    expect(await screen.findByText(i18n.t('recent-games-text'))).toBeInTheDocument();

    // Click on the first game history button
    await act(async () => {
      await userEvent.click(screen.getByText(/2 \/ 3/)); 
    });

    // Wait for the question accordion to be displayed
    await waitFor(() => {
      expect(screen.getByText(/¿Cuál es la capital de Francia?/)).toBeInTheDocument();
    });

    // Verify the answer options and their correctness
    expect(screen.getByText(/París ✔/)).toBeInTheDocument();
    expect(screen.getByText(/Madrid/)).toBeInTheDocument();
    expect(screen.getByText(/Roma/)).toBeInTheDocument();
    expect(screen.getByText(/Berlín/)).toBeInTheDocument();
  });
});
