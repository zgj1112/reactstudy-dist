/// <reference types="bmapgl" />
// global.d.ts 或 vite-env.d.ts

// 声明模块，告诉 TypeScript 导入 .png 文件时，它是一个字符串类型
interface ImportMetaEnv {
  readonly VITE_AI_API_KEY?: string;
  readonly VITE_AI_BASE_URL?: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_AI_SYSTEM_PROMPT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
