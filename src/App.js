import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { Route, Routes } from "react-router-dom";
import DevMain from "./dev/DevMain";
import Header from "./Header";
import Home from "./Home";
export const IIE_GLOBALS = {};
IIE_GLOBALS.deviceReaderWS = undefined;
IIE_GLOBALS.noticeWs = undefined;

export default function App() {
  const toast = useRef(null);
  IIE_GLOBALS.toast = toast;

  return (
    <div>
      <Toast ref={toast} />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dev" element={<DevMain />} />
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
