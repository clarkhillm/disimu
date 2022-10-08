import _ from "lodash";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import React, { useEffect, useState, useRef } from "react";
import Header from "./Header";
import { InputTextarea } from "primereact/inputtextarea";

var dataText = "";
var working = [];
var resting = [];
var labels = [];
var index = 0;

var labels2 = [];
var index2 = 0;
var axset = [];

var updateRate = 0;

var ws = new WebSocket(`ws://${window.location.host}/imuws`);
var ws2 = new WebSocket(`ws://${window.location.host}/imuws/origin`);
export default function MainFace() {
  const [dataAccount, setDataAccount] = useState(50);
  const [zeroAccount, setZeroAccount] = useState(3);
  const [originData, setOriginData] = useState("");
  const textArea = useRef();
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
      },
    },
  };

  ws.onopen = (e) => {
    console.log("ws opened...");
  };

  ws2.onopen = (e) => {
    console.log("ws2 opened...");
  };
  ws2.onmessage = (e) => {
    updateRate += 1;
    let data = JSON.parse(e.data).value;
    // console.log(data);
    dataText += data;
    dataText += "\r\n";

    const area = textArea.current;
    area.scrollTop = area.scrollHeight;

    labels2.push(index2);
    axset.push(data);

    if (index2 > 100) {
      axset.shift();
      labels2.shift();
    }

    if (updateRate == 10) {
      setOriginData(dataText);
      setOriginChartData({
        labels: labels2,
        datasets: [
          {
            label: "加速度",
            backgroundColor: "#42A5F5",
            data: axset,
          },
        ],
      });
      updateRate = 0;
    }

    index2 += 1;
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

  const [originChartData, setOriginChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "加速度",
        backgroundColor: "#42A5F5",
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

    if (index > dataAccount) {
      working.shift();
      resting.shift();
      labels.shift();
    }

    setBasicData(chartData);
    index += 1;
  };

  return (
    <div>
      <Header setDataAccount={setDataAccount} setZeroAccount={setZeroAccount} />
      <Card title={`周期分析 (显示${dataAccount}个数据)`} className="m-2">
        <Chart type="bar" data={basicData} options={basicOptions} />
      </Card>
      <Card title="原始数据" className=" m-2">
        <div className="flex card-container">
          <div className="flex-1">
            <InputTextarea value={originData} rows={25} ref={textArea} />
          </div>
          <div className="flex-auto">
            <Chart type="bar" data={originChartData} options={basicOptions} />
          </div>
        </div>
      </Card>
    </div>
  );
}
