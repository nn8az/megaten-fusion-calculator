import React from 'react';
import { render, screen } from '@testing-library/react';
import FusionRecommender from './FusionRecommender';

test('renders learn react link', () => {
  // render(<FusionRecommender />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
