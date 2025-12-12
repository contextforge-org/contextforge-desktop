/**
 * Profile Management Page
 * Complete interface for managing authentication profiles
 */

import React, { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileForm } from './ProfileForm';
import type { AuthProfile, ProfileCreateRequest, ProfileUpdateRequest } from '../types/profile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Clock,
  Globe,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type DialogMode = 'create' | 'edit' | null;

export function ProfileManagementPage() {
  const { profiles, currentProfile, loading, createProfile, updateProfile, deleteProfile, switchProfile } = useProfiles();
  
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedProfile, setSelectedProfile] = useState<AuthProfile | null>(null);
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<AuthProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProfile = async (data: ProfileCreateRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createProfile(data);
      if (result.success) {
        setDialogMode(null);
        // TODO: Show success toast
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (data: ProfileUpdateRequest) => {
    if (!selectedProfile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateProfile(selectedProfile.id, data);
      if (result.success) {
        setDialogMode(null);
        setSelectedProfile(null);
        // TODO: Show success toast
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!deleteConfirmProfile) return;

    try {
      const result = await deleteProfile(deleteConfirmProfile.id);
      if (result.success) {
        setDeleteConfirmProfile(null);
        // TODO: Show success toast
      } else {
        setError(result.error || 'Failed to delete profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  const handleSwitchProfile = async (profile: AuthProfile) => {
    if (profile.id === currentProfile?.id) return;

    try {
      const result = await switchProfile(profile.id);
      if (!result.success) {
        setError(result.error || 'Failed to switch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch profile');
    }
  };

  const openEditDialog = (profile: AuthProfile) => {
    setSelectedProfile(profile);
    setDialogMode('edit');
    setError(null);
  };

  const openCreateDialog = () => {
    setSelectedProfile(null);
    setDialogMode('create');
    setError(null);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedProfile(null);
    setError(null);
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
    switch (env) {
      case 'production':
        return 'bg-red-500';
      case 'staging':
        return 'bg-yellow-500';
      case 'development':
        return 'bg-blue-500';
      case 'local':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your authentication profiles for different environments
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Profile
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Profiles Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first profile to get started with multi-profile authentication
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map(profile => (
            <Card
              key={profile.id}
              className={`relative ${profile.id === currentProfile?.id ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={getEnvironmentColor(profile.metadata?.environment)}>
                        {getProfileInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {profile.name}
                        {profile.id === currentProfile?.id && (
                          <Badge variant="default" className="text-xs">
                            <Check className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      {profile.metadata?.environment && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {profile.metadata.environment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{profile.apiUrl}</span>
                </div>
                {profile.metadata?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {profile.metadata.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(profile.createdAt)}</span>
                </div>
                {profile.lastUsed && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Last used {formatDate(profile.lastUsed)}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {profile.id !== currentProfile?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSwitchProfile(profile)}
                    >
                      Switch
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmProfile(profile)}
                    disabled={profile.id === currentProfile?.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create New Profile' : 'Edit Profile'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Add a new authentication profile for a different environment or account.'
                : 'Update the profile information. Changes will be saved immediately.'}
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            profile={selectedProfile || undefined}
            onSubmit={dialogMode === 'create' ? handleCreateProfile : handleUpdateProfile}
            onCancel={closeDialog}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmProfile !== null}
        onOpenChange={(open) => !open && setDeleteConfirmProfile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the profile "{deleteConfirmProfile?.name}"?
              This action cannot be undone and will remove all stored credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
