import React, { useEffect } from "react";
import { Button, message } from "antd";
import * as mars3d from "mars3d";

// 静态多边形数据 - 只包含经纬度
const polygonData = [
  {
    positions: [
      [105.534492, 28.889597],
      [105.53339, 28.888496],
      [105.534797, 28.887414],
      [105.535632, 28.888737],
    ],
  },
  {
    positions: [
      [105.533904, 28.89218],
      [105.533431, 28.891691],
      [105.53396, 28.891317],
      [105.534375, 28.891814],
    ],
  },
  {
    positions: [
      [105.532391, 28.891142],
      [105.531978, 28.890706],
      [105.53287, 28.889929],
      [105.533316, 28.890404],
    ],
  },
  {
    positions: [
      [105.534442, 28.89094],
      [105.533987, 28.890469],
      [105.535198, 28.889545],
      [105.535623, 28.890011],
    ],
  },
];

const Mars3dTest: React.FC = () => {
  let mapx: mars3d.Map = null;
  let graphicLayer: mars3d.layer.GraphicLayer = null;
  // const [map3d, setmap3d] = useState<boolean>(true);
 const mLoading = message.loading('地图加载中...', 0);
  const initMap = async () => {
    // const Cesium = mars3d.Cesium;
    mapx = new mars3d.Map("mars3dContainer", {
      scene: {
        center: {
          lat: 28.889983,
          lng: 105.534818,
          alt: 2040,
          heading: 0,
          pitch: -40,
        },
        showSun: true,
        showMoon: false,
        showSkyBox: false,
        showSkyAtmosphere: false, // 关闭球周边的白色轮廓 map.scene.skyAtmosphere = false
        fog: false, //雾化关了
        fxaa: true, //是否开启快速抗锯齿
        sceneMode: mars3d.Cesium.SceneMode.SCENE3D,
        // mapMode2D:mars3d.Cesium.MapMode2D.INFINITE_SCROLL,
        globe: {
          show: false,
          showGroundAtmosphere: false, // 关闭大气（球表面白蒙蒙的效果）
          depthTestAgainstTerrain: false,
          baseColor: "#546a53",
        },
        cameraController: {
          zoomFactor: 3.0,
          minimumZoomDistance: 50,
          maximumZoomDistance: 13000000,
          enableRotate: true,
          enableZoom: true,
        },
      },
      control: {
        baseLayerPicker: false, // basemaps底图切换按钮
        homeButton: false, // 视角复位按钮
        sceneModePicker: false, // 二三维切换按钮
        navigationHelpButton: false, // 帮助按钮
        fullscreenButton: false, // 全屏按钮
        contextmenu: { hasDefault: true }, // 右键菜单
      },
      // terrain: {
      //   url: "//data.mars3d.cn/terrain",
      //   show: true,
      // },
      basemaps: [
        {
          name: "Ion影像地图",
          icon: "//data.mars3d.cn/img/thumbnail/basemap/bingAerial.png",
          type: "xyz",
          assetId: 2,
          ionToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYTliZTdhYS1lNmVkLTQ2NjgtOWU5NC04MmFiZTMwMDBmNDgiLCJpZCI6MTc0ODA0LCJpYXQiOjE3MDQyNTM1MTR9.dqbswUiM_mP0Ev1plldJQm3YXw6NWFE5lrF0ZTXG2tQ",
          show: true,
        },
      ],
    });
    mapx.on(mars3d.EventType.load, function (event) {
      mLoading()
      message.success("地图加载完成");
    });
    addModelLayer();
    addGraphicLayer();
    addAnimationWall();
  };
  function addGraphicLayer() {
    graphicLayer = new mars3d.layer.GraphicLayer({ id: "graphicLayer1" });
    mapx.addLayer(graphicLayer);
  }

  function addModelLayer() {
    const url = "model/tileset.json"; //http://221.237.199.79:8081/hse/models/new3d/model/tileset.json
    const tileset = new mars3d.layer.TilesetLayer({
      id: "3D Tiles",
      name: "3D Tiles",
      url: url,
      maximumScreenSpaceError: 1,
      maximumMemoryUsage: 1024,
      skipLevelOfDetail: true,
      cullRequestsWhileMoving: true,
      cullRequestsWhileMovingMultiplier: 10,
    });
    mapx.addLayer(tileset);
    tileset.flyTo();
  }

  function addAnimationWall() {
    // 定义四种颜色：红、黄、蓝、绿
    const colors = ["#ff0000", "#ffff00", "#0000ff", "#00ff00"];

    // 定义四种层级和描述信息
    const popupInfo = [
      {
        level: "一级高危区域",
        levelName: "高危区域",
        description:
          "该区域存在高风险隐患，需要立即采取安全措施。建议加强监控，设置警示标识，限制人员进入。",
        riskFactor: "极高",
        area: "约 0.15 平方公里",
        monitoring: "24小时实时监控",
        warning: "严禁非授权人员进入",
      },
      {
        level: "二级中危区域",
        levelName: "中危区域",
        description:
          "该区域存在中等风险，需要定期检查和维护。建议设置安全防护措施，加强日常巡查。",
        riskFactor: "中等",
        area: "约 0.12 平方公里",
        monitoring: "每日定时巡查",
        warning: "需佩戴安全防护设备",
      },
      {
        level: "三级低危区域",
        levelName: "低危区域",
        description:
          "该区域风险较低，但仍需保持警惕。建议定期检查，确保安全设施正常运行。",
        riskFactor: "较低",
        area: "约 0.18 平方公里",
        monitoring: "每周定期检查",
        warning: "注意安全，遵守规定",
      },
      {
        level: "四级安全区域",
        levelName: "安全区域",
        description:
          "该区域相对安全，风险可控。保持正常作业流程，定期进行安全评估即可。",
        riskFactor: "低",
        area: "约 0.14 平方公里",
        monitoring: "每月例行检查",
        warning: "保持安全作业标准",
      },
    ];

    // 遍历静态多边形数据，为每个多边形创建墙
    polygonData.forEach((item, index) => {
      // 将经纬度转换为 [lng, lat, height] 格式
      const positions = item.positions.map((pos) => [pos[0], pos[1], 0]);

      // 根据索引获取对应的颜色和弹窗信息
      const color = colors[index % colors.length];
      const info = popupInfo[index % popupInfo.length];

      // 计算中心点用于 popup 定位
      const centerLng =
        positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length;
      const centerLat =
        positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length;

      const graphic = new mars3d.graphic.WallPrimitive({
        positions: positions,
        style: {
          closure: true,
          diffHeight: 70,
          materialType: mars3d.MaterialType.LineFlow,
          materialOptions: {
            // 动画线材质
            image: "https://data.mars3d.cn/img/textures/fence.png",
            axisY: true,
            color: color,
            speed: 10, // 速度，建议取值范围1-100
          },
        },
        attr: {
          remark: "多边形数据",
          level: info.level,
          levelName: info.levelName,
          description: info.description,
          riskFactor: info.riskFactor,
          area: info.area,
          monitoring: info.monitoring,
          warning: info.warning,
          centerLng: centerLng,
          centerLat: centerLat,
        },
      });

      // 创建 popup HTML 内容 - 优化文字样式，提高可读性
      const popupHtml = `
        <div style="padding: 15px; min-width: 280px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);color: #ffffff;">
          <h3 style="margin: 0 0 12px 0; color: ${color}; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
            ${info.level}
          </h3>
          <div style="margin-bottom: 10px; font-size: 14px;  line-height: 1.6;">
            <strong style=" font-size: 15px;">区域类型：</strong>
            <span >${info.levelName}</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 14px;  line-height: 1.6;">
            <strong style=" font-size: 15px;">风险等级：</strong>
            <span style="color: ${color}; font-weight: bold; font-size: 15px;">${info.riskFactor}</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 14px;  line-height: 1.6;">
            <strong style=" font-size: 15px;">区域面积：</strong>
            <span >${info.area}</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 14px;  line-height: 1.6;">
            <strong style=" font-size: 15px;">监控方式：</strong>
            <span >${info.monitoring}</span>
          </div>
          <div style="margin-bottom: 12px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #007bff;">
            <strong style="color:#000; font-size: 15px; display: block; margin-bottom: 6px;">区域描述：</strong>
            <div style="color: #444444; font-size: 14px; line-height: 1.7;">${info.description}</div>
          </div>
          <div style="padding: 10px; background-color: #fff9e6; border-left: 4px solid ${color}; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <strong style="color:#000; font-size: 15px; display: block; margin-bottom: 6px;">⚠️ 安全提示：</strong>
            <div style="color: #d9534f; font-size: 14px; font-weight: 600; line-height: 1.7;">${info.warning}</div>
          </div>
        </div>
      `;

      // 绑定 popup
      graphic.bindPopup(popupHtml);
      // 自动打开 popup（使用中心点坐标）
      setTimeout(() => {
        graphic.openPopup();
      }, 2000);

      // 添加到图层
      graphicLayer.addGraphic(graphic);
    });
  }

  // 显示隐藏模型
  function toggleModelLayer() {
    const tileset = mapx.getLayerById("3D Tiles");
    if (tileset) {
      tileset.show = !tileset.show;
    }
  }

  //显示隐藏地球
  function toggleEarth() {
    mapx.scene.globe.show = !mapx.scene.globe.show;
  }

  function toggleGraphicLayer() {
    graphicLayer.show = !graphicLayer.show;
  }

  // 按钮配置 - 您可以在这里添加或修改按钮
  // message: 点击按钮后显示的提示内容
  const buttonConfig = [
    {
      id: "toggleLayer",
      name: "显示隐藏模型",
      onClick: toggleModelLayer,
      message: "隐藏模型可以增加地球渲染效果",
    },
    {
      id: "btn1",
      name: "显示隐藏地球",
      onClick: toggleEarth,
      message: "隐藏地球可以增加模型渲染效果",
    },
    {
      id: "btn2",
      name: "显示隐藏矢量图层",
      onClick: toggleGraphicLayer,
      message: "这只是示例图层",
    },
    // {
    //   id: "btn3",
    //   name: "按钮3",
    //   onClick: () => console.log("按钮3被点击"),
    //   message: "按钮3被点击了",
    // },
    // {
    //   id: "btn4",
    //   name: "按钮4",
    //   onClick: () => console.log("按钮4被点击"),
    //   message: "按钮4被点击了",
    // },
  ];

  useEffect(() => {
    initMap();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* 右侧按钮组 */}
      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* 按钮列表 */}
        {buttonConfig.map((btn) => (
          <Button
            key={btn.id}
            color="cyan"
            variant="solid"
            onClick={() => {
              btn.onClick();
              if (btn.message) {
                message.info(btn.message);
              }
            }}
          >
            {btn.name}
          </Button>
        ))}
      </div>
      <div
        id="mars3dContainer"
        style={{ width: "100vw", height: "100vh" }}
      ></div>
    </div>
  );
};

export default Mars3dTest;
