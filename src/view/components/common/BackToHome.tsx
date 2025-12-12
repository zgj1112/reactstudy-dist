import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./BackToHome.css";

const BackToHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      className="back-button"
      style={{ zIndex: 100 }}
      type="primary"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate("/")}
    >
      返回首页
    </Button>
  );
};

export default BackToHome;
