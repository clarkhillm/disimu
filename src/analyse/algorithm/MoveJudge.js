import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import { RadioButton } from "primereact/radiobutton";
import React, { useState } from "react";
import { Chart } from "primereact/chart";
import _ from "lodash";

export default function MoveJudge(props) {
  const [dataSource, setDataSource] = useState("cycle");
  const [move, setMove] = useState(3);
  const [stop, setStop] = useState(0.15);
  const [basicData, setBasicData] = useState({
    labels: ["周期1", "周期2", "周期3", "周期4", "周期5", "周期6", "周期7"],
    datasets: [
      {
        label: "运动",
        backgroundColor: "#42A5F5",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: "停止",
        backgroundColor: "#FFA726",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const calculate = (dataSet) => {
    let rs = { m: 0, s: 0 };
    _.each(dataSet, (v) => {
      if (Math.abs(v.left) >= move || Math.abs(v.right) >= move) {
        rs.m += 1;
      } else {
        rs.s += 1;
      }
      //if (Math.abs(v.left) <= stop || Math.abs(v.right) <= stop) {
      rs.s += 1;
      //}
    });
    return rs;
  };

  const basicOptions = {
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

  return (
    <div>
      <div className="inline-flex align-items-center w-full">
        <div>数据来源：</div>
        <RadioButton
          inputId="dataSource"
          name="dataSource"
          value="cycle"
          onChange={(e) => setDataSource(e.value)}
          checked={dataSource === "cycle"}
        />
        <label className="m-2" htmlFor="dataSource">
          周期
        </label>
        <RadioButton
          inputId="dataSource1"
          name="dataSource"
          value="select"
          onChange={(e) => setDataSource(e.value)}
          checked={dataSource === "select"}
        />
        <label className="ml-2" htmlFor="dataSource1">
          手选
        </label>
        {/* <div style={{ width: "150px" }} className="ml-2">
          <div className="p-inputgroup ml-2">
            <span className="p-inputgroup-addon">停止阈值:</span>
            <InputNumber
              mode="decimal"
              minFractionDigits={2}
              value={stop}
              onChange={(e) => {
                setStop(e.value);
              }}
            />
          </div>
        </div> */}

        <div style={{ width: "150px" }} className="ml-2">
          <div className="p-inputgroup ml-2">
            <span className="p-inputgroup-addon">运动阈值:</span>
            <InputNumber
              value={move}
              onChange={(e) => {
                setMove(e.value);
              }}
            />
          </div>
        </div>
        <div className="w-6"></div>
        <div className="ml-4">
          <Button
            label="计算"
            onClick={() => {
              let labels = [];
              let datasets = [
                {
                  label: "运动",
                  backgroundColor: "#42A5F5",
                  data: [],
                },
                {
                  label: "停止",
                  backgroundColor: "#FFA726",
                  data: [],
                },
              ];
              switch (dataSource) {
                case "cycle":
                  console.log(props.cycleData);

                  _.each(props.cycleData, (v) => {
                    labels.push("周期" + v.code);
                    let rs = calculate(v.dataSet);
                    datasets[0].data.push(rs.m);
                    datasets[1].data.push(rs.s);
                  });
                  setBasicData({
                    labels: labels,
                    datasets: datasets,
                  });
                  break;
                case "select":
                  console.log(props.dataSet);
                  labels = ["手动选择数据"];
                  let rs = calculate(props.dataSet);
                  datasets[0].data.push(rs.m);
                  datasets[1].data.push(rs.s);
                  setBasicData({
                    labels: labels,
                    datasets: datasets,
                  });
                  break;
              }
            }}
          />
        </div>
      </div>
      <Divider />
      <Chart type="bar" data={basicData} options={basicOptions} />
    </div>
  );
}
