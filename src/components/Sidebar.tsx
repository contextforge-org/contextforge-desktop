import { useState } from 'react';
import svgPaths from "../imports/svg-00ihbob3cz";
import { Server, Wrench, FileText, Folder, Bot, BarChart3, Plug, Book, Github } from 'lucide-react';

const navItems = [
  { icon: Server, label: 'MCP Servers', active: false },
  { icon: Server, label: 'Virtual Servers', active: true },
  { icon: Wrench, label: 'Tools', active: false },
  { icon: FileText, label: 'Prompts', active: false },
  { icon: Folder, label: 'Resources', active: false },
  { icon: Bot, label: 'Agents', active: false },
  { icon: BarChart3, label: 'Metrics', active: false },
  { icon: Plug, label: 'Plugins', active: false },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('Virtual Servers');

  return (
    <div className="box-border flex flex-col h-full items-start p-[16px] w-[250px] shrink-0 border-r border-zinc-800">
      {/* Org selector */}
      <div className="flex flex-col gap-[8px] items-start w-full mb-4">
        <div className="rounded-[6px] w-full border border-zinc-800">
          <div className="flex flex-row items-center size-full">
            <div className="box-border flex gap-[10px] items-center pl-[8px] pr-[12px] py-[10px] w-full">
              <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px">
                <p className="text-white">All teams</p>
              </div>
              <div className="shrink-0 size-[20px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p1b213800} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                  <path d={svgPaths.p84f8000} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex flex-col gap-[4px] items-start w-full mb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className="h-[32px] w-full group"
            >
              <div className="flex flex-row items-center size-full">
                <div className="box-border flex gap-[8px] h-[32px] items-center px-[8px] py-0 w-full relative">
                  <div className={`absolute inset-0 flex items-center justify-center rounded-[6px] ${isActive ? 'bg-zinc-800' : 'bg-transparent group-hover:bg-zinc-800/50'}`} />
                  <Icon className="shrink-0 size-[18px] text-zinc-400 z-10" />
                  <p className="shrink-0 text-white z-10">{item.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="bg-zinc-800 h-px shrink-0 w-full mb-4" />

      {/* Bottom links */}
      <div className="flex flex-col gap-[4px] items-start w-full mt-auto">
        <button className="h-[32px] w-full group">
          <div className="flex flex-row items-center size-full">
            <div className="box-border flex gap-[8px] h-[32px] items-center px-[8px] py-0 w-full relative">
              <div className="absolute inset-0 flex items-center justify-center rounded-[6px] bg-transparent group-hover:bg-zinc-800/50" />
              <Book className="shrink-0 size-[18px] text-zinc-400 z-10" />
              <p className="shrink-0 text-white z-10">Documentation</p>
            </div>
          </div>
        </button>
        <button className="h-[32px] w-full group">
          <div className="flex flex-row items-center size-full">
            <div className="box-border flex gap-[8px] h-[32px] items-center px-[8px] py-0 w-full relative">
              <div className="absolute inset-0 flex items-center justify-center rounded-[6px] bg-transparent group-hover:bg-zinc-800/50" />
              <Github className="shrink-0 size-[18px] text-zinc-400 z-10" />
              <p className="shrink-0 text-white z-10">GitHub</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
