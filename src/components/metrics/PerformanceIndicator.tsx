import { Card, CardContent } from '../ui/card';

interface PerformanceIndicatorProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  theme: string;
}

export function PerformanceIndicator({ icon, value, label, color, theme }: PerformanceIndicatorProps) {
  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
  };

  return (
    <Card className={theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-3">
          <div className={`${iconColorClasses[color as keyof typeof iconColorClasses]} opacity-70`}>
            {icon}
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
