import { Sun, Moon, Bell as BellIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ProfileSelector } from './ProfileSelector';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ProfileForm } from './ProfileForm';
import { useProfiles } from '../hooks/useProfiles';
import type { ProfileCreateRequest } from '../types/profile';

function Logo() {
  const { theme } = useTheme();
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="logo">
      <div className="h-[16px] relative shrink-0 w-[16px]">
        <img
          src={theme === 'dark' ? './icons/contextforge-icon_white_512.png' : './icons/contextforge-icon_black_512.png'}
          alt="Context Forge"
          className="block size-full object-contain"
        />
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

function End() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const { createProfile } = useProfiles();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProfile = async (data: ProfileCreateRequest) => {
    setIsCreating(true);
    try {
      const result = await createProfile(data);
      if (result.success) {
        setShowCreateDialog(false);
        // TODO: Show success toast
      } else {
        // Error is handled in the form
        console.error('Failed to create profile:', result.error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="content-stretch flex gap-[16px] items-center justify-end relative shrink-0" data-name="end">
        <ThemeSwitch />
        <Bell />
        <ProfileSelector
          onCreateProfile={() => setShowCreateDialog(true)}
          onManageProfiles={() => setShowManageDialog(true)}
        />
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Add a new authentication profile for a different environment or account.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            onSubmit={handleCreateProfile}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Profiles Dialog - TODO: Navigate to ProfileManagementPage instead */}
      {showManageDialog && (
        <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Profile Management</DialogTitle>
              <DialogDescription>
                Manage your authentication profiles. For full management features, visit the Settings page.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 text-center text-muted-foreground">
              Profile management page integration coming soon.
              <br />
              Use the profile selector dropdown for quick switching.
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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