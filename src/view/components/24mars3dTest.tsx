import React, { useEffect } from "react";
import { Button } from "antd";
import * as mars3d from "mars3d";

const Mars3dTest: React.FC = () => {
  let mapx: mars3d.Map = null;
  // const [map3d, setmap3d] = useState<boolean>(true);
  const initMap = async () => {
    // const Cesium = mars3d.Cesium;
    mapx = new mars3d.Map("mars3dContainer", {
      scene: {
        center: {
          lat: 28.889983,
          lng: 105.534818,
          alt: 30414,
          heading: 0,
          pitch: -90,
        },
        showSun: true,
        showMoon: true,
        showSkyBox: true,
        showSkyAtmosphere: false, // 关闭球周边的白色轮廓 map.scene.skyAtmosphere = false
        fog: false, //雾化关了
        fxaa: true, //是否开启快速抗锯齿
        sceneMode: mars3d.Cesium.SceneMode.SCENE3D,
        // mapMode2D:mars3d.Cesium.MapMode2D.INFINITE_SCROLL,
        globe: {
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
      // console.log(2222, mapx);
      addLayer();
    });
  };

  function addLayer() {
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

  function toggleLayer() {
    const tileset = mapx.getLayerById("3D Tiles");
    tileset.show = !tileset.show;
  }

  useEffect(() => {
    initMap();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <Button
        color="cyan"
        variant="solid"
        onClick={toggleLayer}
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          zIndex: 999,
        }}
      >
        显示隐藏模型
      </Button>
      <div
        id="mars3dContainer"
        style={{ width: "100vw", height: "100vh" }}
      ></div>
    </div>
  );
};

export default Mars3dTest;
