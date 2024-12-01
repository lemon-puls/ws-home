// Add a request interceptor
import axios from "axios";

axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // 添加token到请求头
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      console.log('token', token);
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // console.log("响应", response);
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);
