import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Menubar } from "primereact/menubar";
import { Tag } from "primereact/tag";
import React, { useEffect, useState, useRef } from "react";
import logo from "../public/logo192.png";
import { Toast } from "primereact/toast";

export default function Header(props) {
  const [showParamDialog, setShowParamDialog] = useState(false);
  const [showAccount, setShowAccount] = useState(50);
  const [zeroAccount, setZeroAccount] = useState(3);
  const [thresholdX, setThresholdX] = useState(0.12);

  const getParam = async () => {
    let response = await fetch("/imu/params", {
      method: "GET",
    });
    let params = await response.json();
    setZeroAccount(params.zeroAccount);
    props.setZeroAccount(params.zeroAccount);
    setThresholdX(params.thresholdX);
  };

  useEffect(() => {
    getParam();
  }, []);

  const toast = useRef(null);

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
      <Toast ref={toast} />
      <Menubar
        model={items}
        start={start}
        end={
          <Button
            label="参数配置"
            icon="pi pi-chart-bar"
            onClick={() => {
              setShowParamDialog(true);
            }}
          />
        }
        className="border-noround w-full shadow-2"
      />
      <Dialog
        header="参数配置"
        visible={showParamDialog}
        position="top"
        onHide={() => {
          setShowParamDialog(false);
        }}
        footer={
          <div>
            <Button
              label="取消"
              icon="pi pi-times"
              onClick={() => {
                setShowParamDialog(false);
              }}
              className="p-button-text"
            />
            <Button
              label="确定"
              icon="pi pi-check"
              onClick={async () => {
                props.setDataAccount(showAccount);

                let rs = await fetch("/imu/params", {
                  method: "PUT",
                  body: JSON.stringify({
                    thresholdX: thresholdX,
                    zeroAccount: zeroAccount,
                  }),
                });

                if (rs.status == 202) {
                  toast.current.show({
                    severity: "success",
                    summary: "成功",
                    detail: "参数配置成功",
                    life: 3000,
                  });
                }

                setShowParamDialog(false);
              }}
              autoFocus
            />
          </div>
        }
      >
        <div className="card">
          <div className="p-inputgroup field">
            <span className="p-inputgroup-addon">保留数据</span>
            <InputNumber
              min={10}
              max={200}
              value={showAccount}
              onValueChange={(e) => {
                setShowAccount(e.value);
              }}
            />
          </div>
          <div className="p-inputgroup field">
            <span className="p-inputgroup-addon">归零区间</span>
            <InputNumber
              min={0.01}
              max={5}
              value={thresholdX}
              onValueChange={(e) => {
                setThresholdX(e.value);
              }}
            />
          </div>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">周期指示</span>
            <InputNumber
              min={1}
              max={10}
              value={zeroAccount}
              onValueChange={(e) => {
                setZeroAccount(e.value);
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
