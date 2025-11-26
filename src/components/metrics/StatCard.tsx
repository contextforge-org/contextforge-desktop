import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  theme: string;
}

export function StatCard({ icon, label, value, subtitle, color, theme }: StatCardProps) {
  const iconColorClasses = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
  };

  return (
    <Card className={theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className={`${iconColorClasses[color]} opacity-70`}>
            {icon}
          </div>
          <div className="flex flex-col gap-1">
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {label}
            </div>
            {subtitle && (
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
