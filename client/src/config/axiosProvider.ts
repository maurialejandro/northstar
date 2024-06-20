import axios from "axios";
import config from "./config";

 export class AxiosProvider {
     // Implement your logic to retrieve the token from storage (e.g., localStorage or cookies)
     getApi(authHeader = true){
        const axiosConfig = { baseURL: config.baseUrl, withCredentials: true }
        return axios.create(!authHeader ? axiosConfig : {...axiosConfig, headers: this.getAuthorization()});
     }

     getAuthorization() {
         return {Authorization: `Bearer ${this.getToken()}`}
     }

     setToken(token: string) {
         localStorage.setItem("supabaseToken", token);
     }

     getToken() {
         return localStorage.getItem("supabaseToken");
     }

     removeToken() {
         localStorage.removeItem("supabaseToken");
     }
 }

export const authProvider = new AxiosProvider();
