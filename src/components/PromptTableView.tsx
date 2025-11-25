import { FileText } from 'lucide-react';
import { ServerActionsDropdown } from './ServerActionsDropdown';
import { Prompt } from '../types/prompt';

// Define the color type for better type safety
type TagColors = {
  bg: string;
  text: string;
  border: string;
};

// Helper function to get consistent tag colors
const getTagColor = (tag: string, theme: string): TagColors => {
  const darkColors: TagColors[] = [
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  ];
  
  const lightColors: TagColors[] = [
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  ];
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  // Non-null assertion is safe here because modulo ensures valid index and arrays are non-empty
  return colors[colorIndex]!;
};

// Helper to get success rate color
const getSuccessRateColor = (rate: number, theme: string) => {
  if (rate > 90) return theme === 'dark' ? 'text-green-400' : 'text-green-600';
  if (rate >= 70) return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
  return theme === 'dark' ? 'text-red-400' : 'text-red-600';
};

interface PromptTableViewProps {
  prompts: Prompt[];
  theme: string;
  selectedPrompt: Prompt | null;
  onPromptClick: (prompt: Prompt) => void;
  onToggleActive: (promptId: string) => void;
  onDuplicate: (promptId: string) => void;
  onDelete: (promptId: string) => void;
}

export function PromptTableView({
  prompts,
  theme,
  selectedPrompt,
  onPromptClick,
  onToggleActive,
  onDuplicate,
  onDelete,
}: PromptTableViewProps) {
  return (
    <table className="w-full">
      <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
        <tr>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Arguments</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Executions</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Success Rate</th>
          <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
        </tr>
      </thead>
      <tbody>
        {prompts.map((prompt) => {
          const successRate = prompt.metrics.totalExecutions > 0
            ? (prompt.metrics.successfulExecutions / prompt.metrics.totalExecutions) * 100
            : 0;
          
          return (
            <tr
              key={prompt.id}
              onClick={() => onPromptClick(prompt)}
              className={`border-b last:border-b-0 transition-colors cursor-pointer ${
                selectedPrompt?.id === prompt.id
                  ? theme === 'dark'
                    ? 'bg-cyan-950/20 border-cyan-800/50'
                    : 'bg-cyan-50 border-cyan-200'
                  : theme === 'dark' 
                    ? 'border-zinc-800 hover:bg-zinc-800/50' 
                    : 'border-gray-200 hover:bg-gray-50'
              } ${selectedPrompt?.id === prompt.id ? 'border-l-4 border-l-cyan-500' : ''}`}
            >
              <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <div className="flex items-center gap-3">
                  <div className={`size-8 flex items-center justify-center shrink-0 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                    <FileText size={16} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{prompt.name}</span>
                    <div 
                      className={`size-2 rounded-full shrink-0 ${
                        prompt.isActive 
                          ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' 
                          : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'
                      }`} 
                      title={prompt.isActive ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
              </td>
              <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} max-w-xs truncate`}>
                {prompt.description || '-'}
              </td>
              <td className="px-4 py-4">
                {prompt.arguments.length > 0 ? (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    theme === 'dark' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                  }`}>
                    {prompt.arguments.length} arg{prompt.arguments.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    No args
                  </span>
                )}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {prompt.tags && prompt.tags.length > 0 ? (
                    prompt.tags.slice(0, 3).map((tag, idx) => {
                      const colors = getTagColor(tag, theme);
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-full text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {tag}
                        </span>
                      );
                    })
                  ) : (
                    <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>-</span>
                  )}
                  {prompt.tags && prompt.tags.length > 3 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      +{prompt.tags.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                {prompt.metrics.totalExecutions.toLocaleString()}
              </td>
              <td className={`px-4 py-4 text-sm font-medium`}>
                {prompt.metrics.totalExecutions > 0 ? (
                  <span className={getSuccessRateColor(successRate, theme)}>
                    {successRate.toFixed(1)}%
                  </span>
                ) : (
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    N/A
                  </span>
                )}
              </td>
              <td className="px-4 py-4">
                <ServerActionsDropdown
                  server={{ 
                    id: prompt.id.toString(), 
                    name: prompt.name,
                    active: prompt.isActive 
                  } as any}
                  theme={theme}
                  onToggleActive={onToggleActive}
                  onEdit={onPromptClick as any}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
