import svgPaths from "../imports/svg-00ihbob3cz";
import { Sun, Moon, User, Bell as BellIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCurrentUser } from '../hooks/useCurrentUser';

function Logo() {
  const { theme } = useTheme();
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="logo">
      <div className="h-[10px] relative shrink-0 w-[16px]">
        <div className="absolute inset-0" style={{ "--fill-0": theme === 'dark' ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10">
            <path clipRule="evenodd" d={svgPaths.p461f600} fill="var(--fill-0, white)" fillRule="evenodd" />
          </svg>
        </div>
      </div>
      <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Context Forge</p>
    </div>
  );
}

function Bell() {
  const { theme } = useTheme();
  return (
    <button className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 cursor-pointer group" data-name="bell">
      <div className={`${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} opacity-0 rounded-[6px] size-[32px] group-hover:opacity-100 transition-opacity absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none`} data-name="hover-background" />
      <div className="relative shrink-0 size-[20px] z-[1]" data-name="bell">
        <BellIcon size={20} strokeWidth={1.5} className="text-zinc-400" />
      </div>
    </button>
  );
}

function Avatar() {
  return (
    <div className="box-border content-stretch flex h-[24px] isolate items-center relative shrink-0" data-name="avatar">
      <div className="relative shrink-0 size-[20px] z-[1]" data-name="Profile photo for an enterprise user">
        <User size={20} strokeWidth={1.5} className="text-zinc-400" />
      </div>
    </div>
  );
}

function Count() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="count">
      <div className="overflow-clip relative shrink-0 size-[20px] text-zinc-400" data-name="chevrons-up-down">
        <div className="absolute inset-[16.67%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-8.33%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 14">
              <path d={svgPaths.p1f8c3380} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { theme } = useTheme();
  const { user, loading } = useCurrentUser();
  
  return (
    <button className="content-stretch flex gap-[8px] items-center relative shrink-0 cursor-pointer group px-2" data-name="profile">
      <div className={`${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} h-[32px] opacity-0 rounded-[6px] group-hover:opacity-100 transition-opacity absolute inset-0 pointer-events-none`} data-name="hover-background" />
      {!loading && user?.email && (
        <span className={`font-['Inter',sans-serif] text-[14px] relative z-[1] ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
          {user.email}
        </span>
      )}
      <Avatar />
      <Count />
    </button>
  );
}

function End() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-end relative shrink-0" data-name="end">
      <ThemeSwitch />
      <Bell />
      <Profile />
    </div>
  );
}

function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="content-stretch flex gap-[8px] items-center relative shrink-0 cursor-pointer group"
      data-name="theme-switch"
    >
      <div className={`${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} h-[32px] w-[32px] opacity-0 rounded-[6px] group-hover:opacity-100 transition-opacity absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none`} data-name="hover-background" />
      <div className="relative shrink-0 size-[20px] text-zinc-400 z-[1]">
        {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
      </div>
    </button>
  );
}

export function TopNav() {
  const { theme } = useTheme();
  return (
    <div className={`h-[48px] relative shrink-0 w-full ${theme === 'dark' ? '' : 'bg-white'}`} data-name="nav">
      <div aria-hidden="true" className={`absolute border-[0px_0px_1px] border-solid ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'} inset-0 pointer-events-none`} />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[48px] items-center justify-between pl-[16px] pr-[14px] py-[6px] relative w-full">
          <Logo />
          <End />
        </div>
      </div>
    </div>
  );
}