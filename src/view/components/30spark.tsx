/**
 * Spark 高斯泼溅（3D Gaussian Splatting）测试查看器
 * 技术栈：React + Three.js + @sparkjsdev/spark
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Button, Input, Spin, Alert, Slider } from "antd";
import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

/** 组件 props：可自定义默认模型和快捷切换列表 */
interface GaussianSplatViewerProps {
  /** 首次进入页面时自动加载的模型 URL */
  initialModelUrl?: string;
  /** 顶部按钮栏展示的预设模型列表 */
  modelUrls?: Array<{ name: string; url: string }>;
}

/**
 * 用户交互旋转状态
 * 拖拽 / 自动旋转只作用于外层 Group，不直接改 SplatMesh 的 Spark 朝向修正
 */
type RotationState = {
  /** 是否正在按住鼠标左键拖拽 */
  isDragging: boolean;
  /** 目标绕 X 轴旋转角（弧度），由鼠标上下拖拽累加 */
  targetRotationX: number;
  /** 目标绕 Y 轴旋转角（弧度），由鼠标左右拖拽 / 自动旋转累加 */
  targetRotationY: number;
  /** 当前实际绕 X 轴旋转角，每帧向 targetRotationX 插值 */
  currentRotationX: number;
  /** 当前实际绕 Y 轴旋转角，每帧向 targetRotationY 插值 */
  currentRotationY: number;
};

/** Spark 官方 CDN 资产根路径（GitHub: sparkjsdev/assets） */
const SPARK_ASSETS_BASE = "https://sparkjs.dev/assets/splats";

/** 内置示例模型，可通过 props.modelUrls 覆盖 */
const DEFAULT_MODELS = [
  { name: "蝴蝶", url: `${SPARK_ASSETS_BASE}/butterfly.spz` },
  { name: "猫咪", url: `${SPARK_ASSETS_BASE}/cat.spz` },
  { name: "企鹅", url: `${SPARK_ASSETS_BASE}/penguin.spz` },
  { name: "机器人", url: `${SPARK_ASSETS_BASE}/robot-head.spz` },
  { name: "熔炉", url: `${SPARK_ASSETS_BASE}/forge.spz` },
  { name: "甜品", url: `${SPARK_ASSETS_BASE}/dessert.spz` },
];

/** 网格地面 Y 坐标；模型包围盒底部会对齐到此高度 */
const GROUND_Y = 0;
/** 3D 画布 CSS 高度，可按页面布局调整 */
const VIEWER_HEIGHT = "calc(65vh)";
/** 卡片距页面底部的留白比例 */
const VIEWER_BOTTOM_MARGIN = "15%";

/** SplatMesh 类型未暴露 Three.js 变换属性，此处做断言 */
const asObject3D = (mesh: SplatMesh): THREE.Object3D =>
  mesh as unknown as THREE.Object3D;

/**
 * 模型加载完成后的位置调整 + 相机 framing
 * 1. SplatMesh 上设置 Spark 坐标修正（quaternion 绕 X 轴 180°）
 * 2. X/Z 居中，Y 方向让 bbox.min.y 贴合 GROUND_Y
 * 3. 按包围盒计算相机距离和 lookAt 高度
 */
const frameSplatMesh = (
  splatMesh: SplatMesh,
  camera: THREE.PerspectiveCamera,
): { distance: number; lookAtY: number } => {
  const meshObject = asObject3D(splatMesh);
  // Spark SPZ 坐标修正，修正模型倒置；勿在动画循环里覆盖
  meshObject.quaternion.set(1, 0, 0, 0);
  meshObject.position.set(0, 0, 0);

  try {
    const bbox = splatMesh.getBoundingBox();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bbox.getCenter(center);
    bbox.getSize(size);

    // 水平居中，底部贴合网格平面 GROUND_Y
    meshObject.position.set(
      -center.x,
      GROUND_Y - bbox.min.y,
      -center.z,
    );

    const lookAtY = Math.max(size.y * 0.45, 0.1); // 相机看向模型高度约 45%
    const maxDim = Math.max(size.x, size.y, size.z, 0.1);
    const distance = maxDim * 1.8; // 相机距离 = 最大边长 × 1.8
    camera.position.set(0, lookAtY * 0.2, distance); // 轻微俯视
    camera.lookAt(0, lookAtY, 0);
    return { distance, lookAtY };
  } catch {
    meshObject.position.set(0, GROUND_Y, -3);
    camera.position.set(0, 0.3, 3);
    camera.lookAt(0, 0.3, 0);
    return { distance: 3, lookAtY: 0.3 };
  }
};

