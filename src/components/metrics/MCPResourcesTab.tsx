import { Server, Globe, Wrench, BookOpen, MessageSquare, Bot } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AggregatedMetrics } from '../../types/metrics';

interface MCPResourcesTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function MCPResourcesTab({ metrics, theme }: MCPResourcesTabProps) {
  const mcpResources = metrics.mcpResources || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        icon={<Server className="w-5 h-5" />}
        title="Virtual Servers"
        metrics={[
          { label: 'Total', value: mcpResources.virtualServers || 0 }
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<Globe className="w-5 h-5" />}
        title="Gateway Peers"
        metrics={[
          { label: 'Total', value: mcpResources.gatewayPeers || 0 }
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<Wrench className="w-5 h-5" />}
        title="Tools"
        metrics={[
          { label: 'Total', value: mcpResources.tools || 0 }
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<BookOpen className="w-5 h-5" />}
        title="Resources"
        metrics={[
          { label: 'Total', value: mcpResources.resources || 0 }
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<MessageSquare className="w-5 h-5" />}
        title="Prompts"
        metrics={[
          { label: 'Total', value: mcpResources.prompts || 0 }
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<Bot className="w-5 h-5" />}
        title="A2A Agents"
        metrics={[
          { label: 'Total', value: mcpResources.a2aAgents || 0 }
        ]}
        theme={theme}
      />
    </div>
  );
}
