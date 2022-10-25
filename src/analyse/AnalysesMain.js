import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { appFetch } from "../utils";
import { TabView, TabPanel } from "primereact/tabview";
import { Fieldset } from "primereact/fieldset";
import { Chart } from "primereact/chart";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Dialog } from "primereact/dialog";

export default function AnalysesMain() {
  const [positionList, setPositionList] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");
  const [dates2, setDates2] = useState(null);
  const [displayBasic, setDisplayBasic] = useState(false);

  const [algorithm, setAlgorithm] = useState("simple_zero");

  const [basicData] = useState({
    labels: [0, 1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        label: "加速度",
        data: [65, 59, 80, 81, -56, 55, 40],
        fill: true,
        borderColor: "#42A5F5",
        tension: 0.4,
      },
    ],
  });

  const [basicData2] = useState({
    labels: [1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        label: "速度",
        backgroundColor: "#FFA726",
        data: [65, 59, -80, 81, 56, 55, 40],
      },
    ],
  });

  const [basicData3] = useState({
    labels: [1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        label: "运动",
        backgroundColor: "#42A5F5",
        data: [65, 59, 80, 81, 56, 55, 40],
      },
      {
        label: "停止",
        backgroundColor: "#FFA726",
        data: [28, 48, 40, 19, 86, 27, 90],
      },
    ],
  });

  let basicOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
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

  useEffect(() => {
    getPositionList();
  }, []);
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
                console.log(e);
                setCurrentPosition(e.value);
              }}
              placeholder="请选择工位"
            />
            &nbsp;&nbsp;&nbsp;
            <span>时间范围：</span>
            <Calendar
              id="range"
              value={dates2}
              onChange={(e) => setDates2(e.value)}
              selectionMode="range"
              readOnlyInput
            />
            &nbsp;&nbsp;&nbsp;
            <Button
              icon="pi pi-check"
              className="p-button-rounded"
              aria-label="Filter"
            />
          </div>
        }
      ></Toolbar>
      <TabView>
        <TabPanel header="原始数据">
          <p>直接展示传感器获取的原始数据</p>
          <Fieldset legend="左手" toggleable className="mb-2">
            <Chart
              className="h-20rem"
              type="line"
              data={basicData}
              options={basicOptions}
            />
          </Fieldset>
          <Fieldset legend="右手" toggleable>
            <Chart
              className="h-20rem"
              type="line"
              data={basicData}
              options={basicOptions}
            />
          </Fieldset>
        </TabPanel>
        <TabPanel header="运动方向分析">
          <p>展示运动速度和速度的方向 </p>
          <Fieldset legend="左手" toggleable className="mb-2">
            <Chart
              className="h-20rem"
              type="bar"
              data={basicData2}
              options={basicOptions}
            />
          </Fieldset>
          <Fieldset legend="右手" toggleable>
            <Chart
              className="h-20rem"
              type="bar"
              data={basicData2}
              options={basicOptions}
            />
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
                &nbsp;&nbsp;&nbsp;
                <RadioButton
                  name="algorithm"
                  value="movement"
                  onChange={(e) => setAlgorithm(e.value)}
                  checked={algorithm === "movement"}
                />
                &nbsp;&nbsp;
                <span>运动方向</span>
              </div>
            }
            right={
              <div>
                <Button
                  label="算法说明"
                  className="p-button-sm p-button-rounded "
                  onClick={() => {
                    setDisplayBasic(true);
                  }}
                />
                &nbsp;&nbsp;
                <Button
                  label="算法参数"
                  className="p-button-sm p-button-rounded p-button-warning"
                />
                &nbsp;&nbsp;
                <Button
                  label="开始分析"
                  className="p-button-sm p-button-rounded  p-button-success"
                />
              </div>
            }
          ></Toolbar>
          <Chart
            className="h-20rem"
            type="bar"
            data={basicData3}
            options={basicOptions}
          />
        </TabPanel>
      </TabView>
      <Dialog
        header={(() => {
          switch (algorithm) {
            case "simple_zero":
              return "简单归零";
            case "tow_way":
              return "双向启停";
            case "movement":
              return "运动方向";
          }
        })()}
        visible={displayBasic}
        onHide={() => {
          setDisplayBasic(false);
        }}
      >
        {(() => {
          switch (algorithm) {
            case "simple_zero":
              return (
                <div>
                  <p>
                    简单归零算法会根据运动的归零个数或者间歇时间来进行周期划分。
                  </p>
                  <p>
                    比如：发现连续3个以上的归零，或者归零的时间持续了有若干秒，则认为是一个周期的分隔。
                  </p>
                </div>
              );
            case "tow_way":
              return "双向启停";
            case "movement":
              return "运动方向";
          }
        })()}
      </Dialog>
    </Card>
  );
}
