import { useTheme } from '../context/ThemeContext';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { CheckSquare, Square } from 'lucide-react';

interface PermissionsCheckboxGroupProps {
  permissionsByResource: { [key: string]: string[] };
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionsCheckboxGroup({
  permissionsByResource,
  selectedPermissions,
  onChange,
  disabled = false
}: PermissionsCheckboxGroupProps) {
  const { theme } = useTheme();

  const handlePermissionToggle = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      onChange(selectedPermissions.filter(p => p !== permission));
    } else {
      onChange([...selectedPermissions, permission]);
    }
  };

  const handleSelectAll = () => {
    const allPermissions = Object.values(permissionsByResource).flat();
    onChange(allPermissions);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const allPermissions = Object.values(permissionsByResource).flat();
  const allSelected = allPermissions.length > 0 && selectedPermissions.length === allPermissions.length;
  const someSelected = selectedPermissions.length > 0 && !allSelected;

  return (
    <div className={`space-y-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Select All / Clear All buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={disabled || allSelected}
          className={`flex items-center gap-2 ${
            theme === 'dark'
              ? 'border-zinc-700 hover:bg-zinc-800'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <CheckSquare size={14} />
          Select All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={disabled || selectedPermissions.length === 0}
          className={`flex items-center gap-2 ${
            theme === 'dark'
              ? 'border-zinc-700 hover:bg-zinc-800'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <Square size={14} />
          Clear All
        </Button>
        {someSelected && (
          <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {selectedPermissions.length} of {allPermissions.length} selected
          </span>
        )}
      </div>

      {/* Permission groups */}
      <div className="space-y-4">
        {Object.entries(permissionsByResource).map(([resource, permissions]) => (
          <div
            key={resource}
            className={`p-4 rounded-lg border ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h4 className={`font-medium mb-3 capitalize ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {resource}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {permissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission}`}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                    disabled={disabled}
                    className={theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'}
                  />
                  <label
                    htmlFor={`permission-${permission}`}
                    className={`text-sm cursor-pointer ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {permission}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(permissionsByResource).length === 0 && (
        <div className={`text-center py-8 ${
          theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
        }`}>
          No permissions available
        </div>
      )}
    </div>
  );
}
