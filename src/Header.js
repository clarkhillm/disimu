import { Menubar } from "primereact/menubar";
import { Tag } from "primereact/tag";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../public/logo192.png";

export default function Header() {
  let navigate = useNavigate();
  const items = [
    {
      label: "首页",
      icon: "pi pi-fw pi-home",
      command: (event) => {
        navigate("/");
      },
    },
    {
      label: "设备管理",
      icon: "pi pi-fw pi-cog",
      command: (event) => {
        navigate("/dev");
      },
    },
    {
      label: "工位管理",
      icon: "pi pi-users",
      command: (event) => {
        navigate("/position");
      },
    },
    {
      label: "数据分析",
      icon: "pi pi-chart-bar",
      command: (event) => {
        navigate("/analyses");
      },
    },
    {
      label: "工位实时数据",
      icon: "pi pi-bolt",
      command: (event) => {
        navigate("/realtime");
      },
    },
  ];

  const start = (
    <div>
      <Tag style={{ background: "transparent" }}>
        <img src={logo} height={20}></img>
      </Tag>
      <Tag
        style={{
          background: "transparent",
          color: "black",
          fontSize: 18,
          fontWeight: 800,
          marginRight: "30px",
        }}
      >
        手腕位置感应系统 <var>1.0</var>
      </Tag>
    </div>
  );

  return (
    <div>
      <Menubar
        model={items}
        start={start}
        className="border-noround w-full shadow-2"
      />
    </div>
  );
}
