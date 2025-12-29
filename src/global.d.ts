/// <reference types="bmapgl" />
// global.d.ts 或 vite-env.d.ts

// 声明模块，告诉 TypeScript 导入 .png 文件时，它是一个字符串类型
declare module '*.png' {
  const value: string;
  export default value;
}

// 如果您还导入了其他静态资源，也可以一并声明
declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

// CSS Modules 声明
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}