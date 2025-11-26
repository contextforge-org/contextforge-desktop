import { Lock, FileText, Clock, Key, Mail, UserPlus, Settings } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AggregatedMetrics } from '../../types/metrics';

interface SecurityTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function SecurityTab({ metrics, theme }: SecurityTabProps) {
  const security = metrics.security || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        icon={<Lock className="w-5 h-5" />}
        title="Audit & Events"
        metrics={[
          {
            icon: <Lock className="w-4 h-4" />,
            label: 'Auth Events',
            value: security.authEvents || 0
          },
          {
            icon: <FileText className="w-4 h-4" />,
            label: 'Audit Logs',
            value: security.auditLogs || 0
          },
          {
            icon: <Clock className="w-4 h-4" />,
            label: 'Pending Approvals',
            value: security.pendingApprovals || 0,
            color: (security.pendingApprovals || 0) > 0 ? 'yellow' : undefined
          },
          {
            icon: <Key className="w-4 h-4" />,
            label: 'SSO Providers',
            value: security.ssoProviders || 0
          },
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<Settings className="w-5 h-5" />}
        title="Workflow State"
        metrics={[
          {
            icon: <Mail className="w-4 h-4" />,
            label: 'Team Invitations',
            value: security.teamInvitations || 0,
            color: (security.teamInvitations || 0) > 0 ? 'blue' : undefined
          },
          {
            icon: <UserPlus className="w-4 h-4" />,
            label: 'Join Requests',
            value: security.joinRequests || 0,
            color: (security.joinRequests || 0) > 0 ? 'blue' : undefined
          },
        ]}
        theme={theme}
      />
    </div>
  );
}
