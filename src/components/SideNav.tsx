import { useState } from 'react';
import svgPaths from "../imports/svg-00ihbob3cz";
import { Server, Wrench, FileText, Package, Users, LineChart, Plug, BookOpen, Github, Settings, Activity, Store, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { MCPIcon } from './common';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  isCollapsed?: boolean;
  theme?: 'light' | 'dark';
  muted?: boolean;
}

function NavItem({ icon, label, active = false, onClick, isCollapsed = false, theme = 'dark', muted = false }: NavItemProps) {
  return (
    <div 
      className="h-[32px] relative shrink-0 w-full cursor-pointer" 
      data-name="item"
      onClick={onClick}
    >
      <div className="flex flex-row items-center size-full">
        <div className={`box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-full">
              <div className={`rounded-[6px] size-full transition-opacity ${active ? (theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200') + ' opacity-100' : (theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200') + ' opacity-0 hover:opacity-100'}`} data-name="hover-background" />
            </div>
          </div>
          <div className={`relative shrink-0 size-[18px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {icon}
          </div>
          {!isCollapsed && (
            <p className={`basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] ${
              muted 
                ? (theme === 'dark' ? 'text-zinc-400' : 'text-gray-600')
                : (theme === 'dark' ? 'text-white' : 'text-gray-900')
            }`}>
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrgSelector({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  const { selectedTeamId, setSelectedTeamId, teams, isLoading } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  
  // Find the selected team name
  const selectedTeam = selectedTeamId
    ? teams.find(t => t.id === selectedTeamId)
    : null;
  const displayName = selectedTeam ? selectedTeam.name : 'All teams';
  
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="org">
      <div className="relative rounded-[6px] shrink-0 w-full" data-name="field">
        <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[6px] ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`} />
        <div className="flex flex-row items-center size-full">
          <div
            className="box-border content-stretch flex gap-[10px] items-center pl-[8px] pr-[12px] py-[10px] relative w-full cursor-pointer hover:bg-zinc-800/30 rounded-[6px] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <div className="basis-0 content-stretch flex gap-[8px] grow items-center min-h-px min-w-px relative shrink-0" data-name="text">
              <div className={`basis-0 flex flex-col font-['Inter:Regular',sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <p className="leading-[20px]">{isLoading ? 'Loading...' : displayName}</p>
              </div>
            </div>
            <div className="relative shrink-0 size-[20px]" data-name="icon-chevronsupdown">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <g>
                  <path d={svgPaths.p1b213800} stroke={theme === 'dark' ? 'white' : 'black'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                  <path d={svgPaths.p84f8000} stroke={theme === 'dark' ? 'white' : 'black'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div
          className={`absolute top-[52px] left-0 right-0 rounded-[6px] border shadow-lg z-50 overflow-hidden max-h-[300px] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* All teams option */}
          <div
            className={`px-[12px] py-[8px] cursor-pointer transition-colors ${
              !selectedTeamId
                ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTeamId(null);
              setIsOpen(false);
            }}
          >
            <p className={`font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px]`}>
              All teams
            </p>
          </div>
          
          {/* Individual teams */}
          {teams.map((team) => (
            <div
              key={team.id}
              className={`px-[12px] py-[8px] cursor-pointer transition-colors ${
                selectedTeamId === team.id
                  ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                  : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTeamId(team.id);
                setIsOpen(false);
              }}
            >
              <p className={`font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px]`}>
                {team.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function BottomLink({ icon, label, href, isCollapsed = false, theme = 'dark' }: { icon: React.ReactNode; label: string; href: string; isCollapsed?: boolean; theme?: 'light' | 'dark' }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Open in user's default browser
    window.electronAPI.openExternal(href);
  };

  return (
    <div
      onClick={handleClick}
      className="h-[32px] relative shrink-0 w-full cursor-pointer"
    >
      <div className="flex flex-row items-center size-full">
        <div className={`box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-full">
              <div className={`rounded-[6px] size-full transition-opacity ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} opacity-0 hover:opacity-100`} />
            </div>
          </div>
          <div className={`relative shrink-0 size-[18px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {icon}
          </div>
          {!isCollapsed && (
            <p className={`basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DeployButton({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <button 
      className={`h-[36px] relative shrink-0 w-full cursor-pointer bg-cyan-500 hover:bg-cyan-600 rounded-[6px] transition-colors shadow-sm shadow-cyan-500/20 ${isCollapsed ? 'px-[8px]' : 'px-[12px]'}`}
      onClick={(e) => {
        e.stopPropagation();
        // Handle deploy action
        console.log('Deploy');
      }}
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className={`box-border content-stretch flex gap-[8px] h-full items-center relative ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative shrink-0 size-[18px] text-white">
            <svg className="block size-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          {!isCollapsed && (
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">
              Deploy
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function SideNav({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: 'servers' | 'mcp-servers' | 'catalog' | 'tools' | 'prompts' | 'resources' | 'agents' | 'metrics' | 'plugins' | 'tracing' | 'playground' | 'settings') => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  return (
    <div 
      className={`box-border content-stretch flex flex-col gap-[16px] h-full items-start relative shrink-0 transition-all duration-300 cursor-pointer ${isCollapsed ? 'w-[50px] p-[8px]' : 'w-[250px] p-[16px]'} ${theme === 'dark' ? '' : 'bg-white'}`}
      data-name="nav"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <div aria-hidden="true" className={`absolute border-[0px_1px_0px_0px] border-solid ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'} bottom-0 left-0 pointer-events-none right-[-1px] top-0`} />
      
      {!isCollapsed && <OrgSelector theme={theme} />}
      
      {/* Main Navigation */}
      <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
        <NavItem 
          icon={<MCPIcon />} 
          label="MCP Servers" 
          active={currentPage === 'mcp-servers'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('mcp-servers');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<Server size={18} strokeWidth={1.5} />}
          label="Virtual Servers"
          active={currentPage === 'servers'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('servers');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem 
          icon={<Wrench size={18} strokeWidth={1.5} />} 
          label="Tools" 
          active={currentPage === 'tools'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('tools');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<FileText size={18} strokeWidth={1.5} />}
          label="Prompts"
          active={currentPage === 'prompts'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('prompts');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<Package size={18} strokeWidth={1.5} />}
          label="Resources"
          active={currentPage === 'resources'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('resources');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<Users size={18} strokeWidth={1.5} />}
          label="Agents"
          active={currentPage === 'agents'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('agents');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<MessageSquare size={18} strokeWidth={1.5} />}
          label="Playground"
          active={currentPage === 'playground'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('playground');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<LineChart size={18} strokeWidth={1.5} />}
          label="Metrics"
          active={currentPage === 'metrics'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('metrics');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<Activity size={18} strokeWidth={1.5} />}
          label="Observability"
          active={currentPage === 'tracing'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('tracing');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<Plug size={18} strokeWidth={1.5} />}
          label="Plugins"
          active={currentPage === 'plugins'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('plugins');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <NavItem
          icon={<Store size={18} strokeWidth={1.5} />}
          label="Server Catalog"
          active={currentPage === 'catalog'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('catalog');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
        />
      </div>

      {/* Spacer to push bottom links down */}
      <div className="flex-1" />

      {/* Bottom Links */}
      <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
        <div className={`h-px shrink-0 w-full my-[8px] ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} />
        <NavItem
          icon={<Settings size={18} strokeWidth={1.5} />}
          label="Settings"
          active={currentPage === 'settings'}
          onClick={(e) => {
            e?.stopPropagation();
            onNavigate('settings');
          }}
          isCollapsed={isCollapsed}
          theme={theme}
          muted={true}
        />
        <BottomLink
          icon={<BookOpen size={18} strokeWidth={1.5} />}
          label="Documentation"
          href="https://ibm.github.io/mcp-context-forge"
          isCollapsed={isCollapsed}
          theme={theme}
        />
        <BottomLink 
          icon={<Github size={18} strokeWidth={1.5} />} 
          label="GitHub" 
          href="https://github.com/ibm/mcp-context-forge"
          isCollapsed={isCollapsed}
          theme={theme}
        />
      </div>
    </div>
  );
}