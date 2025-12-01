import React, { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Particles from "react-tsparticles";
import type { Engine, ISourceOptions } from "tsparticles-engine";
import { Button, Segmented, Space, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { loadSlim } from "tsparticles-slim";

type ThemeKey = "nebula" | "lines" | "bubbles";

const themeOptions: Record<ThemeKey, ISourceOptions> = {
  nebula: {
    background: {
      color: "#050816",
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 120,
          duration: 0.5,
        },
      },
    },
    particles: {
      color: {
        value: ["#4b9fff", "#9f7bff", "#ff6bcb"],
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: true,
        outModes: {
          default: "out",
        },
      },
      number: {
        density: {
          enable: true,
          area: 900,
        },
        value: 120,
      },
      opacity: {
        value: 0.6,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 4 },
      },
      links: {
        enable: true,
        distance: 130,
        color: "#7b8cff",
        opacity: 0.4,
        width: 1,
      },
    },
  },
  lines: {
    background: {
      color: "#020617",
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 160,
          links: {
            opacity: 0.7,
          },
        },
      },
    },
    particles: {
      color: { value: "#38bdf8" },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        outModes: {
          default: "out",
        },
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
      links: {
        enable: true,
        distance: 180,
        color: "#38bdf8",
        opacity: 0.5,
        width: 1.2,
      },
    },
  },
  bubbles: {
    background: {
      color: "#0f172a",
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "bubble",
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 140,
          duration: 2,
          size: 10,
          opacity: 0.8,
        },
      },
    },
    particles: {
      color: { value: "#22c55e" },
      move: {
        enable: true,
        speed: 0.7,
        direction: "top",
        outModes: {
          default: "out",
        },
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 90,
      },
      opacity: {
        value: 0.4,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 2, max: 6 },
      },
    },
  },
};

const themeLabelMap: Record<ThemeKey, string> = {
  nebula: "星云粒子",
  lines: "科技线条",
  bubbles: "气泡流动",
};

const BackgroundSwitcher: React.FC = () => {
  const location = useLocation();
  // 判断是否为首页：路径为 "/" 或 "/react-study" 或 "/react-study/"
  const isHomePage = location.pathname === "/" || 
                     location.pathname === "/react-study" || 
                     location.pathname === "/react-study/";
  const [theme, setTheme] = useState<ThemeKey>("lines");
  const [key, setKey] = useState(0);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo<ISourceOptions>(() => {
    return {
      fullScreen: {
        enable: true,
        zIndex: 0,
      },
      ...themeOptions[theme],
    };
  }, [theme]);

  const handleReload = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  const segmentedOptions = useMemo(
    () =>
      (Object.keys(themeLabelMap) as ThemeKey[]).map((value) => ({
        label: themeLabelMap[value],
        value,
      })),
    []
  );

  return (
    <>
      <Particles
        id={`tsparticles-${key}`}
        init={particlesInit}
        options={options}
        style={{ position: "fixed", inset: 0 }}
      />

      {isHomePage && (
        <div
          style={{
            position: "fixed",
            right: 24,
            top: 24,
            zIndex: 10,
          }}
        >
          <Space>
            <Segmented<ThemeKey>
              style={{ marginRight: 8 }}
              options={segmentedOptions}
              value={theme}
              onChange={(value) => setTheme(value as ThemeKey)}
            />
            <Tooltip title="刷新当前背景">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReload}
              />
            </Tooltip>
          </Space>
        </div>
      )}
    </>
  );
};

export default BackgroundSwitcher;
