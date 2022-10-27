import _, { uniqueId } from "lodash";
import moment from "moment/moment";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Fieldset } from "primereact/fieldset";
import { RadioButton } from "primereact/radiobutton";
import { TabPanel, TabView } from "primereact/tabview";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { appFetch } from "../utils";
import BigLineChart from "./BigLineChart";

import { Sidebar } from "primereact/sidebar";
import { InputNumber } from "primereact/inputnumber";
import { IMU_GLOBALS } from "../appRoute";

export default function AnalysesMain() {
  const [positionList, setPositionList] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");

  const [timeDesc, setTimeDesc] = useState("-1h");

  const [displayBasic, setDisplayBasic] = useState(false);

  const [algorithm, setAlgorithm] = useState("simple_zero");

  const [leftLabels, setLeftLabels] = useState([]);
  const [leftDataSet, setLeftDataSet] = useState([]);

  const [rightLabels, setRightLabels] = useState([]);
  const [rightDataSet, setRightDataSet] = useState([]);

  const [visibleRight, setVisibleRight] = useState(false);

  const [settingId, setSettingId] = useState("");

  const [algorithmParams, setAlgorithmParams] = useState({
    simple_zero: { zeroFlag: 0.12, zeroAccount: 3 },
    tow_way: { zeroFlag: 0.11, zeroAccount: 2, pt: 1.5, nt: 1.5 },
  });

  const getPositionList = async () => {
    let rs = await appFetch("/imu/position/list", { method: "GET" });
    if (rs.status == 200) {
      let d_ = await rs.json();
      setPositionList(
        _.map(d_, (item) => {
          return {
            label: item.code,
            value: item.id,
          };
        })
      );
    }
  };

  const getPositionSetting = async (value) => {
    let rs = await appFetch(`/imu/position/setting/${value}`, {
      method: "GET",
    });
    if (rs.status == 200) {
      let setting = await rs.json();
      if (!_.isEmpty(setting)) {
        setAlgorithmParams(JSON.parse(setting.settings));
        setSettingId(setting.id);
      } else {
        setAlgorithmParams({
          simple_zero: { zeroFlag: 0.12, zeroAccount: 3 },
          tow_way: { zeroFlag: 0.11, zeroAccount: 2, pt: 1.5, nt: 1.5 },
        });
      }
    }
  };

  const savePositionSetting = async () => {
    let rs = await appFetch("/imu/position/setting", {
      method: "PUT",
      body: JSON.stringify({
        id: settingId,
        positionId: currentPosition,
        settings: JSON.stringify(algorithmParams),
      }),
    });
    if (rs == 200) {
      IMU_GLOBALS.toast.current.show({
        severity: "info",
        summary: "信息",
        detail: "参数保存成功。",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    getPositionList();
  }, []);

  const calculateOriginLeft = (dataSet) => {
    let leftLabels = [];
    let left_datasets_data = [];
    _.each(dataSet, (data) => {
      leftLabels.push(moment(data.datetime).format("YYYY-MM-DD HH:mm:ss"));
      left_datasets_data.push(data.value);
    });
    setLeftLabels(leftLabels);
    setLeftDataSet(left_datasets_data);
  };

  const calculateOriginRight = (dataSet) => {
    let labels = [];
    let datasets_data = [];
    _.each(dataSet, (data) => {
      labels.push(moment(data.datetime).format("YYYY-MM-DD HH:mm:ss"));
      datasets_data.push(data.value);
    });
    setRightLabels(labels);
    setRightDataSet(datasets_data);
  };

  const getAlgorithmName = () => {
    switch (algorithm) {
      case "simple_zero":
        return "简单归零";
      case "tow_way":
        return "双向启停";
      case "movement":
        return "运动方向";
    }
  };

  return (
    <Card className="m-2" title="数据分析管理">
      <Toolbar
        className="mb-4"
        left={
          <div>
            <span>工位：</span>
            <Dropdown
              name="position"
              value={currentPosition}
              options={positionList}
              onChange={(e) => {
                setCurrentPosition(e.value);
                getPositionSetting(e.value);
              }}
              placeholder="请选择工位"
            />
            &nbsp;&nbsp;&nbsp;
            <span>时间范围：</span>
            <Dropdown
              name="position"
              value={timeDesc}
              options={[
                { label: "过去1小时", value: "-1h" },
                { label: "过去2小时", value: "-2h" },
                { label: "过去3小时", value: "-3h" },
                { label: "过去4小时", value: "-4h" },
                { label: "过去5小时", value: "-5h" },
                { label: "过去8小时", value: "-8h" },
                { label: "过去1天", value: "-1d" },
                { label: "过去2天", value: "-2d" },
                { label: "过去3天", value: "-3d" },
                { label: "过去4天", value: "-4d" },
                { label: "过去5天", value: "-5d" },
              ]}
              onChange={(e) => {
                setTimeDesc(e.value);
              }}
            />
            &nbsp;&nbsp;&nbsp;
            <Button
              icon="pi pi-check"
              className="p-button-rounded"
              onClick={async () => {
                let rs = await appFetch(
                  `/imu/analyses/query/${currentPosition}?timeDesc=${timeDesc}`,
                  { method: "GET" }
                );
                if (rs.status == 200) {
                  let dataSet = await rs.json();

                  calculateOriginLeft(dataSet["LEFT"]);
                  calculateOriginRight(dataSet["RIGHT"]);
                }
              }}
            />
          </div>
        }
      ></Toolbar>
      <TabView>
        <TabPanel header="原始数据">
          <p>直接展示传感器获取的原始数据</p>
          <Fieldset legend="左手" toggleable className="mb-2">
            <BigLineChart date={leftLabels} data={leftDataSet} />
          </Fieldset>
          <Fieldset legend="右手" toggleable>
            <BigLineChart date={rightLabels} data={rightDataSet} />
          </Fieldset>
        </TabPanel>
        <TabPanel header="工作周期分析">
          <p>根据不同的算法，进行工作周期分析。</p>
          <Toolbar
            left={
              <div>
                <RadioButton
                  name="algorithm"
                  value="simple_zero"
                  onChange={(e) => setAlgorithm(e.value)}
                  checked={algorithm === "simple_zero"}
                />
                &nbsp;
                <span>简单归零</span>
                &nbsp;&nbsp;&nbsp;
                <RadioButton
                  name="algorithm"
                  value="tow_way"
                  onChange={(e) => setAlgorithm(e.value)}
                  checked={algorithm === "tow_way"}
                />
                &nbsp;&nbsp;
                <span>双向启停</span>
              </div>
            }
            right={
              <div>
                <Button
                  label="参数"
                  className="p-button-sm p-button-rounded p-button-warning"
                  disabled={currentPosition == ""}
                  onClick={() => {
                    setVisibleRight(true);
                  }}
                />
                &nbsp;&nbsp;
                <Button
                  label="分析"
                  className="p-button-sm p-button-rounded  p-button-success"
                  disabled={leftLabels.length == 0 && rightLabels.length == 0}
                  onClick={() => {
                    switch (algorithm) {
                      case "simple_zero":
                        console.log(
                          "simple_zero",
                          "zeroFlag:",
                          algorithmParams.simple_zero.zeroFlag,
                          "zeroAccount:",
                          algorithmParams.simple_zero.zeroAccount
                        );
                        break;
                      case "tow_way":
                        break;
                      case "movement":
                        return "运动方向";
                    }
                  }}
                />
              </div>
            }
          ></Toolbar>
        </TabPanel>
      </TabView>
      <Sidebar
        visible={visibleRight}
        position="right"
        onHide={() => setVisibleRight(false)}
      >
        <h3>配置算法参数</h3>
        <h5>{getAlgorithmName()}</h5>
        <div className="card ">
          <div className="field ">
            <label>归零区间：</label>
            <InputNumber
              mode="decimal"
              minFractionDigits={2}
              value={algorithmParams[algorithm].zeroFlag}
              onChange={(e) => {
                algorithmParams[algorithm].zeroFlag = e.value;
              }}
            />
          </div>
          <div className="field ">
            <label>归零计数：</label>
            <InputNumber
              value={algorithmParams[algorithm].zeroAccount}
              onChange={(e) => {
                algorithmParams[algorithm].zeroAccount = e.value;
              }}
            />
          </div>
          {algorithm == "tow_way" && (
            <div>
              <div className="field">
                <label>正向阈值：</label>
                <InputNumber
                  mode="decimal"
                  minFractionDigits={2}
                  value={algorithmParams[algorithm].pt}
                  onChange={(e) => {
                    algorithmParams[algorithm].pt = e.value;
                  }}
                />
              </div>
              <div className="field">
                <label>负向阈值：</label>
                <InputNumber
                  mode="decimal"
                  minFractionDigits={2}
                  value={algorithmParams[algorithm].nt}
                  onChange={(e) => {
                    algorithmParams[algorithm].nt = e.value;
                  }}
                />
              </div>
            </div>
          )}
          <div className="mt-5" style={{ paddingLeft: "115px" }}>
            <Button
              label="保存"
              onClick={() => {
                savePositionSetting();
                setVisibleRight(false);
              }}
            />
          </div>
        </div>
      </Sidebar>
    </Card>
  );
}
