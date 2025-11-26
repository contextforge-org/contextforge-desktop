import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { MetricRow } from './MetricRow';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  metrics: Array<{
    icon?: React.ReactNode;
    label: string;
    value: number | string;
    color?: string;
  }>;
  theme: string;
}

export function MetricCard({ icon, title, metrics, theme }: MetricCardProps) {
  return (
    <Card className={theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}>
      <CardHeader className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
            {icon}
          </div>
          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {metrics.map((metric, index) => (
            <MetricRow key={index} {...metric} theme={theme} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
