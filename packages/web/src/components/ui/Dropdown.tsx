'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

/**
 * Dropdown Component
 *
 * Versatile dropdown menu with keyboard navigation and positioning
 */
export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  menuClassName?: string;
  closeOnClick?: boolean;
}

export function Dropdown({
  trigger,
  children,
  position = 'bottom-left',
  align = 'start',
  className,
  menuClassName,
  closeOnClick = true,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle menu item clicks
  const handleMenuClick = () => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[12rem] bg-white rounded-lg shadow-lg border border-gray-200 py-1',
            positionClasses[position],
            menuClassName
          )}
          onClick={handleMenuClick}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Dropdown Menu Item
 */
export interface DropdownItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  danger?: boolean;
  className?: string;
}

export function DropdownItem({
  icon,
  children,
  description,
  onClick,
  disabled = false,
  selected = false,
  danger = false,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
        disabled
          ? 'text-gray-400 cursor-not-allowed'
          : danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100',
        className
      )}
    >
      {/* Icon */}
      {icon && <span className="flex-shrink-0 h-5 w-5">{icon}</span>}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate">{children}</span>
          {selected && <CheckIcon className="h-4 w-4 text-primary-600" />}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
}

/**
 * Dropdown Divider
 */
export function DropdownDivider() {
  return <div className="my-1 h-px bg-gray-200" />;
}

/**
 * Dropdown Label
 */
export interface DropdownLabelProps {
  children: React.ReactNode;
}

export function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
}

/**
 * Dropdown Button
 *
 * Pre-styled dropdown trigger button
 */
export interface DropdownButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showChevron?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownButton({
  children,
  variant = 'secondary',
  size = 'md',
  showChevron = true,
  disabled = false,
  className,
}: DropdownButtonProps) {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-md font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
      {showChevron && <ChevronDownIcon className="h-4 w-4" />}
    </button>
  );
}

/**
 * Select Dropdown
 *
 * Dropdown specifically for selecting options
 */
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
}: SelectDropdownProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Dropdown
      trigger={
        <DropdownButton variant="outline" disabled={disabled} className={className}>
          {selectedOption ? selectedOption.label : placeholder}
        </DropdownButton>
      }
      position="bottom-left"
    >
      {options.map(option => (
        <DropdownItem
          key={option.value}
          icon={option.icon}
          description={option.description}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

/**
 * Context Menu
 *
 * Right-click context menu
 */
export interface ContextMenuProps {
  children: React.ReactNode;
  menu: React.ReactNode;
  className?: string;
}

export function ContextMenu({ children, menu, className }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[12rem] bg-white rounded-lg shadow-lg border border-gray-200 py-1"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onClick={() => setIsOpen(false)}
        >
          {menu}
        </div>
      )}
    </>
  );
}

/**
 * Menu Component
 *
 * Navigation menu with sections
 */
export interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

export function Menu({ children, className }: MenuProps) {
  return (
    <nav className={cn('bg-white border border-gray-200 rounded-lg py-1', className)}>
      {children}
    </nav>
  );
}

/**
 * Menu Item
 */
export interface MenuItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  className?: string;
}

export function MenuItem({
  icon,
  children,
  href,
  active = false,
  badge,
  onClick,
  className,
}: MenuItemProps) {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
        active
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100',
        className
      )}
    >
      {icon && <span className="flex-shrink-0 h-5 w-5">{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className={cn(
          'px-2 py-0.5 text-xs rounded-full',
          active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
        )}>
          {badge}
        </span>
      )}
    </Component>
  );
}

/**
 * Menu Section
 */
export interface MenuSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <div>
      {title && (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Example Usage
 */
export function DropdownExample() {
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [selectedRole, setSelectedRole] = useState('member');

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active', description: 'Currently active' },
    { value: 'pending', label: 'Pending', description: 'Waiting for approval' },
    { value: 'inactive', label: 'Inactive', description: 'Not currently active' },
  ];

  const roleOptions: SelectOption[] = [
    { value: 'member', label: 'Member' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'admin', label: 'Admin' },
    { value: 'organizer', label: 'Organizer' },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Dropdown Examples</h2>

        <div className="flex flex-wrap gap-4">
          {/* Basic Dropdown */}
          <Dropdown
            trigger={<DropdownButton>Actions</DropdownButton>}
            position="bottom-left"
          >
            <DropdownItem
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              onClick={() => console.log('View')}
            >
              View
            </DropdownItem>
            <DropdownItem
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              onClick={() => console.log('Edit')}
            >
              Edit
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={() => console.log('Delete')}
              danger
            >
              Delete
            </DropdownItem>
          </Dropdown>

          {/* Select Dropdowns */}
          <SelectDropdown
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Select status"
          />

          <SelectDropdown
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Select role"
          />

          {/* User Menu */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              </button>
            }
            position="bottom-right"
          >
            <DropdownLabel>Account</DropdownLabel>
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownLabel>Support</DropdownLabel>
            <DropdownItem>Help Center</DropdownItem>
            <DropdownItem>Contact Support</DropdownItem>
            <DropdownDivider />
            <DropdownItem danger>Log Out</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Context Menu Example</h2>
        <ContextMenu
          menu={
            <>
              <DropdownItem>Copy</DropdownItem>
              <DropdownItem>Paste</DropdownItem>
              <DropdownDivider />
              <DropdownItem danger>Delete</DropdownItem>
            </>
          }
        >
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-600">
            Right-click me for a context menu
          </div>
        </ContextMenu>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Menu Example</h2>
        <Menu className="max-w-xs">
          <MenuSection title="Main">
            <MenuItem icon={<span>🏠</span>} active>Dashboard</MenuItem>
            <MenuItem icon={<span>👥</span>} badge="12">Members</MenuItem>
            <MenuItem icon={<span>📅</span>} badge="3">Events</MenuItem>
          </MenuSection>
          <DropdownDivider />
          <MenuSection title="Settings">
            <MenuItem icon={<span>⚙️</span>}>Preferences</MenuItem>
            <MenuItem icon={<span>🔔</span>} badge="5">Notifications</MenuItem>
          </MenuSection>
        </Menu>
      </div>
    </div>
  );
}
