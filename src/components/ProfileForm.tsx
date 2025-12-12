/**
 * Profile Form Component
 * Form for creating and editing authentication profiles
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { AuthProfile, ProfileCreateRequest, ProfileUpdateRequest } from '../types/profile';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import * as profileApi from '../lib/api/profile-api-ipc';

interface ProfileFormProps {
  profile?: AuthProfile;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  apiUrl: string;
  environment: 'production' | 'staging' | 'development' | 'local';
  description: string;
}

export function ProfileForm({ profile, onSubmit, onCancel, isLoading }: ProfileFormProps) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      password: '',
      confirmPassword: '',
      apiUrl: profile?.apiUrl || 'http://localhost:4444',
      environment: profile?.metadata?.environment || 'local',
      description: profile?.metadata?.description || '',
    }
  });

  const password = watch('password');
  const isEditMode = !!profile;

  const onFormSubmit = async (data: FormData) => {
    setError(null);

    // Validate passwords match for new profiles
    if (!isEditMode && data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password is provided for new profiles
    if (!isEditMode && !data.password) {
      setError('Password is required');
      return;
    }

    try {
      const profileData: ProfileCreateRequest | ProfileUpdateRequest = {
        name: data.name,
        email: data.email,
        apiUrl: data.apiUrl,
        metadata: {
          environment: data.environment,
          description: data.description || undefined,
        }
      };

      // Only include password if it's provided (for updates) or required (for creation)
      if (data.password) {
        (profileData as ProfileCreateRequest).password = data.password;
      }

      await onSubmit(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setError(null);
    setTestSuccess(false);

    const formData = watch();
    
    if (!formData.apiUrl || !formData.email || !formData.password) {
      setError('Please fill in API URL, email, and password to test connection');
      setTestingConnection(false);
      return;
    }

    try {
      const result = await profileApi.testCredentials(formData.email, formData.password, formData.apiUrl);
      
      if (result.success) {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 3000); // Clear success message after 3 seconds
      } else {
        setError('Connection test failed: ' + (result.error || 'Invalid credentials or unreachable server'));
      }
    } catch (err) {
      setError('Connection test failed: ' + (err instanceof Error ? err.message : 'Invalid credentials or unreachable server'));
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {testSuccess && (
        <Alert className={`${theme === 'dark' ? 'border-green-700 bg-green-950/50' : 'border-green-500 bg-green-50'}`}>
          <CheckCircle className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          <AlertDescription className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
            Connection test successful! Credentials are valid.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Profile Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>
            Profile Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Production, Development, Local"
            {...register('name', { required: 'Profile name is required' })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>
            Password {!isEditMode && <span className="text-red-500">*</span>}
            {isEditMode && <span className="text-sm text-muted-foreground ml-2">(leave blank to keep current)</span>}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={isEditMode ? '••••••••' : 'Enter password'}
              {...register('password', {
                required: !isEditMode ? 'Password is required' : false,
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password (only for new profiles) */}
        {!isEditMode && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        {/* API URL */}
        <div className="space-y-2">
          <Label htmlFor="apiUrl" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>
            API URL <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="apiUrl"
              placeholder="http://localhost:4444"
              {...register('apiUrl', {
                required: 'API URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Invalid URL format'
                }
              })}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={testingConnection || !watch('apiUrl')}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </Button>
          </div>
          {errors.apiUrl && (
            <p className="text-sm text-red-500">{errors.apiUrl.message}</p>
          )}
        </div>

        {/* Environment */}
        <div className="space-y-2">
          <Label htmlFor="environment" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>Environment</Label>
          <Select
            value={watch('environment')}
            onValueChange={(value) => setValue('environment', value as any, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className={theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}>Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add notes about this profile..."
            rows={3}
            {...register('description')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || (!isDirty && isEditMode)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditMode ? 'Update Profile' : 'Create Profile'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
