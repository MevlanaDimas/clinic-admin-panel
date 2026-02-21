import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can add global error handling logic here
        return Promise.reject(error);
    }
);

export default api;
