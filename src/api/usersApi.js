import handpassApi from './handpassApi';


export const createUser = (userData) => {
  const payload = {
    sn: userData.sn,
    inmate_id: userData.inmate_id,
    name: userData.name,
    image_left: userData.image_left,
    image_right: userData.image_right,
    wiegand_flag: userData.wiegand_flag || 0,
    admin_auth: userData.admin_auth || 0
  };
  
  return handpassApi.post('/v1/add', payload);
};

export const getAllUsers = (endpoint) => {
  const url = endpoint ? '/api/users' + endpoint : 'api/users';
  return handpassApi.get(url);
}