import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { message } from "antd";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const instance: AxiosInstance = axios.create({
  baseURL: "/api", // 使用 vite 代理前缀
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 例如加 token
    // config.headers.Authorization = 'Bearer xxx';
    return config;
  },
  (error) => Promise.reject(error)
);

let last401Time = 0;

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data;

    if (res.code === 200) {
      return res.data; // <<<<<<== 统一返回 data
    }

    // 登录过期
    if (res.code === 401) {
      const now = Date.now();
      if (now - last401Time > 3000) {
        message.error("登录已失效，请重新登录");
        last401Time = now;
      }
      return Promise.reject(res);
    }

    // 其他错误
    message.error(res.message || "请求失败");
    return Promise.reject(res);
  },
  (error: AxiosError) => {
    message.error(error.message || "网络错误");
    return Promise.reject(error);
  }
);

// 创建类型正确的 request 封装
// 响应拦截器已经提取了 data，所以返回类型是 T 而不是 AxiosResponse<T>
interface RequestInstance {
  get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T>;
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>;
  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>;
  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>;
}

const request = instance as unknown as RequestInstance;

export default request;
