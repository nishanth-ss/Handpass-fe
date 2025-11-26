import handpassApi from "./handpassApi";

export const getAllConnectTest = ()=>{
  return handpassApi.get('/connect');
}