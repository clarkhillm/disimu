import _ from "lodash";
import moment from "moment/moment";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { TabPanel, TabView } from "primereact/tabview";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { appFetch } from "../utils";
import BigLineChart from "./BigLineChart";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import { Sidebar } from "primereact/sidebar";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { IMU_GLOBALS } from "../appRoute";
import SimpleZero from "./algorithm/SimpleZero";
import MoveAccount from "./algorithm/MoveAccount";
import { Chart } from "primereact/chart";

export default function AnalysesMain() {
  const [positionList, setPositionList] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");

  const [timeDesc, setTimeDesc] = useState("-1h");

  const [algorithm, setAlgorithm] = useState("simple_zero");

  const [visibleRight, setVisibleRight] = useState(false);

  const [settingId, setSettingId] = useState("");

  const [algorithmParams, setAlgorithmParams] = useState({
    simple_zero: { zeroFlag: 1.2, zeroAccount: 3, pt: 0.14, nt: 0.15 },
  });

  const [dataSet, setDataSet] = useState([]);

  const [cycleSet, setCycleSet] = useState([]);

  const [selectedCycle, setSelectedCycle] = useState(null);
  const [visibleFullScreen, setVisibleFullScreen] = useState(false);

  let basicOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
    },
  };

  const [basicData, setBasicData] = useState({
    labels: ["左手", "右手"],
    datasets: [
      {
        label: "运动",
        backgroundColor: "#00FF00",
        data: [],
      },
      {
        label: "停止",
        backgroundColor: "#FF0000",
        data: [],
      },
    ],
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
          simple_zero: { zeroFlag: 0.12, zeroAccount: 3, pt: 1.5, nt: 1.5 },
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

  const calculateOrigin = (dataSet) => {
    let labelSet = [];
    let _dataSet = [];
    _.each(dataSet, (data) => {
      labelSet.push(moment(data.datetime));
      _dataSet.push(data.value);
    });
    return { label: labelSet, data: _dataSet };
  };

  const getAlgorithmName = () => {
    switch (algorithm) {
      case "simple_zero":
        return "峰值划分";
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

                  let dataSource = [];
                  // 合并左右手数据，以左手为主。

                  let left_ds = calculateOrigin(dataSet["LEFT"]);
                  let right_ds = calculateOrigin(dataSet["RIGHT"]);

                  _.each(left_ds.label, (v, i) => {
                    let data = {
                      time: v.format("YYYY-MM-DD HH:mm:ss SSSS"),
                      left: left_ds.data[i],
                    };
                    _.each(right_ds.label, (vv, j) => {
                      if (Math.abs(v.diff(vv)) < 100) {
                        //console.log(vv.format("YYYY-MM-DD HH:mm:ss SSSS"));
                        data.right = right_ds.data[j];
                      }
                    });
                    dataSource.push(data);
                  });

                  setDataSet(dataSource);
                }
              }}
            />
          </div>
        }
      ></Toolbar>
      <TabView>
        <TabPanel header="原始数据">
          <BigLineChart dataSource={dataSet} />
        </TabPanel>
        <TabPanel header="工作周期分析">
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
                <span>峰值划分</span>
                {/* &nbsp;&nbsp;&nbsp;
                <RadioButton
                  name="algorithm"
                  value="tow_way"
                  onChange={(e) => setAlgorithm(e.value)}
                  checked={algorithm === "tow_way"}
                />
                &nbsp;&nbsp;
                <span>双向启停</span> */}
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
                  onClick={() => {
                    switch (algorithm) {
                      case "simple_zero":
                        let rs = SimpleZero(
                          dataSet,
                          algorithmParams.simple_zero
                        );

                        setCycleSet(rs);

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
          <Splitter style={{ height: "450px", marginTop: "10px" }}>
            <SplitterPanel size={10} minSize={10}>
              <DataTable
                dataKey="code"
                scrollable
                scrollHeight="450px"
                rowHover
                header="运动周期"
                value={cycleSet}
                selectionMode="single"
                onSelectionChange={(e) => {
                  console.log(e.value);
                  setSelectedCycle(e.value);
                }}
              >
                <Column field="code" header="编号" />
              </DataTable>
            </SplitterPanel>
            <SplitterPanel size={90} minSize={50}>
              <div style={{ width: "1300px", margin: "5px" }}>
                <Divider align="left">
                  <div className="inline-flex align-items-center">
                    <i className="pi pi-chart-line mr-2"></i>
                    <b>
                      第
                      {(() => {
                        if (selectedCycle != null) {
                          return selectedCycle.code;
                        }
                        return "";
                      })()}
                      个周期 总时长
                      {(() => {
                        if (selectedCycle == null) {
                          return 0;
                        }
                        let times = _.chain(selectedCycle.dataSet)
                          .map((vt) => {
                            return vt.time;
                          })
                          .sort()
                          .value();

                        return calculate_time_diff(times);
                      })()}
                      分钟
                    </b>
                    <b className="ml-5">
                      <Button
                        label="动作时间分析"
                        className="p-button-raised p-button-rounded p-button-sm"
                        onClick={() => {
                          //console.log(selectedCycle, "动作次数分析");
                          let rs = MoveAccount(
                            selectedCycle.dataSet,
                            algorithmParams.simple_zero
                          );
                          console.log(rs);

                          setBasicData({
                            labels: ["左手", "右手"],
                            datasets: [
                              {
                                label: "运动",
                                backgroundColor: "#00FF00",
                                data: [
                                  (rs.lm.length / 120).toFixed(2),
                                  (rs.rm.length / 120).toFixed(2),
                                ],
                              },
                              {
                                label: "停止",
                                backgroundColor: "#FF0000",
                                data: [
                                  (rs.ls.length / 120).toFixed(2),
                                  (rs.rs.length / 120).toFixed(2),
                                ],
                              },
                            ],
                          });
                          setVisibleFullScreen(true);
                        }}
                      />
                    </b>
                  </div>
                </Divider>
                <BigLineChart
                  dataSource={(() => {
                    if (selectedCycle != null) {
                      return selectedCycle.dataSet;
                    }
                    return [];
                  })()}
                />
              </div>
            </SplitterPanel>
          </Splitter>
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
      <Sidebar
        visible={visibleFullScreen}
        fullScreen
        onHide={() => setVisibleFullScreen(false)}
      >
        <h3>
          第
          {(() => {
            if (selectedCycle != null) {
              return selectedCycle.code;
            }
            return "";
          })()}
          个周期 动作时长分析(单位：分钟)
        </h3>
        <Chart
          height="500px"
          type="bar"
          data={basicData}
          options={basicOptions}
        />
      </Sidebar>
    </Card>
  );

  function calculate_time_diff(timeSet) {
    let lm = moment(_.last(timeSet), "YYYY-MM-DD HH:mm:ss SSSS").diff(
      moment(_.first(timeSet), "YYYY-MM-DD HH:mm:ss SSSS"),
      "minutes",
      true
    );

    return lm.toFixed(2);
  }
}
