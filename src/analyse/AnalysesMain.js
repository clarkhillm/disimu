import _ from "lodash";
import moment from "moment/moment";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { appFetch } from "../utils";
import BigLineChart from "./BigLineChart";

import { Calendar } from "primereact/calendar";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import { PanelMenu } from "primereact/panelmenu";
import { Sidebar } from "primereact/sidebar";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { IMU_GLOBALS } from "../appRoute";
import CycleRateOfChange from "./algorithm/CycleRateOfChange";
import CycleExtremum from "./algorithm/CylcleExtremum";
import MoveAccount from "./algorithm/MoveAccount";
import MoveJudge from "./algorithm/MoveJudge";
import SimpleZero from "./algorithm/SimpleZero";
import WorkTime from "./algorithm/WorkTime";
import HallSensor from "./algorithm/HallSensor";

export default function AnalysesMain() {
  const [positionList, setPositionList] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");

  const [timeDesc, setTimeDesc] = useState([]);

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

  const [algorithmTitle, setAlgorithmTitle] = useState("请选择一个算法");
  const [algorithmDescription, setAlgorithmDescription] = useState("");

  const [cycleData, setCycleData] = useState([]);

  const [items, setItems] = useState([
    {
      label: "周期分析算法",
      icon: "pi pi-fw pi-chart-line",
      items: [
        {
          label: "加速度变化率",
          icon: "pi pi-fw pi-chevron-circle-right",
          command: () => {
            setAlgorithmTitle("加速度变化率");
            setAlgorithmDescription("根据加速度的变化率来分析周期的起始情况。");
          },
        },
        {
          label: "双手正向极值",
          icon: "pi pi-fw pi-chevron-circle-right",
          command: () => {
            setAlgorithmTitle("双手正向极值");
            setAlgorithmDescription(
              <div>
                根据加速度的双手正向最大值来分析周期的起始情况。
                <p>
                  在休息的状态下，当双手同时产生一个向前的加速度时，就判定为工作周期开始。
                  两个手同时产生一个向后的加速度，然后当手停止后，n秒钟后任然是停止状态，
                  那么就判定这个时候为休息状态，当双手同时产生一个向前的加速度时，本周期结束。
                </p>
              </div>
            );
          },
        },
        {
          label: "霍尔传感器",
          icon: "pi pi-fw pi-chevron-circle-right",
          command: () => {
            setAlgorithmTitle("霍尔");
            setAlgorithmDescription(
              <div>根据霍尔传感器的数据来分析周期的起始情况。</div>
            );
          },
        },
      ],
    },
    {
      label: "动作判定算法",
      icon: "pi pi-fw pi-sort-alt",
      items: [
        {
          label: "运动/停止判定",
          icon: "pi pi-fw pi-chevron-circle-right",
          command: () => {
            setAlgorithmTitle("运动/停止判定");
            setAlgorithmDescription(
              <div>
                根据加速度判断载体的运动和停止情况。
                <p>
                  工作周期内，当有一个向前或者向后的加速度大于某一个数值时，就判定为
                  手是动作状态。当手运动的时候加速度小于某一个数值时，就判定手为停止状态。
                </p>
              </div>
            );
          },
        },
      ],
    },
    {
      label: "结论数据分析",
      icon: "pi pi-fw pi-file",
      items: [
        {
          label: "有效工作/休息时间(按周期）",
          icon: "pi pi-fw pi-chevron-circle-right",
          command: () => {
            setAlgorithmTitle("有效工作/休息时间");
            setAlgorithmDescription(
              <div>
                按照周期划分计算有效的工作时间和休息时间。
                <p>
                  在工作周期内，从周期开始到两个手开始动，到两个手停止工作这段时间内所有手动的时间和停止时间都加在一起，就是有效工作时间。
                  在工作周期内，从两个手停止工作开始，到下一个工作周期开始这段时间，就是休息时间。
                </p>
              </div>
            );
          },
        },
        // {
        //   label: "有效时间（总计）",
        //   icon: "pi pi-box pi-chevron-circle-right",
        //   command: () => {
        //     setAlgorithmTitle("总计");
        //     setAlgorithmDescription(
        //       <div>
        //         计算统计所有周期的有效的工作时间和休息时间。
        //         <p>
        //           在工作周期内，从周期开始到两个手开始动，到两个手停止工作这段时间内所有手动的时间和停止时间都加在一起，就是有效工作时间。
        //           在工作周期内，从两个手停止工作开始，到下一个工作周期开始这段时间，就是休息时间。
        //         </p>
        //       </div>
        //     );
        //   },
        // },
      ],
    },
  ]);

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
            <Calendar
              style={{ width: "300px" }}
              value={timeDesc}
              onChange={(e) => setTimeDesc(e.value)}
              selectionMode="range"
              showTime
              showSeconds
            />
            &nbsp;&nbsp;&nbsp;
            <Button
              icon="pi pi-check"
              className="p-button-rounded"
              onClick={async () => {
                let rs = await appFetch(
                  `/imu/analyses/query/${currentPosition}?timeRange=start:${moment(
                    timeDesc[0]
                  )
                    .utc()
                    .format("YYYY-MM-DDTHH:mm:ss[Z]")},stop:${moment(
                    timeDesc[1]
                  )
                    .utc()
                    .format("YYYY-MM-DDTHH:mm:ss[Z]")}`,
                  {
                    method: "GET",
                  }
                );
                if (rs.status == 200) {
                  let dataSet = await rs.json();

                  let dataSource = [];

                  let left_ds = calculateOrigin(dataSet["LEFT"]);
                  let right_ds = calculateOrigin(dataSet["RIGHT"]);
                  let cycle_ds = calculateOrigin(dataSet["cycle"]);

                  _.each(left_ds.label, (v, i) => {
                    let data = {
                      time: v.format("YYYY-MM-DD HH:mm:ss SSSS"),
                      left: left_ds.data[i],
                      cycle: 0,
                    };
                    _.each(right_ds.label, (vv, j) => {
                      if (Math.abs(v.diff(vv)) < 100) {
                        //console.log(vv.format("YYYY-MM-DD HH:mm:ss SSSS"));
                        data.right = right_ds.data[j];
                      }
                    });

                    _.each(cycle_ds.label, (vvv, k) => {
                      if (Math.abs(v.diff(vvv)) < 100) {
                        data.cycle = cycle_ds.data[k] / 10;
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
        <TabPanel header="分析算法">
          <div className="flex">
            <PanelMenu model={items} style={{ width: "15rem" }} />
            <Card
              title={algorithmTitle}
              subTitle={algorithmDescription}
              className="w-full ml-2"
            >
              {(() => {
                switch (algorithmTitle) {
                  case "加速度变化率":
                    return (
                      <div>
                        <CycleRateOfChange
                          dataSet={dataSet}
                          setCycleData={setCycleData}
                        />
                      </div>
                    );
                  case "双手正向极值":
                    return (
                      <div>
                        <CycleExtremum
                          dataSet={dataSet}
                          setCycleData={setCycleData}
                        />
                      </div>
                    );
                  case "霍尔":
                    return (
                      <div>
                        <HallSensor
                          dataSet={dataSet}
                          setCycleData={setCycleData}
                        />
                      </div>
                    );
                  case "运动/停止判定":
                    return (
                      <div>
                        <MoveJudge dataSet={dataSet} cycleData={cycleData} />
                      </div>
                    );
                  case "有效工作/休息时间":
                    return (
                      <div>
                        <WorkTime cycleData={cycleData} />
                      </div>
                    );
                    case "总计":
                      return <div>总计</div>
                  default:
                    return "";
                }
              })()}
            </Card>
          </div>
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
