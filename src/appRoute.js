import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { Route, Routes } from "react-router-dom";
import AnalysesMain from "./analyse/AnalysesMain";
import DevMain from "./dev/DevMain";
import Header from "./Header";
import Home from "./Home";
import PositionMain from "./position/PositionMain";

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
        <Route path="/position" element={<PositionMain />} />
        <Route path="/analyses" element={<AnalysesMain />} />
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