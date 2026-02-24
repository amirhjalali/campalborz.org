/**
 * Tests for the Stats component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileInView, viewport, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    article: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileInView, viewport, ...rest } = props;
      return <article {...rest}>{children}</article>;
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
  },
  useInView: () => true,
  useSpring: () => ({ set: jest.fn(), get: () => 0 }),
  useTransform: (_value: any, fn: any) => fn(0),
}));

// Mock config hooks
jest.mock('../../hooks/useConfig', () => ({
  useContentConfig: () => ({
    stats: [
      {
        icon: 'users',
        value: '150+',
        label: 'COMMUNITY MEMBERS',
        description: 'Active members across all chapters',
      },
      {
        icon: 'calendar',
        value: '17',
        label: 'YEARS ON PLAYA',
        description: 'Consecutive years at Burning Man',
      },
      {
        icon: 'flame',
        value: '2',
        label: 'ART CARS',
        description: 'HOMA and DAMAVAND',
      },
    ],
  }),
}));

// Mock icons
jest.mock('../../lib/icons', () => ({
  getIcon: () => {
    const MockIcon = (props: any) => <svg data-testid="mock-icon" {...props} />;
    MockIcon.displayName = 'MockIcon';
    return MockIcon;
  },
}));

import { Stats } from '../../components/stats';

describe('Stats', () => {
  it('should render the section heading', () => {
    render(<Stats />);
    expect(screen.getByText('In Numbers')).toBeInTheDocument();
  });

  it('should render the section description', () => {
    render(<Stats />);
    expect(
      screen.getByText(/Each metric reflects our commitment/)
    ).toBeInTheDocument();
  });

  it('should render all stat labels', () => {
    render(<Stats />);
    expect(screen.getByText('COMMUNITY MEMBERS')).toBeInTheDocument();
    expect(screen.getByText('YEARS ON PLAYA')).toBeInTheDocument();
    expect(screen.getByText('ART CARS')).toBeInTheDocument();
  });

  it('should render stat descriptions', () => {
    render(<Stats />);
    expect(screen.getByText('Active members across all chapters')).toBeInTheDocument();
    expect(screen.getByText('Consecutive years at Burning Man')).toBeInTheDocument();
    expect(screen.getByText('HOMA and DAMAVAND')).toBeInTheDocument();
  });

  it('should render icons for each stat', () => {
    render(<Stats />);
    const icons = screen.getAllByTestId('mock-icon');
    expect(icons.length).toBe(3);
  });

  it('should render a section element', () => {
    const { container } = render(<Stats />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render stat values with suffixes', () => {
    render(<Stats />);
    // The "+" suffix should be rendered
    const plusSuffix = screen.getAllByText('+');
    expect(plusSuffix.length).toBeGreaterThan(0);
  });
});
