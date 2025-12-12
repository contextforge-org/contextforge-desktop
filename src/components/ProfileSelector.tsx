/**
 * Profile Selector Component
 * Dropdown for switching between authentication profiles
 */

import React from 'react';
import { useProfiles } from '../hooks/useProfiles';
import { useTheme } from '../context/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Check, ChevronDown, Plus, Settings, LogOut } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProfileSelectorProps {
  onManageProfiles?: () => void;
  onCreateProfile?: () => void;
}

export function ProfileSelector({ onManageProfiles, onCreateProfile }: ProfileSelectorProps) {
  const { profiles, currentProfile, loading, switchProfile, logout } = useProfiles();
  const { theme } = useTheme();

  const handleSwitchProfile = async (profileId: string) => {
    if (profileId === currentProfile?.id) return;
    
    try {
      const result = await switchProfile(profileId);
      if (!result.success) {
        console.error('Failed to switch profile:', result.error);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error switching profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // TODO: Show success toast
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getProfileInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getEnvironmentColor = (env?: string) => {
    // Subdued color scheme matching the team dropdown
    switch (env) {
      case 'production':
        return 'bg-red-900/80 text-red-100';
      case 'staging':
        return 'bg-yellow-900/80 text-yellow-100';
      case 'development':
        return 'bg-blue-900/80 text-blue-100';
      case 'local':
        return 'bg-green-900/80 text-green-100';
      default:
        return 'bg-zinc-700 text-zinc-200';
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300" />
      </Button>
    );
  }

  if (!currentProfile) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateProfile}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Profile
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className={getEnvironmentColor(currentProfile.metadata?.environment)}>
              {getProfileInitials(currentProfile.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block">{currentProfile.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-64 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}
      >
        <DropdownMenuLabel className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
          <div className="flex flex-col space-y-1">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {currentProfile.name}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
              {currentProfile.email}
            </p>
            {currentProfile.metadata?.environment && (
              <Badge
                variant="outline"
                className={`w-fit text-xs ${theme === 'dark' ? 'border-zinc-700 text-zinc-300' : 'border-gray-300 text-gray-700'}`}
              >
                {currentProfile.metadata.environment}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
        
        {profiles.length > 1 && (
          <>
            <DropdownMenuLabel className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
              Switch Profile
            </DropdownMenuLabel>
            {profiles
              .filter(p => p.id !== currentProfile.id)
              .map(profile => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => handleSwitchProfile(profile.id)}
                  className={`cursor-pointer ${
                    theme === 'dark'
                      ? 'text-white hover:bg-zinc-800 focus:bg-zinc-800'
                      : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
                  }`}
                >
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarFallback className={getEnvironmentColor(profile.metadata?.environment)}>
                      {getProfileInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm">{profile.name}</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                      {profile.email}
                    </span>
                  </div>
                  {profile.isActive && (
                    <Check className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  )}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
          </>
        )}
        
        <DropdownMenuItem
          onClick={onCreateProfile}
          className={`cursor-pointer ${
            theme === 'dark'
              ? 'text-white hover:bg-zinc-800 focus:bg-zinc-800'
              : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
          }`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={onManageProfiles}
          className={`cursor-pointer ${
            theme === 'dark'
              ? 'text-white hover:bg-zinc-800 focus:bg-zinc-800'
              : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
          }`}
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage Profiles
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
        
        <DropdownMenuItem
          onClick={handleLogout}
          className={`cursor-pointer ${
            theme === 'dark'
              ? 'text-red-400 hover:bg-zinc-800 focus:bg-zinc-800'
              : 'text-red-600 hover:bg-gray-100 focus:bg-gray-100'
          }`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
