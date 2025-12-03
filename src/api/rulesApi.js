import handpassApi from './handpassApi';

/**
 * Create a new rule for a group
 * @param {Object} ruleData - The rule data to create
 * @param {string} ruleData.group_id - The ID of the group
 * @param {string} ruleData.rule_name - The name of the rule
 * @param {string[]} ruleData.days - Array of days (e.g., ["Mon", "Tue"])
 * @param {string} ruleData.start_time - Start time in HH:MM format
 * @param {string} ruleData.end_time - End time in HH:MM format
 * @param {boolean} ruleData.allow_cross_midnight - Whether the rule can cross midnight
 * @returns {Promise} - Axios response
 */
export const createRule = (ruleData) => {
  return handpassApi.post('/api/group/rules', ruleData);
};

/**
 * Get all rules for a group
 * @param {string} groupId - The ID of the group
 * @returns {Promise} - Axios response with rules array
 */
export const getRules = () => {
  return handpassApi.get(`/api/group/rules`);
};

/**
 * Get a single rule by ID
 * @param {string} ruleId - The ID of the rule to retrieve
 * @returns {Promise} - Axios response with the rule data
 */
export const getRuleById = (ruleId) => {
  return handpassApi.get(`/api/group/rules/${ruleId}`);
};

/**
 * Update a rule
 * @param {string} ruleId - The ID of the rule to update
 * @param {Object} ruleData - The updated rule data
 * @returns {Promise} - Axios response
 */
export const updateRule = (ruleId, ruleData) => {
  return handpassApi.put(`/api/group/rules/${ruleId}`, ruleData);
};

/**
 * Delete a rule
 * @param {string} ruleId - The ID of the rule to delete
 * @returns {Promise} - Axios response
 */
export const deleteRule = (ruleId) => {
  return handpassApi.delete(`/api/group/rules/${ruleId}`);
};
