import handpassApi from './handpassApi';

// Connection test API: baseURL + '/connect'
// Payload example: { "sn": "sjfljfdsjfds" }
export const connectTest = (sn) => {
  const payload = { sn };
  return handpassApi.post('/connect', payload);
};

export const getAllConnectTest = ()=>{
  return handpassApi.get('/connect');
}