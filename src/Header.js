import React, { useEffect } from "react";
import { Menubar } from "primereact/menubar";
import { Tag } from "primereact/tag";
import logo from "../public/logo192.png";

export default function Header() {
  useEffect(() => {}, []);
  const start = (
    <div>
      <Tag style={{ background: "#eff3f8" }}>
        <img src={logo} height={30}></img>
      </Tag>
      <Tag
        style={{
          background: "#eff3f8",
          color: "black",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        IMU 测试 <var>1.0</var>
      </Tag>
    </div>
  );

  const items = [];
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
