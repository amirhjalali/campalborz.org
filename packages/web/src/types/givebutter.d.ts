/**
 * Type declarations for GiveButter web components.
 * Allows usage of <givebutter-widget> in JSX without TypeScript errors.
 */
declare namespace JSX {
  interface IntrinsicElements {
    'givebutter-widget': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { id?: string },
      HTMLElement
    >;
  }
}
