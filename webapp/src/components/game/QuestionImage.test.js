import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionImage from './QuestionImage';

describe('QuestionImage', () => {
  const altText = 'Image description';
  const pngSrc = 'image.png';
  const jpgSrc = 'image.jpg';

  test('renders image with props', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    const image = screen.getByAltText(altText);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', jpgSrc);
  });

  test('displays zoomed image when clicked', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    const image = screen.getByAltText(altText);
    fireEvent.click(image);

    const zoomedImage = screen.getAllByAltText(altText)[1];
    expect(zoomedImage).toBeInTheDocument();
    expect(zoomedImage).toHaveClass('zoomed-image');
  });

  test('displays zoomed image when pressing Enter on image', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    const image = screen.getByAltText(altText);
    fireEvent.keyDown(image, { key: 'Enter' });

    const zoomedImage = screen.getAllByAltText(altText)[1];
    expect(zoomedImage).toBeInTheDocument();
  });

  test('displays zoomed image when pressing Space on image', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    const image = screen.getByAltText(altText);
    fireEvent.keyDown(image, { key: ' ' });

    const zoomedImage = screen.getAllByAltText(altText)[1];
    expect(zoomedImage).toBeInTheDocument();
  });

  test('closes zoomed image when clicking on the background', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    fireEvent.click(screen.getByAltText(altText));
  
    // Seleccionamos el contenedor con la clase zoomed-image-div
    const overlay = document.querySelector('.zoomed-image-div');
    fireEvent.click(overlay);
  
    expect(screen.queryAllByAltText(altText).length).toBe(1);
  });

  test('closes zoomed image when pressing Escape', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    fireEvent.click(screen.getByAltText(altText));
  
    // Ensure the zoomed image is displayed
    expect(screen.getAllByAltText(altText).length).toBe(2);
  
    // Simulate Escape key press on the overlay
    const overlay = document.querySelector('.zoomed-image-div');
    overlay.focus(); // Necessary for key events to register
    fireEvent.keyDown(overlay, { key: 'Escape' });
  
    // Expect the zoomed image to be closed
    expect(screen.queryAllByAltText(altText).length).toBe(1);
  });
  

  test('applies no-border class if image is PNG', () => {
    render(<QuestionImage src={pngSrc} alt={altText} />);
    fireEvent.click(screen.getByAltText(altText));

    const zoomedImage = screen.getAllByAltText(altText)[1];
    expect(zoomedImage).toHaveClass('no-border');
  });

  test('does not apply no-border class if image is not PNG', () => {
    render(<QuestionImage src={jpgSrc} alt={altText} />);
    fireEvent.click(screen.getByAltText(altText));

    const zoomedImage = screen.getAllByAltText(altText)[1];
    expect(zoomedImage).not.toHaveClass('no-border');
  });
});
