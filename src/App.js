import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./Header";
import MainFace from "./MainFace";
export const IIE_GLOBALS = {};
IIE_GLOBALS.deviceReaderWS = undefined;
IIE_GLOBALS.noticeWs = undefined;

export default function App() {
  const toast = useRef(null);
  IIE_GLOBALS.toast = toast;

  return (
    <div>
      <Toast ref={toast} />
      <Routes>
        <Route path="/" element={<MainFace />} />
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
