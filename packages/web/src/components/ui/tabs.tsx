'use client';

import { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// Context for Radix-style Tabs API
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

/**
 * Tabs Component
 *
 * Tab navigation with multiple variants and orientations
 */
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
  // Radix-style API support
  children?: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

// Radix-style Tabs wrapper component
function TabsWithChildren({ children, defaultValue, value, onValueChange, className }: {
  children?: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const [activeValue, setActiveValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : activeValue;

  const handleValueChange = (newValue: string) => {
    setActiveValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Original tabs array API component
function TabsWithArray(props: TabsProps) {
  const {
    tabs = [],
    defaultTab,
    activeTab: controlledActiveTab,
    onChange,
    variant = 'default',
    orientation = 'horizontal',
    size = 'md',
    fullWidth = false,
    className,
    tabListClassName,
    tabPanelClassName,
  } = props;
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs.find(t => !t.disabled)?.id || tabs[0]?.id
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    setInternalActiveTab(tabId);
    onChange?.(tabId);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowLeft') {
        nextIndex = currentIndex - 1;
      } else if (e.key === 'ArrowRight') {
        nextIndex = currentIndex + 1;
      }
    } else {
      if (e.key === 'ArrowUp') {
        nextIndex = currentIndex - 1;
      } else if (e.key === 'ArrowDown') {
        nextIndex = currentIndex + 1;
      }
    }

    if (nextIndex < 0) nextIndex = tabs.length - 1;
    if (nextIndex >= tabs.length) nextIndex = 0;

    const nextTab = tabs[nextIndex];
    if (!nextTab.disabled) {
      handleTabChange(nextTab.id);
    }
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const variantClasses = {
    default: {
      list: 'border-b border-gray-200',
      tab: (isActive: boolean) => cn(
        'border-b-2 transition-colors',
        isActive
          ? 'border-primary-600 text-primary-600 font-medium'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      ),
    },
    pills: {
      list: 'gap-2',
      tab: (isActive: boolean) => cn(
        'rounded-md transition-colors',
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      ),
    },
    underline: {
      list: '',
      tab: (isActive: boolean) => cn(
        'border-b-2 transition-colors',
        isActive
          ? 'border-primary-600 text-primary-600 font-medium'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      ),
    },
    enclosed: {
      list: 'border-b border-gray-200',
      tab: (isActive: boolean) => cn(
        'border border-gray-200 rounded-t-md transition-colors',
        isActive
          ? 'bg-white border-b-white text-primary-600 font-medium -mb-px'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      ),
    },
  };

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          variantClasses[variant].list,
          tabListClassName
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'inline-flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size],
                variantClasses[variant].tab(isActive),
                fullWidth && 'flex-1 justify-center'
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    isActive
                      ? variant === 'pills'
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTabContent && (
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={cn('mt-4', tabPanelClassName)}
        >
          {activeTabContent}
        </div>
      )}
    </div>
  );
}

// Main Tabs export - routes to correct implementation
export function Tabs(props: TabsProps) {
  if (props.children) {
    return <TabsWithChildren {...props} />;
  }
  return <TabsWithArray {...props} />;
}

/**
 * Simple Tabs (alternative API)
 */
export interface SimpleTabsProps {
  children: React.ReactNode;
  defaultTab?: number;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  className?: string;
}

export function SimpleTabs({
  children,
  defaultTab = 0,
  variant = 'default',
  className,
}: SimpleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      {/* Render children with active state */}
      {Array.isArray(children) &&
        children.map((child: any, index) => {
          if (child?.type === TabPanel) {
            return (
              <div key={index} style={{ display: index === activeTab ? 'block' : 'none' }}>
                {child}
              </div>
            );
          }
          return child;
        })}
    </div>
  );
}

/**
 * Tab Panel (for use with SimpleTabs)
 */
export interface TabPanelProps {
  children: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <>{children}</>;
}

/**
 * Radix-style Tabs API (compatibility exports)
 * These provide a shadcn/radix-compatible API for components expecting that pattern
 */
