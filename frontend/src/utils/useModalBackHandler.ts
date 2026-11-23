import { useEffect, useRef, useCallback } from 'react';

interface UseModalBackHandlerOptions {
  isOpen: boolean;
  onClose: () => void;
  modalId?: string;
}

/**
 * Custom hook to intercept browser / mobile "Back" button when a modal is open.
 * Prevents the application from navigating away or closing the page.
 */
export const useModalBackHandler = ({
  isOpen,
  onClose,
  modalId = 'modal'
}: UseModalBackHandlerOptions) => {
  const isPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      isPushedRef.current = false;
      return;
    }

    // Push dummy state to the history stack so "Back" triggers popstate
    const state = { modalOpen: true, modalId };
    window.history.pushState(state, '');
    isPushedRef.current = true;

    const handlePopState = () => {
      // Browser back button or gesture was pressed
      if (isPushedRef.current) {
        isPushedRef.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If unmounting while still holding the pushed state and not closed via popstate,
      // pop it so it doesn't pollute subsequent back navigation
      if (isPushedRef.current) {
        isPushedRef.current = false;
        // Check if current state is our pushed modal state before backing
        if (window.history.state?.modalOpen && window.history.state?.modalId === modalId) {
          window.history.back();
        }
      }
    };
  }, [isOpen, modalId]);

  // Safe close method for UI triggers (X button, backdrop click, Escape key)
  const safeClose = useCallback(() => {
    if (isPushedRef.current) {
      isPushedRef.current = false;
      window.history.back();
    } else {
      onCloseRef.current();
    }
  }, []);

  return { safeClose };
};
