import _ from "lodash";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import React, { useEffect, useState } from "react";
import { useResolvedPath } from "react-router-dom";
import Header from "./Header";
import hexTransform from "./utils";

var xxxx = [];
var yy = [];
var zz = [];
var labels = [];
var index = 0;
var ws = new WebSocket(`ws://${window.location.host}/imuws`);
export default function MainFace() {
  useEffect(() => {}, []);

  const [vLabel, setVlabel] = useState([1, 2, 3, 4, 5]);
  const [xData, steXdata] = useState([0, 0, 0, 0, 0]);
  const [yData, steYdata] = useState([0, 0, 0, 0, 0]);
  const [zData, steZdata] = useState([0, 0, 0, 0, 0]);

  const [basicData, setBasicData] = useState({
    labels: vLabel,
    datasets: [
      {
        label: "x方向运动",
        backgroundColor: "#42A5F5",
        data: xData,
        tension: 0.4,
      },
    ],
  });

  const [basicDatay, setBasicDatay] = useState({
    labels: vLabel,
    datasets: [
      {
        label: "y方向运动",
        backgroundColor: "#42A5F5",
        data: yData,
        tension: 0.4,
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
        suggestedMin: -1,
        suggestedMax: 1,
      },
    },
  };

  ws.onopen = (e) => {
    console.log("ws opened...");
  };
  ws.onmessage = (e) => {
    //console.log("message received...", e.data);
    let data = JSON.parse(e.data).value;
    console.log(data);

    //basicData.datasets.data = [data[0]];

    let pointSize = 50;

    index += 1;

    xxxx.push(data[0]);

    if (xxxx.length > pointSize) {
      xxxx.shift();
    }
    labels.push(index);
    if (labels.length > pointSize) {
      labels.shift();
    }

    let ddx = _.cloneDeep(basicData);

    ddx.labels = labels;
    ddx.datasets[0].data = xxxx;

    setBasicData(ddx);

    yy.push(data[1]);
    if (yy.length > pointSize) {
      yy.shift();
    }

    let ddy = _.cloneDeep(basicDatay);
    ddy.labels = labels;
    ddy.datasets[0].data = yy;

    setBasicDatay(ddy);
  };

  return (
    <div>
      <Header />
      <Card title="实时数据" className="m-2">
        <Chart type="line" data={basicData} options={basicOptions} />
        {/* <Chart type="line" data={basicDatay} options={basicOptions} /> */}
      </Card>
    </div>
  );
}
