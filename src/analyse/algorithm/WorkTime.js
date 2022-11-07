import _ from "lodash";
import moment from "moment";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import React, { useState } from "react";

export default function WorkTime(props) {
  const [stop, setStop] = useState(0.15);
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
    let data__ = [];
    data__ = data__.concat(ds);
    _.reverse(data__);

    let rest = [];
    let run = [];

    // console.log(data__, stop);

    for (let i = 0; i < data__.length; i++) {
      let v = data__[i];
      rest.push(v);
      if (Math.abs(v.left) > stop || Math.abs(v.right) > stop) {
        break;
      }
    }

    console.log("rest", rest);

    _.each(ds, (v) => {
      let diff = moment(v.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(_.last(rest).time, "YYYY-MM-DD HH:mm:ss SSSS")
      );
      if (diff < 0) {
        run.push(v);
      }
    });

    console.log("run", run);

    let diff_run = moment(_.first(run).time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
      moment(_.last(run).time, "YYYY-MM-DD HH:mm:ss SSSS")
    );

    let diff_rest = moment(_.first(rest).time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
      moment(_.last(rest).time, "YYYY-MM-DD HH:mm:ss SSSS")
    );

    rs.m = Math.abs(diff_run) / 1000;
    rs.s = Math.abs(diff_rest) / 1000;

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
        <div style={{ width: "150px" }} className="ml-2">
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
        </div>
        <div className="w-9"></div>
        <Button
          label="计算"
          onClick={() => {
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
              labels.push("周期" + v.code);
              let rs = calculate(v.dataSet);
              datasets[0].data.push(rs.m);
              datasets[1].data.push(rs.s);
            });
            setBasicData({
              labels: labels,
              datasets: datasets,
            });
          }}
        />
      </div>
      <Divider />
      <Chart type="bar" data={basicData} options={basicOptions} />
    </div>
  );
}
