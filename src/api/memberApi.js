import handpassApi from './handpassApi';

/**
 * Add a member to a group
 * @param {Object} memberData - The member data to add
 * @param {string} memberData.group_id - The ID of the group
 * @param {string} memberData.user_id - The ID of the user to add to the group
 * @returns {Promise} - Axios response
 */
export const addGroupMember = (memberData) => {
  return handpassApi.post('/api/group/members', memberData);
};

/**
 * Get all group members
 * @returns {Promise} - Axios response with list of group members
 */
export const getGroupMembers = () => {
  return handpassApi.get('/api/group/members');
};

/**
 * Get a specific group member by ID
 * @param {string} memberId - The ID of the group member to retrieve
 * @returns {Promise} - Axios response with group member details
 */
export const getGroupMemberById = (memberId) => {
  return handpassApi.get(`/api/group/members/${memberId}`);
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
export const updateGroupMember = (memberId, memberData) => {
  return handpassApi.put(`/api/group/members/${memberId}`, memberData);
};

/**
 * Remove a member from a group
 * @param {string} memberId - The ID of the group member to remove
 * @returns {Promise} - Axios response
 */
export const removeGroupMember = (memberId) => {
  return handpassApi.delete(`/api/group/members/${memberId}`);
};


export const getSpecifiGroupMembers = (groupId) => {
  return handpassApi.get(`/api/group/group-members/${groupId}`);
}