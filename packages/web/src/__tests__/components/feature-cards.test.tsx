/**
 * Tests for the FeatureCards component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion.
// feature-cards imports `m` (the LazyMotion "mini" namespace), so we mock
// both `m` and `motion` to be safe.
jest.mock('framer-motion', () => {
  const filter = (props: any) => {
    const {
      initial, animate, exit, transition, whileHover, whileInView, whileTap,
      viewport, variants, layout, layoutId, ...rest
    } = props;
    return rest;
  };
  const stub = {
    div: ({ children, ...props }: any) => <div {...filter(props)}>{children}</div>,
    article: ({ children, ...props }: any) => <article {...filter(props)}>{children}</article>,
    span: ({ children, ...props }: any) => <span {...filter(props)}>{children}</span>,
    section: ({ children, ...props }: any) => <section {...filter(props)}>{children}</section>,
  };
  return {
    motion: stub,
    m: stub,
    LazyMotion: ({ children }: any) => <>{children}</>,
    domAnimation: {},
    domMax: {},
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock next/image
jest.mock('next/image', () => {
  const MockImage = (props: any) => {
    const { fill, priority, quality, sizes, ...rest } = props;
    return <img {...rest} />;
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mock config hooks
jest.mock('../../hooks/useConfig', () => ({
  useContentConfig: () => ({
    features: [
      {
        title: 'Persian Tea House',
        description: 'Experience authentic Persian hospitality with our traditional tea service.',
        icon: 'coffee',
        image: '/images/tea.jpg',
        link: '/culture',
      },
      {
        title: 'HOMA Art Car',
        description: 'Our flagship art car brings Persian mythology to the playa.',
        icon: 'flame',
        image: '/images/homa.jpg',
        link: '/art/homa',
      },
      {
        title: 'Music & Sound',
        description: 'Listen to our curated mix of Persian and electronic music.',
        icon: 'music',
        link: 'https://soundcloud.com/camp_alborz',
      },
    ],
  }),
  useCampConfig: () => ({
    name: 'Camp Alborz',
  }),
}));

// Mock icons
jest.mock('../../lib/icons', () => ({
  getIcon: () => {
    const MockIcon = (props: any) => <svg data-testid="feature-icon" {...props} />;
    MockIcon.displayName = 'MockIcon';
    return MockIcon;
  },
}));

import { FeatureCards } from '../../components/feature-cards';

describe('FeatureCards', () => {
  it('should render the section heading with camp name', () => {
    render(<FeatureCards />);
    expect(screen.getByText('Discover Camp Alborz')).toBeInTheDocument();
  });

  it('should render the section description', () => {
    render(<FeatureCards />);
    expect(
      screen.getByText(/Explore the pillars of hospitality/)
    ).toBeInTheDocument();
  });

  it('should render all feature titles', () => {
    render(<FeatureCards />);
    expect(screen.getByText('Persian Tea House')).toBeInTheDocument();
    expect(screen.getByText('HOMA Art Car')).toBeInTheDocument();
    expect(screen.getByText('Music & Sound')).toBeInTheDocument();
  });

  it('should render feature descriptions', () => {
    render(<FeatureCards />);
    expect(
      screen.getByText(/Experience authentic Persian hospitality/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Our flagship art car/)
    ).toBeInTheDocument();
  });

  it('should render icons for features with images', () => {
    render(<FeatureCards />);
    const icons = screen.getAllByTestId('feature-icon');
    // Only features with images render the icon badge overlay
    expect(icons.length).toBe(2);
  });

  it('should render "Learn More" for internal links', () => {
    render(<FeatureCards />);
    const learnMoreLinks = screen.getAllByText('Learn More');
    expect(learnMoreLinks.length).toBe(2); // Two internal links
  });

  it('should render "Listen" for external links', () => {
    render(<FeatureCards />);
    expect(screen.getByText('Listen')).toBeInTheDocument();
  });

  it('should render internal links as Next.js Link components', () => {
    render(<FeatureCards />);
    const teaHouseLink = screen.getByText('Persian Tea House').closest('a');
    expect(teaHouseLink).toHaveAttribute('href', '/culture');
  });

  it('should render external links with target _blank', () => {
    render(<FeatureCards />);
    const musicLink = screen.getByText('Music & Sound').closest('a');
    expect(musicLink).toHaveAttribute('target', '_blank');
    expect(musicLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render images for features that have them', () => {
    render(<FeatureCards />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(2); // Two features have images
  });

  it('should render a section element', () => {
    const { container } = render(<FeatureCards />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});
