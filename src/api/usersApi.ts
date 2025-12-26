import { api } from "@/api";

export const getAllUsers = async (endpoint = '') => {
  try{
    const { data } = await api.get(`/api/users${endpoint}`);
    console.log("data",data);
    
    return data;

  }catch(err){
    console.log(err);
    
  }
};
