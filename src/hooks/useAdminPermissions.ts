import { useAuth } from './useAuth';

export const useAdminPermissions = () => {
  const { profile, loading } = useAuth();

  const role = profile?.role || 'guest';

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isBoard = ['chairman', 'vice_chairman', 'secretary', 'treasurer'].includes(role) || isAdmin;
  const isCoordinator = role === 'coordinator' || isBoard;
  const isEditor = role === 'editor' || isAdmin;
  const isMember = role === 'member' || isEditor || isCoordinator;

  return {
    loading,
    role,
    isSuperAdmin,
    isAdmin,
    isBoard,
    isCoordinator,
    isEditor,
    isMember,
    canManageMembers: isAdmin,
    canManageEvents: isCoordinator,
    canManageStories: isEditor,
    canManageRoles: isSuperAdmin,
    canViewAuditLogs: isAdmin,
    canManageDocuments: isAdmin,
  };
};
