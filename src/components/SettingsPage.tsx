import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Users, Network, Key, Globe, Lock, Plus, Pencil, Trash2, X, BarChart3, XCircle, FolderTree, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { PageHeader, DataTable, Column, ActionButtons, StatusBadge, FormCard } from './common';
import { useUserActions } from '../hooks/useUserActions';
import { useTeamActions, type Team } from '../hooks/useTeamActions';
import { useTokenActions, type APIToken } from '../hooks/useTokenActions';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { User } from '../lib/api/type-mappers';
import { PermissionsCheckboxGroup } from './PermissionsCheckboxGroup';
import { ServerSelector } from './ServerSelector';
import * as api from '../lib/api/contextforge-api-ipc';
import type { PermissionListResponse } from '../lib/contextforge-client-ts';

export function SettingsPage() {
  const { theme } = useTheme();
  
  // Check authentication
  const { user: currentUser, loading: authLoading, error: authError } = useCurrentUser();
  
  // Use custom hooks for data management
  const {
    users: usersData,
    loading: usersLoading,
    error: usersError,
    loadUsers,
    createUser,
    updateUser,
    deleteUser
  } = useUserActions();
  
  const {
    teams: teamsData,
    loading: teamsLoading,
    error: teamsError,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam
  } = useTeamActions();
  
  const {
    tokens: apiTokensData,
    loading: tokensLoading,
    error: tokensError,
    loadTokens,
    createToken,
    updateToken,
    revokeToken
  } = useTokenActions();
  
  // Load data only when authenticated
  useEffect(() => {
    if (currentUser && !authLoading) {
      loadUsers();
      loadTeams();
      loadTokens();
      
      // Fetch available permissions
      const fetchPermissions = async () => {
        try {
          setPermissionsLoading(true);
          const perms = await api.getAvailablePermissions();
          setAvailablePermissions(perms);
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        } finally {
          setPermissionsLoading(false);
        }
      };
      
      // Fetch virtual servers
      const fetchServers = async () => {
        try {
          setServersLoading(true);
          const servers = await api.listServers();
          setVirtualServers(servers.map(s => ({
            id: s.id,
            name: s.name,
            status: s.isActive ? 'active' : 'inactive'
          })));
        } catch (error) {
          console.error('Failed to fetch servers:', error);
        } finally {
          setServersLoading(false);
        }
      };
      
      fetchPermissions();
      fetchServers();
    }
  }, [currentUser, authLoading, loadUsers, loadTeams, loadTokens]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [showAddTokenForm, setShowAddTokenForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'User' as 'Admin' | 'User'
  });
  const [editUserData, setEditUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'User' as 'Admin' | 'User'
  });
  const [newTeamData, setNewTeamData] = useState({
    teamName: '',
    description: '',
    visibility: 'Private' as 'Public' | 'Private',
    maxMembers: 50
  });
  const [editTeamData, setEditTeamData] = useState({
    teamName: '',
    description: '',
    visibility: 'Private' as 'Public' | 'Private',
    maxMembers: 50
  });
  const [newTokenData, setNewTokenData] = useState({
    tokenName: '',
    expiresInDays: 365,
    description: '',
    serverId: '__none__',
    ipRestrictions: '',
    permissions: [] as string[]
  });

  // New state for permissions and servers
  const [availablePermissions, setAvailablePermissions] = useState<PermissionListResponse | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [virtualServers, setVirtualServers] = useState<Array<{ id: string; name: string; status?: string }>>([]);
  const [serversLoading, setServersLoading] = useState(false);

  const handleAddUser = async () => {
    if (newUserData.fullName && newUserData.email && newUserData.password) {
      try {
        await createUser({
          email: newUserData.email,
          password: newUserData.password,
          fullName: newUserData.fullName,
          role: newUserData.role
        });
        setNewUserData({ fullName: '', email: '', password: '', role: 'User' });
        setShowAddUserForm(false);
      } catch (error) {
        // Error already handled by hook with toast
        console.error('Failed to create user:', error);
      }
    }
  };

  const handleCancelAddUser = () => {
    setNewUserData({ fullName: '', email: '', password: '', role: 'User' });
    setShowAddUserForm(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowAddUserForm(false);
  };

  const handleSaveEditUser = async () => {
    if (editingUser && editUserData.fullName) {
      try {
        await updateUser(editingUser.email, {
          fullName: editUserData.fullName,
          password: editUserData.password || undefined,
          role: editUserData.role
        });
        setEditingUser(null);
        setEditUserData({ fullName: '', email: '', password: '', role: 'User' });
      } catch (error) {
        // Error already handled by hook with toast
        console.error('Failed to update user:', error);
      }
    }
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
    setEditUserData({ fullName: '', email: '', password: '', role: 'User' });
  };

  const handleAddTeam = async () => {
    if (newTeamData.teamName) {
      try {
        await createTeam({
          teamName: newTeamData.teamName,
          description: newTeamData.description,
          visibility: newTeamData.visibility,
          maxMembers: newTeamData.maxMembers
        });
        setNewTeamData({ teamName: '', description: '', visibility: 'Private', maxMembers: 50 });
        setShowAddTeamForm(false);
      } catch (error) {
        console.error('Failed to create team:', error);
      }
    }
  };

  const handleCancelAddTeam = () => {
    setNewTeamData({ teamName: '', description: '', visibility: 'Private', maxMembers: 50 });
    setShowAddTeamForm(false);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamData({
      teamName: team.teamName,
      description: team.description,
      visibility: team.visibility,
      maxMembers: team.maxMembers
    });
    setShowAddTeamForm(false);
  };

  const handleSaveEditTeam = async () => {
    if (editingTeam && editTeamData.teamName) {
      try {
        await updateTeam(editingTeam.id, {
          teamName: editTeamData.teamName,
          description: editTeamData.description,
          visibility: editTeamData.visibility,
          maxMembers: editTeamData.maxMembers
        });
        setEditingTeam(null);
        setEditTeamData({ teamName: '', description: '', visibility: 'Private', maxMembers: 50 });
      } catch (error) {
        console.error('Failed to update team:', error);
      }
    }
  };

  const handleCancelEditTeam = () => {
    setEditingTeam(null);
    setEditTeamData({ teamName: '', description: '', visibility: 'Private', maxMembers: 50 });
  };

  const handleAddToken = async () => {
    if (newTokenData.tokenName) {
      try {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + newTokenData.expiresInDays);

        // Convert "__none__" to empty string for server ID
        const serverId = newTokenData.serverId === '__none__' ? '' : newTokenData.serverId;

        // Format expiration date as YYYY-MM-DD
        const expiresDate = expirationDate.toISOString().split('T')[0] || '';

        await createToken({
          tokenName: newTokenData.tokenName,
          expires: expiresDate,
          description: newTokenData.description,
          serverId: serverId || '',
          permissions: newTokenData.permissions
        });
        setNewTokenData({ tokenName: '', expiresInDays: 365, description: '', serverId: '__none__', ipRestrictions: '', permissions: [] });
        setShowAddTokenForm(false);
      } catch (error) {
        console.error('Failed to create token:', error);
      }
    }
  };

  const handleCancelAddToken = () => {
    setNewTokenData({ tokenName: '', expiresInDays: 365, description: '', serverId: '__none__', ipRestrictions: '', permissions: [] });
    setShowAddTokenForm(false);
  };

  // Show authentication message if not logged in
  if (authError || (!authLoading && !currentUser)) {
    return (
      <div className={`h-full overflow-auto ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <div className="max-w-[1400px] mx-auto p-8">
          <PageHeader
            title="Settings"
            description="Manage your ContextForge settings and configurations"
            theme={theme}
          />
          <div className={`rounded-lg border p-8 text-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            <Lock className={`size-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Authentication Required
            </h3>
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
              Please log in to access the Settings page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="max-w-[1400px] mx-auto p-8">
        {/* Page Header */}
        <PageHeader
          title="Settings"
          description="Manage your ContextForge settings and configurations"
          theme={theme}
        />

        {/* Settings Accordion */}
        <div className={`rounded-lg border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <Accordion type="single" collapsible className="w-full">
            {/* Users */}
            <AccordionItem value="users" className={`${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
              <AccordionTrigger className={`px-6 hover:no-underline ${theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
                    <Users className={`size-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Users</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Manage user accounts and permissions
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <tr>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Full Name</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Email Address</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Role</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Provider</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Date Added</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium w-24 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'}>
                      {usersLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="size-5 animate-spin" />
                              <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                                Loading users...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : usersData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center">
                            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                              No users found
                            </span>
                          </td>
                        </tr>
                      ) : usersData.map((user) => (
                        <tr
                          key={user.email}
                          className={`border-b last:border-b-0 transition-colors ${
                            theme === 'dark' 
                              ? 'border-zinc-800 hover:bg-zinc-800/80' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.fullName}
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {user.email}
                          </td>
                          <td className="px-4 py-5">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'Admin' 
                                ? theme === 'dark' 
                                  ? 'bg-cyan-900/30 text-cyan-300' 
                                  : 'bg-cyan-100 text-cyan-700'
                                : theme === 'dark'
                                  ? 'bg-zinc-700 text-zinc-300'
                                  : 'bg-gray-200 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {user.provider}
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {new Date(user.dateAdded).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2">
                              <button 
                                className={`p-1.5 rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                                title="Edit user"
                                onClick={() => handleEditUser(user)}
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => deleteUser(user.email)}
                                className={`p-1.5 rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-red-900/30 text-zinc-400 hover:text-red-400' 
                                    : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                                }`}
                                title="Delete user"
                                disabled={usersLoading}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Add User Button */}
                {!showAddUserForm && !editingUser && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowAddUserForm(true)}
                      className={`flex items-center gap-2 ${
                        theme === 'dark' 
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      <Plus size={16} />
                      Add User
                    </Button>
                  </div>
                )}

                {/* Add User Form */}
                {showAddUserForm && (
                  <div className={`mt-4 p-6 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 border-zinc-800' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Add New User
                      </h4>
                      <button
                        onClick={handleCancelAddUser}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-zinc-800 text-zinc-400' 
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Full Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter full name"
                          value={newUserData.fullName}
                          onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Role
                        </label>
                        <Select
                          value={newUserData.role}
                          onValueChange={(value) => setNewUserData({ ...newUserData, role: value as 'Admin' | 'User' })}
                        >
                          <SelectTrigger className={`w-full ${
                            theme === 'dark' 
                              ? 'bg-zinc-800 border-zinc-700 text-white' 
                              : 'bg-white border-gray-300'
                          }`}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white'}>
                            <SelectItem value="User" className={theme === 'dark' ? 'text-white focus:bg-zinc-700 focus:text-white' : ''}>User</SelectItem>
                            <SelectItem value="Admin" className={theme === 'dark' ? 'text-white focus:bg-zinc-700 focus:text-white' : ''}>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6">
                      <Button
                        onClick={handleAddUser}
                        disabled={!newUserData.fullName || !newUserData.email || !newUserData.password}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500' 
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                        }`}
                      >
                        Add User
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelAddUser}
                        className={theme === 'dark' 
                          ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white' 
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Edit User Form */}
                {editingUser && (
                  <div className={`mt-4 p-6 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 border-zinc-800' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Edit User
                      </h4>
                      <button
                        onClick={handleCancelEditUser}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-zinc-800 text-zinc-400' 
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Full Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter full name"
                          value={editUserData.fullName}
                          onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={editUserData.email}
                          onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={editUserData.password}
                          onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Role
                        </label>
                        <Select
                          value={editUserData.role}
                          onValueChange={(value) => setEditUserData({ ...editUserData, role: value as 'Admin' | 'User' })}
                        >
                          <SelectTrigger className={`w-full ${
                            theme === 'dark' 
                              ? 'bg-zinc-800 border-zinc-700 text-white' 
                              : 'bg-white border-gray-300'
                          }`}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white'}>
                            <SelectItem value="User" className={theme === 'dark' ? 'text-white focus:bg-zinc-700 focus:text-white' : ''}>User</SelectItem>
                            <SelectItem value="Admin" className={theme === 'dark' ? 'text-white focus:bg-zinc-700 focus:text-white' : ''}>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6">
                      <Button
                        onClick={handleSaveEditUser}
                        disabled={!editUserData.fullName || !editUserData.email}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500' 
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                        }`}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEditUser}
                        className={theme === 'dark' 
                          ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white' 
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Teams */}
            <AccordionItem value="teams" className={`${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
              <AccordionTrigger className={`px-6 hover:no-underline ${theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                    <Network className={`size-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Teams</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Configure teams and team memberships
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <tr>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Team Name</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Max Members</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Creator</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium w-24 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'}>
                      {teamsData.map((team) => (
                        <tr
                          key={team.id}
                          className={`border-b last:border-b-0 transition-colors ${
                            theme === 'dark' 
                              ? 'border-zinc-800 hover:bg-zinc-800/80' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <div className="flex items-center gap-2">
                              <span>{team.teamName}</span>
                              {team.visibility === 'Public' ? (
                                <Globe
                                  size={14}
                                  className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}
                                  aria-label="Public"
                                />
                              ) : (
                                <Lock
                                  size={14}
                                  className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}
                                  aria-label="Private"
                                />
                              )}
                            </div>
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {team.description}
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {team.maxMembers}
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {team.creator}
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2">
                              <button 
                                className={`p-1.5 rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                                title="Edit team"
                                onClick={() => handleEditTeam(team)}
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                className={`p-1.5 rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-red-900/30 text-zinc-400 hover:text-red-400' 
                                    : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                                }`}
                                title="Delete team"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Add Team Button */}
                {!showAddTeamForm && !editingTeam && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowAddTeamForm(true)}
                      className={`flex items-center gap-2 ${
                        theme === 'dark' 
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      <Plus size={16} />
                      Add Team
                    </Button>
                  </div>
                )}

                {/* Add Team Form */}
                {showAddTeamForm && (
                  <div className={`mt-4 p-6 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 border-zinc-800' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Add New Team
                      </h4>
                      <button
                        onClick={handleCancelAddTeam}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-zinc-800 text-zinc-400' 
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Team Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter team name"
                          value={newTeamData.teamName}
                          onChange={(e) => setNewTeamData({ ...newTeamData, teamName: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Description
                        </label>
                        <Textarea
                          placeholder="Enter team description"
                          value={newTeamData.description}
                          onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Max Members
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter max members"
                          value={newTeamData.maxMembers.toString()}
                          onChange={(e) => setNewTeamData({ ...newTeamData, maxMembers: parseInt(e.target.value) })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6">
                      <Button
                        onClick={handleAddTeam}
                        disabled={!newTeamData.teamName}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500' 
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                        }`}
                      >
                        Add Team
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelAddTeam}
                        className={theme === 'dark' 
                          ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white' 
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Edit Team Form */}
                {editingTeam && (
                  <div className={`mt-4 p-6 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 border-zinc-800' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Edit Team
                      </h4>
                      <button
                        onClick={handleCancelEditTeam}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-zinc-800 text-zinc-400' 
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Team Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter team name"
                          value={editTeamData.teamName}
                          onChange={(e) => setEditTeamData({ ...editTeamData, teamName: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Description
                        </label>
                        <Textarea
                          placeholder="Enter team description"
                          value={editTeamData.description}
                          onChange={(e) => setEditTeamData({ ...editTeamData, description: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Max Members
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter max members"
                          value={editTeamData.maxMembers.toString()}
                          onChange={(e) => setEditTeamData({ ...editTeamData, maxMembers: parseInt(e.target.value) })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6">
                      <Button
                        onClick={handleSaveEditTeam}
                        disabled={!editTeamData.teamName}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500' 
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                        }`}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEditTeam}
                        className={theme === 'dark' 
                          ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white' 
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* API Tokens */}
            <AccordionItem value="api-tokens" className={`${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
              <AccordionTrigger className={`px-6 hover:no-underline ${theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20' : 'bg-gradient-to-br from-violet-100 to-purple-100'}`}>
                    <Key className={`size-5 ${theme === 'dark' ? 'text-violet-400' : 'text-violet-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Tokens</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Manage API tokens and authentication
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <tr>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Token Name</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Permissions</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Dates</th>
                        <th className={`text-left px-4 py-3 text-sm font-medium w-24 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'}>
                      {apiTokensData.map((token) => (
                        <tr
                          key={token.id}
                          className={`border-b last:border-b-0 transition-colors ${
                            theme === 'dark' 
                              ? 'border-zinc-800 hover:bg-zinc-800/80' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-5 text-sm`}>
                            <div className="flex flex-col gap-1">
                              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                {token.tokenName}
                              </span>
                              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                                {token.serverId}
                              </span>
                            </div>
                          </td>
                          <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            {token.description}
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex flex-wrap gap-1">
                              {token.permissions.map((permission, idx) => (
                                <span 
                                  key={idx}
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    permission === 'write'
                                      ? theme === 'dark' 
                                        ? 'bg-orange-900/30 text-orange-300' 
                                        : 'bg-orange-100 text-orange-700'
                                      : permission === 'read'
                                        ? theme === 'dark'
                                          ? 'bg-blue-900/30 text-blue-300'
                                          : 'bg-blue-100 text-blue-700'
                                        : theme === 'dark'
                                          ? 'bg-purple-900/30 text-purple-300'
                                          : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className={`px-4 py-5 text-xs`}>
                            <div className="flex flex-col gap-1">
                              <div className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                                <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Created: </span>
                                {new Date(token.dateCreated).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                                <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Last used: </span>
                                {new Date(token.lastUsed).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                                <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Expires: </span>
                                {new Date(token.expires).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2">
                              <button 
                                className={`p-1.5 rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                                title="Usage stats"
                              >
                                <BarChart3 size={16} />
                              </button>
                              <button 
                                className={`p-1.5 rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-red-900/30 text-zinc-400 hover:text-red-400' 
                                    : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                                }`}
                                title="Revoke token"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Create Token Button */}
                {!showAddTokenForm && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowAddTokenForm(true)}
                      className={`flex items-center gap-2 ${
                        theme === 'dark' 
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      <Plus size={16} />
                      Create Token
                    </Button>
                  </div>
                )}

                {/* Create Token Form */}
                {showAddTokenForm && (
                  <div className={`mt-4 p-6 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 border-zinc-800' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Create New API Token
                      </h4>
                      <button
                        onClick={handleCancelAddToken}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-zinc-800 text-zinc-400' 
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Token Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter token name"
                          value={newTokenData.tokenName}
                          onChange={(e) => setNewTokenData({ ...newTokenData, tokenName: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Expires In (Days)
                        </label>
                        <Input
                          type="number"
                          placeholder="365"
                          value={newTokenData.expiresInDays.toString()}
                          onChange={(e) => setNewTokenData({ ...newTokenData, expiresInDays: parseInt(e.target.value) || 365 })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Description
                        </label>
                        <Textarea
                          placeholder="Enter token description"
                          value={newTokenData.description}
                          onChange={(e) => setNewTokenData({ ...newTokenData, description: e.target.value })}
                          className={theme === 'dark' 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Virtual Server <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>(optional)</span>
                        </label>
                        {serversLoading ? (
                          <div className="flex items-center gap-2 py-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Loading servers...</span>
                          </div>
                        ) : (
                          <ServerSelector
                            servers={virtualServers}
                            value={newTokenData.serverId}
                            onChange={(value) => setNewTokenData({ ...newTokenData, serverId: value })}
                            placeholder="Select a virtual server (optional)"
                          />
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <label className={`block text-sm mb-2 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          IP Restrictions (CIDR)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., 192.168.1.0/24"
                          value={newTokenData.ipRestrictions}
                          onChange={(e) => setNewTokenData({ ...newTokenData, ipRestrictions: e.target.value })}
                          className={theme === 'dark'
                            ? 'bg-zinc-800 border-zinc-700 text-white'
                            : 'bg-white border-gray-300'
                          }
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className={`block text-sm mb-3 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                        }`}>
                          Permissions
                        </label>
                        {permissionsLoading ? (
                          <div className="flex items-center gap-2 py-4">
                            <Loader2 className="animate-spin" size={16} />
                            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Loading permissions...</span>
                          </div>
                        ) : availablePermissions ? (
                          <PermissionsCheckboxGroup
                            permissionsByResource={availablePermissions.permissions_by_resource}
                            selectedPermissions={newTokenData.permissions}
                            onChange={(permissions) => setNewTokenData({ ...newTokenData, permissions })}
                          />
                        ) : (
                          <div className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                            No permissions available
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6">
                      <Button
                        onClick={handleAddToken}
                        disabled={!newTokenData.tokenName}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500' 
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                        }`}
                      >
                        Create Token
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelAddToken}
                        className={theme === 'dark' 
                          ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white' 
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Roots */}
            <AccordionItem value="roots" className={`${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
              <AccordionTrigger className={`px-6 hover:no-underline ${theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-gradient-to-br from-emerald-100 to-teal-100'}`}>
                    <FolderTree className={`size-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Roots</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Configure root directories and paths
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                  <p className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                    Root configuration content goes here. Set up root directories and path configurations.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Export & Import */}
            <AccordionItem value="export-import" className={`${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'} border-b-0`}>
              <AccordionTrigger className={`px-6 hover:no-underline ${theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20' : 'bg-gradient-to-br from-rose-100 to-pink-100'}`}>
                    <ArrowLeftRight className={`size-5 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Export & Import</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Export and import configuration data
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                  <p className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                    Export and import content goes here. Backup and restore your configuration data.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}