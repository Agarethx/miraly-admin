import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import {
  listAdmins,
  listPlanners,
  promoteAdmin,
  revokeAdmin,
  setPlanner,
  unsetPlanner,
} from '../infrastructure/users-api';

const adminsKey = ['users', 'admins'] as const;
const plannersKey = ['users', 'planners'] as const;

export function useAdmins() {
  return useQuery({ queryKey: adminsKey, queryFn: listAdmins });
}

export function usePlanners() {
  return useQuery({ queryKey: plannersKey, queryFn: listPlanners });
}

/** All user-management writes, with toasts and cache invalidation centralized. */
export function useUserMutations() {
  const qc = useQueryClient();
  const { success, error } = useNotifications();

  const promote = useMutation({
    mutationFn: (email: string) => promoteAdmin(email),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminsKey });
      success('Administrador agregado.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const revoke = useMutation({
    mutationFn: (userId: string) => revokeAdmin(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminsKey });
      success('Administrador removido.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const makePlanner = useMutation({
    mutationFn: (email: string) => setPlanner(email),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: plannersKey });
      success('Planner agregado.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const removePlanner = useMutation({
    mutationFn: (ownerId: string) => unsetPlanner(ownerId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: plannersKey });
      success('Planner removido.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  return { promote, revoke, makePlanner, removePlanner };
}
