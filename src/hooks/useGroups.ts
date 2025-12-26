import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { AxiosResponse } from 'axios';
import { 
  createGroup as createGroupApi,
  createGroupUsers as createGroupUsersApi,
  getGroups as getGroupsApi,
  updateGroup as updateGroupApi,
  deleteGroup as deleteGroupApi,
  getGroupById as getGroupByIdApi,
  deleteGroupByUser as deleteGroupByUserApi,
  type GroupResponse
} from '@/api/groupApi';
import { useToast } from '@/hooks/use-toast';

export function useGroups() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all groups
  const { 
    data: groups = [], 
    isLoading: isLoadingGroups, 
    error: groupsError,
    refetch: refetchGroups 
  } = useQuery<AxiosResponse<GroupResponse>, Error>({
    queryKey: ['groups'],
    queryFn: () => getGroupsApi({}),
  });

  // Handle error effect
  useEffect(() => {
    if (groupsError) {
      toast({
        title: 'Error',
        description: 'Failed to fetch groups',
        variant: 'destructive',
      });
      console.error('Error fetching groups:', groupsError);
    }
  }, [groupsError, toast]);

  // Create group mutation
  const { mutate: createGroup, isPending: isCreatingGroup } = useMutation({
    mutationFn: createGroupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Success',
        description: 'Group created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
      console.error('Error creating group:', error);
    },
  });

  // Update group mutation
  const { mutate: updateGroup, isPending: isUpdatingGroup } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateGroupApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Success',
        description: 'Group updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update group',
        variant: 'destructive',
      });
      console.error('Error updating group:', error);
    },
  });

  // Delete group mutation
  const { mutate: deleteGroup, isPending: isDeletingGroup } = useMutation({
    mutationFn: (id: string) => deleteGroupApi(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Success',
        description: 'Group deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
      console.error('Error deleting group:', error);
    },
  });

  // Add group users mutation
  const { mutate: addGroupUsers, isPending: isAddingGroupUsers } = useMutation({
    mutationFn: createGroupUsersApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Success',
        description: 'Users added to group successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add users to group',
        variant: 'destructive',
      });
      console.error('Error adding users to group:', error);
    },
  });

  // Remove user from group mutation
  const { mutate: removeUserFromGroup } = useMutation({
    mutationFn: (groupId: string) => deleteGroupByUserApi(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Success',
        description: 'User removed from group successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove user from group',
        variant: 'destructive',
      });
      console.error('Error removing user from group:', error);
    },
  });

  // Get group by ID
  const { 
    data: group, 
    isLoading: isLoadingGroup,
    error: groupError
  } = useQuery({
    queryKey: ['group'],
    queryFn: ({ queryKey }) => {
      const [_, id] = queryKey;
      return getGroupByIdApi(id as string);
    },
    enabled: false, // Will not run on mount
  });

  // Helper function to fetch a single group
  const fetchGroupById = (id: string) => {
    return queryClient.fetchQuery({
      queryKey: ['group', id],
      queryFn: () => getGroupByIdApi(id),
    });
  };

  return {
    // Data
    groups,
    group,
    
    // Loading states
    isLoadingGroups,
    isCreatingGroup,
    isUpdatingGroup,
    isDeletingGroup,
    isAddingGroupUsers,
    isLoadingGroup,
    
    // Errors
    groupsError,
    groupError,
    
    // Methods
    createGroup,
    updateGroup,
    deleteGroup,
    addGroupUsers,
    removeUserFromGroup,
    fetchGroupById,
    refetchGroups,
  };
}

export default useGroups;