export interface TabsRootProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function TabsRoot({ children, className }: TabsRootProps) {
  return <div className={cn('w-full', className)}>{children}</div>;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn('flex border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ children, value, className, disabled }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      disabled={disabled}
      onClick={() => context?.onValueChange(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-gray-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function TabsContent({ children, value, className }: TabsContentProps) {
  const context = useContext(TabsContext);

  // Only render if this tab is active
  if (context && context.value !== value) {
    return null;
  }

  return <div className={cn('mt-4', className)}>{children}</div>;
}

/**
 * Card Tabs
 *
 * Tabs inside a card layout
 */
export interface CardTabsProps extends Omit<TabsProps, 'variant'> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function CardTabs({
  title,
  description,
  actions,
  tabs,
  ...tabsProps
}: CardTabsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Card Header */}
      {(title || description || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <Tabs
          {...tabsProps}
          tabs={tabs}
          variant="underline"
          tabListClassName="border-0"
        />
      </div>
    </div>
  );
}

/**
 * Icon Tabs
 *
 * Tabs with only icons (no labels)
 */
export interface IconTabsProps {
  tabs: Array<{
    id: string;
    icon: React.ReactNode;
    label: string; // For accessibility
    content?: React.ReactNode;
  }>;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function IconTabs({ tabs, defaultTab, onChange, className }: IconTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={className}>
      <div className="inline-flex border border-gray-200 rounded-lg p-1 bg-gray-50">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              aria-label={tab.label}
              title={tab.label}
              className={cn(
                'p-2 rounded-md transition-colors',
                isActive
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tabs.find(t => t.id === activeTab)?.content && (
        <div className="mt-4">
          {tabs.find(t => t.id === activeTab)?.content}
        </div>
      )}
    </div>
  );
}

/**
 * Example Usage
 */
export function TabsExample() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs: Tab[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      content: (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Profile Settings</h3>
          <p className="text-gray-600">Manage your profile information and preferences.</p>
        </div>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: '3',
      content: (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Account Settings</h3>
          <p className="text-gray-600">Configure your account settings and security options.</p>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: '12',
      content: (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Notification Preferences</h3>
          <p className="text-gray-600">Manage how and when you receive notifications.</p>
        </div>
      ),
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      disabled: true,
      content: (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Billing Information</h3>
          <p className="text-gray-600">View and manage your billing details.</p>
        </div>
      ),
    },
  ];

  const iconTabs = [
    {
      id: 'grid',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      label: 'Grid View',
      content: <div className="p-4 border border-gray-200 rounded-lg">Grid View Content</div>,
    },
    {
      id: 'list',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'List View',
      content: <div className="p-4 border border-gray-200 rounded-lg">List View Content</div>,
    },
    {
      id: 'kanban',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      label: 'Kanban View',
      content: <div className="p-4 border border-gray-200 rounded-lg">Kanban View Content</div>,
    },
  ];

  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Default Tabs</h2>
        <Tabs tabs={tabs} defaultTab="profile" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Pills Variant</h2>
        <Tabs tabs={tabs} variant="pills" defaultTab="profile" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Underline Variant</h2>
        <Tabs tabs={tabs} variant="underline" defaultTab="profile" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Enclosed Variant</h2>
        <Tabs tabs={tabs} variant="enclosed" defaultTab="profile" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Full Width</h2>
        <Tabs tabs={tabs} variant="pills" defaultTab="profile" fullWidth />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Vertical Orientation</h2>
        <Tabs tabs={tabs} variant="pills" orientation="vertical" defaultTab="profile" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Card Tabs</h2>
        <CardTabs
          title="Settings"
          description="Manage your account settings and preferences"
          tabs={tabs}
          defaultTab="profile"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Icon Tabs</h2>
        <IconTabs tabs={iconTabs} defaultTab="grid" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Controlled Tabs</h2>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />
        <p className="mt-4 text-sm text-gray-600">Active tab: {activeTab}</p>
      </div>
    </div>
  );
}
