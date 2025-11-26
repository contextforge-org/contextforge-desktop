interface MetricRowProps {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
  theme: string;
}

export function MetricRow({ icon, label, value, color, theme }: MetricRowProps) {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && (
          <div className={color ? colorClasses[color as keyof typeof colorClasses] : ''}>
            {icon}
          </div>
        )}
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
