import axios from "axios";
const API_BASE_URL = "http://localhost:8000";



const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

apiClient.interceptors.request.use(
(config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    else {
        console.warn('No access token found. Request might fail.');
    }
    return config;
},
(error) => {
    return Promise.reject(error);
}
);


apiClient.interceptors.response.use(
(response) => response,
    
    (error) => {   
        if (error.response.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";

            
        }
        return Promise.reject(error);
    }
);


export default apiClient;

