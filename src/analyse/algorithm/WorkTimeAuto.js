import _ from "lodash";
import { Chart } from "primereact/chart";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import React, { useEffect, useState } from "react";

import { calculate } from "./calculate/WorkTime";

export default function WorkTimeAuto(props) {
  const [stop, setStop] = useState(1.5);
  const [stopCount, setStopCount] = useState(3);

  const [basicData, setBasicData] = useState({
    labels: [],
    datasets: [
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
    ],
  });

  const basicOptions = {
    animation: false,
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
        stacked: true,
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        stacked: true,
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

    let ddd = _.cloneDeep(basicData);
    if (ddd.labels.length > 10) {
      ddd.labels = _.tail(ddd);
      ddd.datasets[0].data = _.tail(ddd.datasets[0].data);
      ddd.datasets[1].data = _.tail(ddd.datasets[1].data);
    }

    _.each(props.cycleData, (v) => {
      console.log(" cycleData --", v);
      labels.push("周期" + v.code);
      let rs = calculate(v.dataSet, stop, stopCount);
      datasets[0].data.push(rs.m);
      datasets[1].data.push(rs.s);
    });

    ddd.labels = labels;
    ddd.datasets[0].data = datasets[0].data;
    ddd.datasets[1].data = datasets[1].data;

    setBasicData(ddd);
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
