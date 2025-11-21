# Toast with Tray Integration

This module provides an enhanced toast notification system that automatically integrates with the system tray to manage notification badge counts.

## Overview

The `toastWithTray.ts` module wraps the `sonner` toast library and automatically:
- Increments the tray badge count when a toast is shown
- Decrements the count when a toast is dismissed or auto-closes
- Syncs with the system tray via the `useTray` hook

## Usage

Import `toast` from `toastWithTray` instead of directly from `sonner`:

```typescript
// ❌ Old way
import { toast } from 'sonner';

// ✅ New way
import { toast } from '../lib/toastWithTray';
```

## Available Methods

All standard toast methods are supported:

```typescript
// Success notification (increments badge)
toast.success('Server created successfully');

// Error notification (increments badge)
toast.error('Failed to connect to server');

// Info notification (increments badge)
toast.info('Configuration updated');

// Warning notification (increments badge)
toast.warning('Server is running low on resources');

// Loading notification (does NOT increment badge)
toast.loading('Connecting to server...');

// Custom message (increments badge)
toast.message('Custom notification');

// Dismiss a toast
toast.dismiss(toastId);
```

## How It Works

1. **Initialization**: The `useTray` hook is called in `mainapp.tsx`, which connects the notification manager to the tray badge update function.

2. **Toast Display**: When a toast is shown, the notification count increments and the tray badge updates.

3. **Toast Dismissal**: When a toast is dismissed (manually or auto-closed), the count decrements and the badge updates.

4. **Badge Sync**: The badge count is always kept in sync with the number of active toast notifications.

## Architecture

```
┌─────────────────┐
│   Components    │
│  (use toast)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ toastWithTray   │
│  (wraps sonner) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notification    │
│   Manager       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    useTray      │
│  (IPC bridge)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Electron Tray  │
│  (badge count)  │
└─────────────────┘
```

## Files Modified

- `src/lib/toastWithTray.ts` - New wrapper module
- `src/hooks/useTray.ts` - Updated to connect notification manager
- `src/mainapp.tsx` - Initializes tray integration
- `src/lib/serverUtils.ts` - Updated import
- `src/hooks/useServerActions.ts` - Updated import
- `src/components/AddServerForm.tsx` - Updated import
- `src/components/BulkImportForm.tsx` - Updated import
- `src/components/ToolsPage.tsx` - Updated import

## Notes

- Loading toasts do NOT increment the badge count as they are typically replaced by success/error toasts
- The notification manager is a singleton, ensuring consistent state across the app
- Badge count never goes below 0
- All existing toast functionality remains unchanged