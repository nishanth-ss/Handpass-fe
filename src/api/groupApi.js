import handpassApi from './handpassApi';

/**
 * Create a new group
 * @param {Object} groupData - The group data to create
 * @returns {Promise} - Axios response
 */
export const createGroup = (groupData) => {
  return handpassApi.post('/api/group', groupData);
};

export const createGroupUsers = (groupData) => {
  return handpassApi.post('/api/group/add-group', groupData);
};

/**
 * Get all groups
 * @returns {Promise} - Axios response with groups array
 */
export const getGroups = () => {
  return handpassApi.get('/api/group');
};

/**
 * Update a group
 * @param {string} id - The ID of the group to update
 * @param {Object} groupData - The updated group data
 * @returns {Promise} - Axios response
 */
export const updateGroup = (id, groupData) => {
  return handpassApi.put(`/api/group/${id}`, groupData);
};

/**
 * Delete a group
 * @param {string} id - The ID of the group to delete
 * @param {boolean} [hardDelete=false] - Whether to perform a hard delete
 * @returns {Promise} - Axios response
 */
export const deleteGroup = (id, hardDelete = false) => {
  const url = `/api/group/${id}${hardDelete ? '' : ''}`;
  return handpassApi.delete(url);
};

/**
 * Get a single group by ID
 * @param {string} id - The ID of the group to retrieve
 * @returns {Promise} - Axios response with the group data
 */
export const getGroupById = (id) => {
  return handpassApi.get(`/api/group/${id}`);
};


// User delete specific group
export const deleteGroupByUser = (id) => {
  return handpassApi.delete(`/api/group/members/${id}`);
};