const GaussianSplatViewer: React.FC<GaussianSplatViewerProps> = ({
  initialModelUrl = DEFAULT_MODELS[0].url,
  modelUrls = DEFAULT_MODELS,
}) => {
  // ── Three.js / DOM 引用 ──
  /** WebGL 画布挂载容器 */
  const containerRef = useRef<HTMLDivElement>(null);
  /** Three.js 场景 */
  const sceneRef = useRef<THREE.Scene | null>(null);
  /** 透视相机 */
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  /** WebGL 渲染器 */
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  /** Spark 渲染管线，必须加入 scene 否则 splat 不显示 */
  const sparkRendererRef = useRef<SparkRenderer | null>(null);
  /** 当前 SplatMesh（Spark 朝向修正 + 模型数据） */
  const splatMeshRef = useRef<SplatMesh | null>(null);
  /** 外层 Group（用户拖拽 / 自动旋转，与 Mesh 朝向修正分离） */
  const splatGroupRef = useRef<THREE.Group | null>(null);
  /** requestAnimationFrame 句柄 */
  const animationFrameRef = useRef<number | undefined>(undefined);
  /** 鼠标 / 滚轮事件解绑函数 */
  const controlsRef = useRef<{ cleanup: () => void } | null>(null);

  /** 拖拽与自动旋转角度状态（动画循环每帧读写） */
  const rotationStateRef = useRef<RotationState>({
    isDragging: false,
    targetRotationX: 0,
    targetRotationY: 0,
    currentRotationX: 0,
    currentRotationY: 0,
  });
  /** 是否开启自动旋转（镜像 autoRotate state，供动画循环读取） */
  const autoRotateRef = useRef(true);
  /** 自动旋转速度 弧度/帧（镜像 rotationSpeed，Slider 范围 0~0.02） */
  const rotationSpeedRef = useRef(0.005);
  /** 模型 framing 后的相机初始 Z 距离（重置视角 / 滚轮缩放上限） */
  const cameraDistanceRef = useRef(3);
  /** 模型 framing 后的相机 lookAt Y（重置视角） */
  const cameraLookAtYRef = useRef(0.3);

  // ── React UI 状态 ──
  /** 是否正在加载模型 */
  const [loading, setLoading] = useState(false);
  /** 远程下载进度 0~100 */
  const [loadProgress, setLoadProgress] = useState(0);
  /** 加载失败时的错误信息 */
  const [error, setError] = useState<string>("");
  /** 当前已加载模型 URL，用于高亮快捷按钮 */
  const [currentModel, setCurrentModel] = useState(initialModelUrl);
  /** 当前模型 splat 点数量 */
  const [splatCount, setSplatCount] = useState(0);
  /** 自定义 URL 输入框内容 */
  const [customUrl, setCustomUrl] = useState("");
  /** 自动旋转速度，绑定 Slider（0~0.02 弧度/帧） */
  const [rotationSpeed, setRotationSpeed] = useState(0.005);
  /** 是否开启自动旋转，绑定「自动旋转 / 停止旋转」按钮 */
  const [autoRotate, setAutoRotate] = useState(true);
  /** 渲染帧率，每秒更新一次 */
  const [fps, setFps] = useState(0);

  /** FPS 计数器，避免 rAF 中频繁 setState */
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() });

  // 将 UI 状态同步到 ref，供动画循环读取最新值
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  /** 加载 / 切换模型：销毁旧实例 → 创建 SplatMesh → frameSplatMesh 调整位置 */
  const loadModel = useCallback(async (url: string) => {
    if (!sceneRef.current || !cameraRef.current) return;

    setLoading(true);
    setLoadProgress(0);
    setError("");

    try {
      // 清理上一模型
      if (splatGroupRef.current && sceneRef.current) {
        sceneRef.current.remove(splatGroupRef.current);
        splatGroupRef.current = null;
      }
      if (splatMeshRef.current) {
        splatMeshRef.current.dispose();
        splatMeshRef.current = null;
      }

      // 切换模型时重置交互旋转角
      rotationStateRef.current = {
        isDragging: false,
        targetRotationX: 0,
        targetRotationY: 0,
        currentRotationX: 0,
        currentRotationY: 0,
      };

      const splatGroup = new THREE.Group();
      sceneRef.current.add(splatGroup);
      splatGroupRef.current = splatGroup;

      const splatMesh = new SplatMesh({
        url,
        onProgress: (event) => {
          if (event.lengthComputable && event.total > 0) {
            setLoadProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      splatGroup.add(splatMesh);
      splatMeshRef.current = splatMesh;

      // 等待 Spark 解析完成，最长 90 秒
      await Promise.race([
        splatMesh.initialized,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("加载超时（90s）")), 90000)
        ),
      ]);

      // 调整模型位置 / 相机，记录重置视角参数
      const frame = frameSplatMesh(splatMesh, cameraRef.current);
      cameraDistanceRef.current = frame.distance;
      cameraLookAtYRef.current = frame.lookAtY;
      setSplatCount(splatMesh.numSplats);
      setCurrentModel(url);
    } catch (err: unknown) {
      console.error("加载模型失败:", err);
      const message = err instanceof Error ? err.message : "未知错误";
      setError(`加载失败: ${message}`);
      setSplatCount(0);

      if (splatGroupRef.current && sceneRef.current) {
        sceneRef.current.remove(splatGroupRef.current);
        splatGroupRef.current = null;
      }
      if (splatMeshRef.current) {
        splatMeshRef.current.dispose();
        splatMeshRef.current = null;
      }
    } finally {
      setLoading(false);
      setLoadProgress(0);
    }
  }, []);

  /** 初始化 Three.js 场景、交互和渲染循环 */
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // 占位相机位，loadModel 完成后被 frameSplatMesh 覆盖
    camera.position.set(0, 0.06, 3);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    // Spark 建议 antialias: false
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);
    sparkRendererRef.current = spark;

    const gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
    // 地面网格，Y = GROUND_Y
    gridHelper.position.y = GROUND_Y;
    scene.add(gridHelper);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // ── 鼠标拖拽旋转 ──
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      rotationStateRef.current.isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = rotationStateRef.current;
      if (!state.isDragging || !splatGroupRef.current) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      state.targetRotationY += deltaX * 0.01; // 拖拽灵敏度
      state.targetRotationX += deltaY * 0.01;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      rotationStateRef.current.isDragging = false;
    };

    // ── 滚轮缩放（只改相机 Z，不改模型位置） ──
    const handleWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      e.preventDefault();
      const delta = e.deltaY * 0.005;
      const minDistance = 0.3;
      const maxDistance = Math.max(cameraDistanceRef.current * 4, 20);
      const newZ = Math.max(
        minDistance,
        Math.min(cameraRef.current.position.z + delta, maxDistance)
      );
      cameraRef.current.position.z = newZ;
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

    controlsRef.current = {
      cleanup: () => {
        renderer.domElement.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        renderer.domElement.removeEventListener("wheel", handleWheel);
      },
    };

    // ── 渲染循环 ──
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const state = rotationStateRef.current;
      // autoRotate 开启且未拖拽时，每帧累加 Y 轴旋转
      if (autoRotateRef.current && splatGroupRef.current && !state.isDragging) {
        state.targetRotationY += rotationSpeedRef.current;
      }

      // 旋转插值后应用到外层 Group（不覆盖 SplatMesh 的 Spark 朝向修正）
      if (splatGroupRef.current) {
        state.currentRotationX += (state.targetRotationX - state.currentRotationX) * 0.1;
        state.currentRotationY += (state.targetRotationY - state.currentRotationY) * 0.1;
        splatGroupRef.current.rotation.x = state.currentRotationX;
        splatGroupRef.current.rotation.y = state.currentRotationY;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      const now = performance.now();
      const delta = now - fpsRef.current.lastTime;
      if (delta >= 1000) {
        const currentFps = (fpsRef.current.frames * 1000) / delta;
        setFps(Math.round(currentFps));
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }
      fpsRef.current.frames++;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    void loadModel(initialModelUrl);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      controlsRef.current?.cleanup();
      window.removeEventListener("resize", handleResize);
      if (splatGroupRef.current) {
        scene.remove(splatGroupRef.current);
      }
      if (splatMeshRef.current) {
        splatMeshRef.current.dispose();
      }
      if (sparkRendererRef.current) {
        scene.remove(sparkRendererRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initialModelUrl, loadModel]);

  const handleLoadCustomUrl = () => {
    if (customUrl.trim()) {
      void loadModel(customUrl.trim());
      setCustomUrl("");
    }
  };

  /** 重置视角：恢复相机 framing + 清空 Group 交互旋转 */
  const resetView = () => {
    if (cameraRef.current) {
      const lookAtY = cameraLookAtYRef.current;
      cameraRef.current.position.set(0, lookAtY * 0.2, cameraDistanceRef.current);
      cameraRef.current.lookAt(0, lookAtY, 0);
    }

    rotationStateRef.current.targetRotationX = 0;
    rotationStateRef.current.targetRotationY = 0;
    rotationStateRef.current.currentRotationX = 0;
    rotationStateRef.current.currentRotationY = 0;

    if (splatGroupRef.current) {
      splatGroupRef.current.rotation.x = 0;
      splatGroupRef.current.rotation.y = 0;
    }
  };

  return (
    <Card
      title="3D 高斯泼溅查看器"
      style={{ maxWidth: "80%", margin: "20px auto", marginBottom: VIEWER_BOTTOM_MARGIN }}
      extra={
        <span style={{ fontSize: 12, color: "#666" }}>
          FPS: {fps}
          {splatCount > 0 ? ` | Splats: ${splatCount.toLocaleString()}` : ""}
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 预设模型快捷切换 + 自定义 URL 输入 */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {modelUrls.map((model) => (
              <Button
                key={model.url}
                type={currentModel === model.url ? "primary" : "default"}
                onClick={() => void loadModel(model.url)}
                disabled={loading}
              >
                {model.name}
              </Button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", flex: 1 }}>
            <Input
              placeholder="输入 .spz 或 .ply 文件URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onPressEnter={handleLoadCustomUrl}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button onClick={handleLoadCustomUrl} disabled={loading || !customUrl.trim()}>
              加载
            </Button>
          </div>
        </div>

        {/* 重置视角 / 自动旋转（autoRotate）/ 旋转速度（rotationSpeed） */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <Button onClick={resetView} size="small">
            重置视角
          </Button>

          <Button
            size="small"
            type={autoRotate ? "primary" : "default"}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? "停止旋转" : "自动旋转"}
          </Button>

          {autoRotate && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: 12 }}>旋转速度:</span>
              <Slider
                min={0}
                max={0.02}
                step={0.001}
                value={rotationSpeed}
                onChange={setRotationSpeed}
                style={{ width: 150 }}
              />
            </div>
          )}

          <div style={{ fontSize: 12, color: "#888" }}>
            💡 提示: 鼠标拖拽旋转视角 | 滚轮缩放
          </div>
        </div>

        {/* WebGL 画布，高度由 VIEWER_HEIGHT 控制 */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: VIEWER_HEIGHT,
            minHeight: "320px",
            backgroundColor: "#050510",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            border: "1px solid #ddd",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              <Spin
                size="large"
                tip={loadProgress > 0 ? `加载模型中... ${loadProgress}%` : "加载模型中..."}
              />
            </div>
          )}
          {error && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                zIndex: 10,
              }}
            >
              <Alert title="错误" description={error} type="error" showIcon />
            </div>
          )}
        </div>

        {/* <div
          style={{
            fontSize: 12,
            color: "#666",
            padding: "8px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <strong>支持的模型格式:</strong> .spz (推荐), .ply, .splat, .ksplat <br />
          <strong>示例模型来源:</strong>{" "}
          <a href="https://github.com/sparkjsdev/assets/tree/main/splats" target="_blank" rel="noopener noreferrer">
            Spark 官方资产库
          </a>
          （蝴蝶、猫咪、企鹅、机器人、熔炉、甜品等）
          <br />
          <strong>注意:</strong> 旧示例中的 truck / garden 已下线；首次加载需下载数 MB 模型文件，请耐心等待。
        </div> */}
      </div>
    </Card>
  );
};

export default GaussianSplatViewer;
