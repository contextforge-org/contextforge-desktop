import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { PerformerData } from '../../types/metrics';

interface TopPerformersTableProps {
  toolsData: PerformerData[];
  resourcesData: PerformerData[];
  promptsData: PerformerData[];
  serversData: PerformerData[];
  theme: string;
}

export function TopPerformersTable({ 
  toolsData, 
  resourcesData, 
  promptsData, 
  serversData, 
  theme 
}: TopPerformersTableProps) {
  const [activeType, setActiveType] = useState('tools');

  const currentData = useMemo(() => {
    switch (activeType) {
      case 'tools': return toolsData;
      case 'resources': return resourcesData;
      case 'prompts': return promptsData;
      case 'servers': return serversData;
      default: return toolsData;
    }
  }, [activeType, toolsData, resourcesData, promptsData, serversData]);

  const formatResponseTime = (time: number | string) => {
    if (typeof time === 'string') return time;
    if (time === null || time === undefined) return 'N/A';
    return time < 1 ? `${(time * 1000).toFixed(0)}ms` : `${time.toFixed(2)}s`;
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Top Performers
      </h3>

      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'}>
          <TabsTrigger value="tools" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
            Tools
          </TabsTrigger>
          <TabsTrigger value="resources" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
            Resources
          </TabsTrigger>
          <TabsTrigger value="prompts" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
            Prompts
          </TabsTrigger>
          <TabsTrigger value="servers" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
            Servers
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeType} className="mt-4">
          <div className={`border rounded-xl overflow-hidden ${theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-white'}`}>
            <Table>
              <TableHeader>
                <TableRow className={`${theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'}`}>
                  <TableHead className={`w-20 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>RANK</TableHead>
                  <TableHead className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>NAME</TableHead>
                  <TableHead className={`text-right ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>EXECUTIONS</TableHead>
                  <TableHead className={`text-right ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>AVG RESPONSE TIME</TableHead>
                  <TableHead className={`text-right ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>SUCCESS RATE</TableHead>
                  <TableHead className={`text-right ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>LAST USED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={`text-center py-8 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((item) => (
                    <TableRow key={item.rank} className={theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-gray-200 hover:bg-gray-50'}>
                      <TableCell>
                        <Badge variant="secondary" className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700'}`}>
                          {item.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>
                        {item.name}
                      </TableCell>
                      <TableCell className={`text-right ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                        {item.executions}
                      </TableCell>
                      <TableCell className={`text-right ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                        {formatResponseTime(item.avgResponseTime)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.successRate === 0 ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                          {item.successRate}%
                        </span>
                      </TableCell>
                      <TableCell className={`text-right text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                        {item.lastUsed}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
