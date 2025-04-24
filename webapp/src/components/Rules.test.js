import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rules from './Rules';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

// Mock the translation hook so that it simply returns the key itself
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Test suite for the Rules modal component
describe('Rules component', () => {

  // Should render the modal with translated text content
  it('should render the modal with translated content', () => {
    render(<Rules show={true} handleClose={jest.fn()} />);

    // Check that translated content is displayed
    expect(screen.getByText('rules-title')).toBeInTheDocument();
    expect(screen.getByText('rules-content-1')).toBeInTheDocument();
    expect(screen.getByText('rules-content-2')).toBeInTheDocument();
    expect(screen.getByText('rules-content-3')).toBeInTheDocument();
  });

  // Should trigger handleClose when the close button is clicked
  it('should call handleClose when close button is clicked', async () => {
    const handleCloseMock = jest.fn(); // Create mock for close handler
    render(<Rules show={true} handleClose={handleCloseMock} />);

    const closeButton = screen.getByRole('button', { name: /close/i });

    await act(async () => {
      await userEvent.click(closeButton);
    });

    // Check that the handler was called
    expect(handleCloseMock).toHaveBeenCalled();
  });

  // Should not render anything when `show` is false
  it('should not render when show is false', () => {
    const { queryByText } = render(<Rules show={false} handleClose={jest.fn()} />);

    // Expect modal content to not be in the DOM
    expect(queryByText('rules-title')).not.toBeInTheDocument();
  });

});
