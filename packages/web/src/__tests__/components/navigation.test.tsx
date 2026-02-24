/**
 * Tests for the Navigation component.
 *
 * We mock external dependencies (framer-motion, next/navigation, next-themes, config hooks)
 * so the component can render in a test environment.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...filterProps(props)}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0, on: () => () => {} } }),
  useMotionValueEvent: () => {},
}));

// Helper to remove motion-specific props from DOM elements
function filterProps(props: any) {
  const {
    initial, animate, exit, transition, whileHover, whileInView, whileTap,
    viewport, variants, layout, layoutId, ...rest
  } = props;
  return rest;
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

// Mock the config hook
jest.mock('../../hooks/useConfig', () => ({
  useCampConfig: () => ({
    name: 'Camp Alborz',
    tagline: 'Persian Culture at Burning Man',
    social: {
      instagram: 'https://instagram.com/campalborz',
    },
  }),
}));

import { Navigation } from '../../components/navigation';

describe('Navigation', () => {
  it('should render the camp name as logo text', () => {
    render(<Navigation />);
    expect(screen.getByText('CAMP ALBORZ')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(<Navigation />);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Art')).toBeInTheDocument();
    expect(screen.getByText('Culture')).toBeInTheDocument();
    // "Members" appears both in nav and as a CTA button
    const membersElements = screen.getAllByText('Members');
    expect(membersElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should have a Donate button', () => {
    render(<Navigation />);
    const donateLinks = screen.getAllByText('Donate');
    expect(donateLinks.length).toBeGreaterThan(0);
  });

  it('should render nav element', () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('should have navigation links with correct href attributes', () => {
    render(<Navigation />);
    const aboutLink = screen.getAllByText('About')[0].closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');

    const eventsLink = screen.getAllByText('Events')[0].closest('a');
    expect(eventsLink).toHaveAttribute('href', '/events');

    const cultureLink = screen.getAllByText('Culture')[0].closest('a');
    expect(cultureLink).toHaveAttribute('href', '/culture');
  });

  it('should have a mobile menu toggle button', () => {
    render(<Navigation />);
    const menuButton = screen.getByLabelText('Open navigation menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('should have a dark mode toggle button', () => {
    render(<Navigation />);
    const themeButton = screen.getByLabelText('Switch to dark mode');
    expect(themeButton).toBeInTheDocument();
  });

  it('should have the logo as a link to homepage', () => {
    render(<Navigation />);
    const logoLink = screen.getByText('CAMP ALBORZ').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should have accessible navigation landmarks', () => {
    render(<Navigation />);
    const navElements = screen.getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThan(0);
  });
});
