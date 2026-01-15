import { render, screen } from '@testing-library/react';
import App from './App';

test('renders portfolio app', () => {
  render(<App />);
  const nameElement = screen.getByText(/Your Name/i);
  expect(nameElement).toBeInTheDocument();
});
