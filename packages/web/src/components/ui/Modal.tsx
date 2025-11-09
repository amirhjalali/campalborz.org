'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFocusTrap, useEscapeKey } from '@/lib/accessibility';

/**
 * Modal Component
 *
 * Full-screen overlay modal with focus management and animations
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'fade' | 'slide' | 'scale';
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  animation = 'fade',
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Focus trap
  useFocusTrap(modalRef, isOpen);

  // Escape key handler
  useEscapeKey(() => {
    if (closeOnEscape) onClose();
  }, isOpen);

  // Handle mounting for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const animationClasses = {
    fade: {
      enter: 'transition-opacity duration-300',
      enterFrom: 'opacity-0',
      enterTo: 'opacity-100',
    },
    slide: {
      enter: 'transition-all duration-300',
      enterFrom: 'opacity-0 translate-y-4',
      enterTo: 'opacity-100 translate-y-0',
    },
    scale: {
      enter: 'transition-all duration-300',
      enterFrom: 'opacity-0 scale-95',
      enterTo: 'opacity-100 scale-100',
    },
  };

  const anim = animationClasses[animation];

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        anim.enter,
        isAnimating ? anim.enterTo : anim.enterFrom
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * Dialog Component
 *
 * Confirmation dialog with preset layouts
 */
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isLoading?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  isLoading = false,
}: DialogProps) {
  const variantStyles = {
    info: {
      icon: (
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    success: {
      icon: (
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    },
    warning: {
      icon: (
        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      ),
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    danger: {
      icon: (
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      ),
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {styles.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <div className="text-sm text-gray-600 mb-6">{message}</div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {showCancel && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                styles.buttonClass
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                confirmText
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * useModal Hook
 *
 * Convenient hook for managing modal state
 */
export function useModal(defaultOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Drawer Component
 *
 * Side panel that slides in from the edge
 */
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showClose = true,
  closeOnOverlayClick = true,
  footer,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useFocusTrap(drawerRef, isOpen);
  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const positionClasses = {
    left: {
      container: 'justify-start',
      panel: 'rounded-r-lg',
      animation: isAnimating ? 'translate-x-0' : '-translate-x-full',
    },
    right: {
      container: 'justify-end',
      panel: 'rounded-l-lg',
      animation: isAnimating ? 'translate-x-0' : 'translate-x-full',
    },
  };

  const pos = positionClasses[position];

  const drawerContent = (
    <div className={cn('fixed inset-0 z-50 flex', pos.container)}>
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={cn(
          'relative bg-white h-full w-full flex flex-col shadow-xl transition-transform duration-300',
          sizeClasses[size],
          pos.panel,
          pos.animation,
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2 id="drawer-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close drawer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

/**
 * Example Usage
 */
export function ModalExample() {
  const modal = useModal();
  const dialog = useModal();
  const drawer = useModal();

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-bold mb-4">Modal Examples</h2>

      {/* Basic Modal */}
      <button
        onClick={modal.open}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Open Modal
      </button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Example Modal"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={modal.close}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={modal.close}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        }
      >
        <p className="text-gray-600">
          This is a modal dialog with a title, body content, and footer actions.
          The modal will close when clicking the overlay, pressing Escape, or clicking the close button.
        </p>
      </Modal>

      {/* Dialog */}
      <button
        onClick={dialog.open}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Open Confirmation Dialog
      </button>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        onConfirm={() => {
          console.log('Confirmed!');
          dialog.close();
        }}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Drawer */}
      <button
        onClick={drawer.open}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        Open Drawer
      </button>

      <Drawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        title="Settings"
        position="right"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={drawer.close}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={drawer.close}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a drawer that slides in from the side. It&apos;s useful for forms, filters, or additional content.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Setting 1</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Setting 2</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
