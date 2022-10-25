import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { Route, Routes } from "react-router-dom";
import DevMain from "./dev/DevMain";
import DevPair from "./dev/DevPair";
import Header from "./Header";
import Home from "./Home";

export const IMU_GLOBALS = {};

export default function App() {
  const toast = useRef(null);
  IMU_GLOBALS.toast = toast;

  return (
    <div>
      <Toast ref={toast} />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dev" element={<DevMain />} />
        <Route path="/dev_pair" element={<DevPair />} />
        <Route
          path="*"
          element={
            <div>
              <Header />
              <p className="ml-2">抱歉，该页面不存在。</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
