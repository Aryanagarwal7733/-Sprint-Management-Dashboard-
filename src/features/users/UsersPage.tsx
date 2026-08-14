import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trash2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface RegisteredUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  image: string;
}

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadUsers = () => {
    const usersJson = localStorage.getItem('sprintdesk_registered_users');
    const usersList: RegisteredUser[] = usersJson ? JSON.parse(usersJson) : [];
    setRegisteredUsers(usersList);
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            You do not have administrative permissions to view or manage registered user profiles.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-2">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    try {
      const usersJson = localStorage.getItem('sprintdesk_registered_users');
      const usersList: RegisteredUser[] = usersJson ? JSON.parse(usersJson) : [];
      const updatedList = usersList.filter((u) => u.id !== selectedUser.id);
      
      localStorage.setItem('sprintdesk_registered_users', JSON.stringify(updatedList));
      setRegisteredUsers(updatedList);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);

      toast({
        title: 'Profile Deleted',
        description: `Successfully deleted user profile for ${selectedUser.firstName} ${selectedUser.lastName}.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the user profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<RegisteredUser>[] = [
    {
      key: 'image',
      label: 'Avatar',
      sortable: false,
      render: (val, row) => (
        <img
          src={val}
          alt={row.firstName}
          className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-1 ring-slate-200 dark:ring-slate-800"
        />
      ),
    },
    {
      key: 'firstName',
      label: 'Full Name',
      sortable: true,
      render: (_, row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">{val}</span>,
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 dark:text-slate-400">@{val}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-850/30">
          {val}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => {
            setSelectedUser(row);
            setIsDeleteModalOpen(true);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-lg transition-all"
          title="Delete User"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-violet-500" />
            User Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage employee accounts and delete profiles of members leaving the company.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={registeredUsers}
          searchPlaceholder="Search employees by email..."
          searchKey="email"
          pageSize={10}
        />
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Confirm Profile Deletion"
      >
        <div className="flex flex-col gap-4 text-center py-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete the user profile for{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ? This action is permanent and will prevent them from logging in.
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
