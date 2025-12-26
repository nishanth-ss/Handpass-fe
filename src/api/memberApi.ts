import { api } from "@/api";

/**
 * Add a member to a group
 * @param {Object} memberData - The member data to add
 * @param {string} memberData.group_id - The ID of the group
 * @param {string} memberData.user_id - The ID of the user to add to the group
 * @returns {Promise} - Axios response
 */
export const addGroupMember = (memberData: { group_id: string; user_id: string }) => {
  return api.post('/api/group/members', memberData);
};

/**
 * Get all group members
 * @returns {Promise} - Axios response with list of group members
 */
export const getGroupMembers = () => {
  return api.get('/api/group/members');
};

/**
 * Get a specific group member by ID
 * @param {string} memberId - The ID of the group member to retrieve
 * @returns {Promise} - Axios response with group member details
 */
export const getGroupMemberById = (memberId: string) => {
  return api.get(`/api/group/members/${memberId}`);
};

/**
 * Update a group member
 * @param {string} memberId - The ID of the group member to update
 * @param {Object} memberData - The updated member data
 * @param {string} [memberData.group_id] - New group ID (optional)
 * @param {string} [memberData.user_id] - New user ID (optional)
 * @param {boolean} [memberData.is_allowed] - Whether the member is allowed (optional)
 * @returns {Promise} - Axios response
 */
export const updateGroupMember = (
  memberId: string,
  memberData: {
    group_id?: string;
    user_id?: string;
    is_allowed?: boolean;
  }
) => {
  return api.put(`/api/group/members/${memberId}`, memberData);
};

/**
 * Remove a member from a group
 * @param {string} memberId - The ID of the group member to remove
 * @returns {Promise} - Axios response
 */
export const removeGroupMember = (memberId: string) => {
  return api.delete(`/api/group/members/${memberId}`);
};

/**
 * Get members of a specific group
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Axios response with group members
 */
export const getSpecificGroupMembers = (groupId: string) => {
  return api.get(`/api/group/group-members/${groupId}`);
};

export default {
  addGroupMember,
  getGroupMembers,
  getGroupMemberById,
  updateGroupMember,
  removeGroupMember,
  getSpecificGroupMembers
};
