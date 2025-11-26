import { Users, CheckCircle, XCircle, Crown, User, Building } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AggregatedMetrics } from '../../types/metrics';

interface UsersTeamsTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function UsersTeamsTab({ metrics, theme }: UsersTeamsTabProps) {
  const users = metrics.users || {};
  const teams = metrics.teams || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        icon={<Users className="w-5 h-5" />}
        title="Users"
        metrics={[
          { label: 'Total Users', value: users.total || 0 },
          {
            icon: <CheckCircle className="w-4 h-4" />,
            label: 'Active',
            value: users.active || 0,
            color: 'green'
          },
          {
            icon: <XCircle className="w-4 h-4" />,
            label: 'Inactive',
            value: users.inactive || 0,
            color: 'red'
          },
          {
            icon: <Crown className="w-4 h-4" />,
            label: 'Admins',
            value: users.admins || 0,
            color: 'yellow'
          },
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<Users className="w-5 h-5" />}
        title="Teams"
        metrics={[
          { label: 'Total Teams', value: teams.total || 0 },
          {
            icon: <User className="w-4 h-4" />,
            label: 'Personal',
            value: teams.personal || 0
          },
          {
            icon: <Building className="w-4 h-4" />,
            label: 'Organizational',
            value: teams.organizational || 0
          },
          {
            icon: <Users className="w-4 h-4" />,
            label: 'Team Members',
            value: teams.totalMembers || 0
          },
        ]}
        theme={theme}
      />
    </div>
  );
}
