import React, { useEffect } from "react";
import { Menubar } from "primereact/menubar";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import logo from "../public/logo192.png";

export default function Header(props) {
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
        end={
          <Button
            label="清除数据"
            icon="pi pi-power-off"
            onClick={props.clean}
          />
        }
        className="border-noround w-full shadow-2"
      />
    </div>
  );
}
