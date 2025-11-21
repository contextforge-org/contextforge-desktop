import { toast as sonnerToast, ExternalToast } from 'sonner';

/**
 * Notification count manager for tray integration
 */
class NotificationManager {
  private count = 0;
  private updateBadgeCallback: ((count: number) => void) | null = null;

  setUpdateBadgeCallback(callback: (count: number) => void) {
    this.updateBadgeCallback = callback;
  }

  increment() {
    this.count++;
    this.updateBadge();
  }

  decrement() {
    this.count = Math.max(0, this.count - 1);
    this.updateBadge();
  }

  reset() {
    this.count = 0;
    this.updateBadge();
  }

  getCount() {
    return this.count;
  }

  private updateBadge() {
    if (this.updateBadgeCallback) {
      this.updateBadgeCallback(this.count);
    }
  }
}

export const notificationManager = new NotificationManager();

/**
 * Enhanced toast function that integrates with system tray
 * Automatically manages notification badge count
 */
export const toast = {
  success: (message: string | React.ReactNode, data?: ExternalToast) => {
    notificationManager.increment();
    const toastId = sonnerToast.success(message, {
      ...data,
      onDismiss: (t) => {
        notificationManager.decrement();
        data?.onDismiss?.(t);
      },
      onAutoClose: (t) => {
        notificationManager.decrement();
        data?.onAutoClose?.(t);
      },
    });
    return toastId;
  },

  error: (message: string | React.ReactNode, data?: ExternalToast) => {
    notificationManager.increment();
    const toastId = sonnerToast.error(message, {
      ...data,
      onDismiss: (t) => {
        notificationManager.decrement();
        data?.onDismiss?.(t);
      },
      onAutoClose: (t) => {
        notificationManager.decrement();
        data?.onAutoClose?.(t);
      },
    });
    return toastId;
  },

  info: (message: string | React.ReactNode, data?: ExternalToast) => {
    notificationManager.increment();
    const toastId = sonnerToast.info(message, {
      ...data,
      onDismiss: (t) => {
        notificationManager.decrement();
        data?.onDismiss?.(t);
      },
      onAutoClose: (t) => {
        notificationManager.decrement();
        data?.onAutoClose?.(t);
      },
    });
    return toastId;
  },

  warning: (message: string | React.ReactNode, data?: ExternalToast) => {
    notificationManager.increment();
    const toastId = sonnerToast.warning(message, {
      ...data,
      onDismiss: (t) => {
        notificationManager.decrement();
        data?.onDismiss?.(t);
      },
      onAutoClose: (t) => {
        notificationManager.decrement();
        data?.onAutoClose?.(t);
      },
    });
    return toastId;
  },

  loading: (message: string | React.ReactNode, data?: ExternalToast) => {
    // Loading toasts don't increment count as they're typically replaced
    return sonnerToast.loading(message, data);
  },

  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  message: (message: string | React.ReactNode, data?: ExternalToast) => {
    notificationManager.increment();
    const toastId = sonnerToast.message(message, {
      ...data,
      onDismiss: (t) => {
        notificationManager.decrement();
        data?.onDismiss?.(t);
      },
      onAutoClose: (t) => {
        notificationManager.decrement();
        data?.onAutoClose?.(t);
      },
    });
    return toastId;
  },
  dismiss: sonnerToast.dismiss,
};


