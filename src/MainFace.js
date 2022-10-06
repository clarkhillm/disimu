import _ from "lodash";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import React, { useEffect, useState } from "react";
import Header from "./Header";

var working = [];
var resting = [];
var labels = [];
var index = 0;
var ws = new WebSocket(`ws://${window.location.host}/imuws`);
export default function MainFace() {
  useEffect(() => {}, []);
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
        suggestedMin: 0,
        suggestedMax: 30,
      },
    },
  };
  ws.onopen = (e) => {
    console.log("ws opened...");
  };

  const [basicData, setBasicData] = useState({
    labels: [],
    datasets: [
      {
        label: "工作",
        backgroundColor: "#42A5F5",
        data: [],
      },
      {
        label: "休息",
        backgroundColor: "#FFA726",
        data: [],
      },
    ],
  });

  ws.onmessage = (e) => {
    let data = JSON.parse(e.data).value;

    let work = data[0] + data[1];
    let stop = data[2];

    working.push(work);
    resting.push(stop);

    labels.push(index);

    let chartData = _.cloneDeep(basicData);
    chartData.labels = labels;
    chartData.datasets[0].data = working;
    chartData.datasets[1].data = resting;

    index += 1;

    setBasicData(chartData);
  };

  const clean = () => {
    working = [];
    resting = [];
    labels = [];
    let chartData = _.cloneDeep(basicData);
    chartData.labels = [];
    chartData.datasets[0].data = [];
    chartData.datasets[1].data = [];
    setBasicData(chartData);
  };

  return (
    <div>
      <Header clean={clean} />
      <Card title="实时数据" className="m-2">
        <Chart type="bar" data={basicData} options={basicOptions} />
      </Card>
    </div>
  );
}
