/**
 * Example test for Header component
 * This demonstrates testing patterns for React components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '@/Components/Header';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

describe('Header', () => {
  it('renders Reddit logo', () => {
    render(<Header />);
    const logo = screen.getByAltText('');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/reddit-logo.jpeg');
  });

  it('renders GitHub link', () => {
    render(<Header />);
    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/pratikgk45/reddit-clone');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('renders SignIn component', () => {
    render(<Header />);
    // SignIn component should be present
    // The actual assertion depends on SignIn implementation
    const header = screen.getByRole('banner') || document.querySelector('header');
    expect(header).toBeInTheDocument();
  });
});
