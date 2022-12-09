import _ from "lodash";
import { Chart } from "primereact/chart";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import React, { useEffect, useState } from "react";

export default function WorkTimeAuto(props) {
  const [stop, setStop] = useState(1.5);
  const [stopCount, setStopCount] = useState(3);

  const [basicData, setBasicData] = useState({
    labels: ["周期1", "周期2", "周期3", "周期4", "周期5", "周期6", "周期7"],
    datasets: [
      {
        label: "有效工作时间",
        backgroundColor: "#42A5F5",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: "休息时间",
        backgroundColor: "#FFA726",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const calculate = (ds) => {
    let rs = { m: 0, s: 0 };

    let rest = [];
    let run = [];

    let rest_start = false;

    let rest_temp = [];
    let rest_index = 0;

    for (let i = 0; i < ds.length; i++) {
      let v = ds[i];
      if (Math.abs(v.left) > stop || Math.abs(v.right) > stop) {
        run.push(v);
        if (rest_temp.length >= stopCount) {
          rest = rest.concat(rest_temp);
        } else {
          run = run.concat(rest_temp);
        }
        rest_start = false;
        rest_index = 0;
        rest_temp = [];
      } else {
        if (rest_temp.length == 0) {
          rest_start = true;
        } else if (rest_index > 0 && rest_index == i - 1) {
          rest_start = true;
        } else {
          run.push(v);
          rest_start = false;
          rest_index = 0;
          rest_temp = [];
        }
        if (rest_start) {
          rest_index = i;
          rest_temp.push(v);
        }
      }
    }

    console.log("run", run);
    console.log("rest", rest);

    rs.m = run.length / 10;
    rs.s = rest.length / 10;

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

  useEffect(() => {
    console.log("cycleData", props.cycleData);
    let labels = [];
    let datasets = [
      {
        label: "有效工作时间",
        backgroundColor: "#42A5F5",
        data: [],
      },
      {
        label: "休息时间",
        backgroundColor: "#FFA726",
        data: [],
      },
    ];

    _.each(props.cycleData, (v) => {
      console.log(" cycleData --",v);
      labels.push("周期" + v.code);
      let rs = calculate(v.dataSet);
      datasets[0].data.push(rs.m);
      datasets[1].data.push(rs.s);
    });
    setBasicData({
      labels: labels,
      datasets: datasets,
    });
  }, [props.cycleData]);

  return (
    <div>
      <div className="inline-flex align-items-center w-full">
        <div style={{ width: "150px" }} className="ml-2">
          <div className="p-inputgroup ml-2">
            <span className="p-inputgroup-addon">停止阈值:</span>
            <InputNumber
              mode="decimal"
              minFractionDigits={2}
              value={stop}
              onChange={(e) => {
                console.log("stop", e.value);
                setStop(e.value);
              }}
              tooltip="小于该值认为运动停止"
            />
          </div>
        </div>
        <div style={{ width: "150px" }} className="ml-2">
          <div className="p-inputgroup ml-2">
            <span className="p-inputgroup-addon">停止点数:</span>
            <InputNumber
              mode="decimal"
              value={stopCount}
              onChange={(e) => {
                setStopCount(e.value);
              }}
              tooltip="连续停止的个数小于该数值认为休息"
            />
          </div>
        </div>
        <div className="w-8"></div>
      </div>
      <Divider />
      <Chart type="bar" data={basicData} options={basicOptions} />
    </div>
  );
}
