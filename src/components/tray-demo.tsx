import React, { useState } from 'react';
import { useTray } from '../hooks/useTray';

export function TrayDemo() {
  const {
    config,
    isWindowVisible,
    showNotification,
    updateBadge,
    updateConfig,
    showWindow,
    hideWindow,
    toggleWindow,
  } = useTray();

  const [notificationTitle, setNotificationTitle] = useState('Test Notification');
  const [notificationBody, setNotificationBody] = useState('This is a test notification!');
  const [badgeCount, setBadgeCount] = useState(0);

  const handleShowNotification = () => {
    showNotification(notificationTitle, notificationBody);
  };

  const handleUpdateBadge = () => {
    updateBadge(badgeCount);
  };

  const handleIncrementBadge = () => {
    const newCount = badgeCount + 1;
    setBadgeCount(newCount);
    updateBadge(newCount);
  };

  const handleClearBadge = () => {
    setBadgeCount(0);
    updateBadge(0);
  };

  if (!config) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Loading tray configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Tray Demo</h1>

      {/* Window Status */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Window Status</h2>
          <div className="flex items-center gap-4">
            <div className="badge badge-lg">
              {isWindowVisible ? 'Visible' : 'Hidden'}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={showWindow}>
                Show
              </button>
              <button className="btn btn-sm btn-secondary" onClick={hideWindow}>
                Hide
              </button>
              <button className="btn btn-sm btn-accent" onClick={toggleWindow}>
                Toggle
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Try hiding the window and clicking the tray icon to restore it!
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Notifications</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Body</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              rows={3}
            />
          </div>
          <button className="btn btn-primary mt-4" onClick={handleShowNotification}>
            Show Notification
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Notifications will appear from the system tray. Click them to restore the window!
          </p>
        </div>
      </div>

      {/* Badge Count */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Badge Count</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{badgeCount}</div>
            <div className="flex flex-col gap-2">
              <button className="btn btn-sm btn-success" onClick={handleIncrementBadge}>
                Increment
              </button>
              <button className="btn btn-sm btn-error" onClick={handleClearBadge}>
                Clear
              </button>
            </div>
          </div>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Set Custom Count</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input input-bordered flex-1"
                value={badgeCount}
                onChange={(e) => setBadgeCount(parseInt(e.target.value) || 0)}
                min="0"
              />
              <button className="btn btn-primary" onClick={handleUpdateBadge}>
                Update
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Badge count appears in the tray tooltip and dock icon (macOS).
          </p>
        </div>
      </div>

      {/* Tray Configuration */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Tray Configuration</h2>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Enable Notifications</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={config.notificationsEnabled}
                onChange={(e) =>
                  updateConfig({ notificationsEnabled: e.target.checked })
                }
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Notification Sound</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={config.notificationSound}
                disabled={!config.notificationsEnabled}
                onChange={(e) =>
                  updateConfig({ notificationSound: e.target.checked })
                }
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Minimize to Tray</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={config.minimizeToTray}
                onChange={(e) =>
                  updateConfig({ minimizeToTray: e.target.checked })
                }
              />
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            These settings are also available in the tray context menu (right-click the tray icon).
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">How to use the system tray:</h3>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Click the tray icon to show/hide the window</li>
            <li>Right-click (or Ctrl+click on macOS) for the context menu</li>
            <li>Close the window to minimize to tray (if enabled)</li>
            <li>Use "Quit" from the tray menu to fully exit the app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
