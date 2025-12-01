import React from "react";
import { Link } from "react-router-dom";
import "./common/HomePage.css";

// 定义卡片数据结构
interface ModuleCard {
  id: number;
  title: string;
  description: string;
  path: string;
}

// 模块配置数据
const modules: ModuleCard[] = [
  // 基础特性
  // {
  //   id: 1,
  //   title: "样式处理",
  //   description: "React中CSS样式的多种使用方式",
  //   path: "/style",
  // },
  // {
  //   id: 2,
  //   title: "Ref使用",
  //   description: "操作DOM和组件实例的引用",
  //   path: "/ref",
  // },
  // {
  //   id: 3,
  //   title: "Props传递",
  //   description: "组件间的数据和方法传递",
  //   path: "/props",
  // },
  // {
  //   id: 4,
  //   title: "组件基础",
  //   description: "React组件的基本概念和使用方法",
  //   path: "/components",
  // },

  // // Hooks相关
  // {
  //   id: 5,
  //   title: "useState",
  //   description: "使用Hook管理组件状态",
  //   path: "/usestate",
  // },
  // {
  //   id: 6,
  //   title: "useEffect",
  //   description: "处理副作用和生命周期事件",
  //   path: "/useeffect",
  // },
  // {
  //   id: 10,
  //   title: "自定义Hooks",
  //   description: "封装和复用组件逻辑",
  //   path: "/customhooks",
  // },

  // // 生命周期与事件
  // {
  //   id: 7,
  //   title: "事件处理",
  //   description: "React事件系统的使用方法",
  //   path: "/events",
  // },
  // {
  //   id: 8,
  //   title: "生命周期",
  //   description: "组件生命周期的完整流程",
  //   path: "/lifecycle",
  // },
  // {
  //   id: 9,
  //   title: "渲染控制",
  //   description: "条件渲染和列表渲染的实现",
  //   path: "/rendering",
  // },

  // // 高级特性
  // {
  //   id: 11,
  //   title: "Context使用",
  //   description: "跨层级的状态共享机制",
  //   path: "/context",
  // },
  // {
  //   id: 12,
  //   title: "性能优化",
  //   description: "提升React应用性能的关键技术",
  //   path: "/performance",
  // },
  // {
  //   id: 13,
  //   title: "zustand状态管理",
  //   description: "状态管理解决方案",
  //   path: "/zustand",
  // },
  // // {
  // //   id: 14,
  // //   title: "路由管理",
  // //   description: "页面路由和导航控制",
  // //   path: "/router",
  // // },
  // {
  //   id: 15,
  //   title: "axios接口调用",
  //   description: "接口调用",
  //   path: "/axios",
  // },
  // {
  //   id: 16,
  //   title: "useReducer",
  //   description: "useReducer",
  //   path: "/useReducer",
  // },
  // {
  //   id: 17,
  //   title: "useImmer",
  //   description: "useImmer",
  //   path: "/useImmer",
  // },
  // {
  //   id: 18,
  //   title: "useSyncExternalStore",
  //   description: "useSyncExternalStore",
  //   path: "/useSyncExternalStore",
  // },
  // {
  //   id: 19,
  //   title: "useLayoutEffect",
  //   description: "useLayoutEffect",
  //   path: "/useLayoutEffect",
  // },
  // {
  //   id: 20,
  //   title: "useMemoDemo",
  //   description: "useMemoDemo",
  //   path: "/useMemoDemo",
  // },
  // {
  //   id: 21,
  //   title: "useTranstionDemo",
  //   description: "useTranstionDemo",
  //   path: "/useTranstionDemo",
  // },
  // {
  //   id: 22,
  //   title: "useSuspense",
  //   description: "useSuspense",
  //   path: "/useSuspense",
  // },
  // {
  //   id: 23,
  //   title: "createPortal",
  //   description: "createPortal",
  //   path: "/createPortal",
  // },
  {
    id: 24,
    title: "地图测试",
    description: "mars3d地图测试",
    path: "/mars3dTest",
  },
  // {
  //   id: 25,
  //   title: "百度地图测试",
  //   description: "百度地图测试",
  //   path: "/baiduMap",
  // },
  {
    id: 26,
    title: "leaflet测试",
    description: "leaflet测试",
    path: "/leafletMap",
  },
  {
    id: 27,
    title: "API 测试",
    description: "表格CRUD",
    path: "/apitest",
  },
  {
    id: 28,
    title: "上传",
    description: "上传",
    path: "/upload",
  },
];

/**
 * 首页组件
 * 展示所有学习模块的导航卡片
 */
const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <h1>React 集成测试</h1>
      <div className="module-grid">
        {modules.map((module) => (
          <Link to={module.path} key={module.id} className="module-card">
            <div className="card-content">
              <h2>{module.title}</h2>
              <p>{module.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
