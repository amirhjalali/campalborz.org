/**
 * Tests for the Footer component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the config hooks
jest.mock('../../hooks/useConfig', () => ({
  useCampConfig: () => ({
    name: 'Camp Alborz',
    tagline: 'Persian Culture at Burning Man',
    taxStatus: '501(c)(3)',
    email: 'info@campalborz.org',
    social: {
      instagram: 'https://instagram.com/campalborz',
      youtube: 'https://youtube.com/@campalborz',
      soundcloud: 'https://soundcloud.com/camp_alborz',
    },
  }),
  useContentConfig: () => ({
    footer: {
      tagline: 'Celebrating Persian culture through art and community',
      copyright: 'Camp Alborz Inc.',
    },
  }),
}));

import { Footer } from '../../components/footer';

describe('Footer', () => {
  it('should render the camp name', () => {
    render(<Footer />);
    expect(screen.getByText('Camp Alborz')).toBeInTheDocument();
  });

  it('should render the footer tagline', () => {
    render(<Footer />);
    expect(
      screen.getByText('Celebrating Persian culture through art and community')
    ).toBeInTheDocument();
  });

  it('should render the tax status', () => {
    render(<Footer />);
    expect(screen.getByText('501(c)(3) Non-Profit Organization')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Art')).toBeInTheDocument();
    expect(screen.getByText('Culture')).toBeInTheDocument();
    expect(screen.getByText('Donate')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('should render navigation links with correct hrefs', () => {
    render(<Footer />);
    const aboutLink = screen.getByText('About').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');

    const donateLink = screen.getByText('Donate').closest('a');
    expect(donateLink).toHaveAttribute('href', '/donate');
  });

  it('should render social media links', () => {
    render(<Footer />);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('SoundCloud')).toBeInTheDocument();
  });

  it('should have social links opening in new tab', () => {
    render(<Footer />);
    const instagramLink = screen.getByText('Instagram').closest('a');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render email contact', () => {
    render(<Footer />);
    const emailLink = screen.getByText('info@campalborz.org');
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:info@campalborz.org');
  });

  it('should render copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(
      new RegExp(`${currentYear}.*Camp Alborz`)
    );
    expect(copyrightText).toBeInTheDocument();
  });

  it('should render the footer as a footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should render the Navigation heading', () => {
    render(<Footer />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('should render the Connect heading', () => {
    render(<Footer />);
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });
});
