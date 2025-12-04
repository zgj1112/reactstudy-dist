import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mars3dPlugin } from "vite-plugin-mars3d";
import { Plugin } from "vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://8888-iogtq419mgcohtwlakw52-95227009.manusvm.computer", // 目标 API 地址
        // target: "http://139.159.152.231:40002", // 目标 API 地址
        changeOrigin: true, // 允许跨域请求
        rewrite: (path) => path.replace(/^\/api/, ""), // 重写路径，将 /api 前缀移除
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      "@view": path.resolve(__dirname, "src/view"),
      "@components": path.resolve(__dirname, "src/view/components"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@api": path.resolve(__dirname, "src/api"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  plugins: [react(), mars3dPlugin() as unknown as Plugin],
  base: "/react-study/",
});
