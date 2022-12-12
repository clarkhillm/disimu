import _ from "lodash";
import moment from "moment";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import { appFetch } from "../utils";

import { Chart } from "primereact/chart";

import { calculateHall } from "../analyse/algorithm/calculate/HallCT";
import { calculate } from "../analyse/algorithm/calculate/WorkTime";

export default function LineDataView() {
  const [lineList, setLineList] = useState([]);
  const [positionList, setPositionList] = useState([]);

  const [currentLine, setCurrentLine] = useState([]);
  const [timerStart, setTimerStart] = useState(false);

  const baseTime = "2022-12-09T13:28:00";

  const [count, setCount] = useState(-1);

  const [canStart, setCanStart] = useState(false);

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

  let timer = useRef();
  useEffect(() => {
    console.log("===", count);
    if (count >= 0) {
      updateDataSet(count);
    }
  }, [count]);

  useEffect(() => {
    if (timerStart) {
      timer.current = window.setInterval(() => {
        setCount((prevCount) => {
          return prevCount + 1;
        });
      }, 5 * 60 * 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [timerStart]);

  const getLineList = async () => {
    let rs = await appFetch("/imu/line/list", { method: "GET" });
    if (rs.status == 200) {
      let json = await rs.json();
      setLineList(json);
    }
  };

  const getPositionList = async (lineId) => {
    let rs = await appFetch(`/imu/position/${lineId}`, { method: "GET" });
    if (rs.status == 200) {
      let json = await rs.json();
      console.log("==position==", json);
      setPositionList(json);
      setCanStart(true);
    }
  };

  useEffect(() => {
    getLineList();
  }, []);

  const updateDataSet = async (index) => {
    index += index * 5;
    let from = moment(baseTime)
      .utc()
      .add(index - 5, "m")
      .format("YYYY-MM-DDTHH:mm:ss[Z]");
    let to = moment(baseTime)
      .utc()
      .add(index, "m")
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    console.log(timerStart, from, to);

    let rsLabels = [];
    let rsRunDs = [];
    let rsRestDs = [];

    _.each(positionList, async (position) => {
      console.log("query data ...", position);
      let rs = await appFetch(
        `/imu/analyses/query/${position.id}?timeRange=start:${from},stop:${to}`,
        {
          method: "GET",
        }
      );

      if (rs.status == 200) {
        let ds = await rs.json();
        console.log(position.name, ds);

        rsLabels.push(position.name);

        let _dataSource = [];

        let left_ds = calculateOrigin(ds["LEFT"]);
        let right_ds = calculateOrigin(ds["RIGHT"]);
        let cycle_ds = calculateOrigin(ds["cycle"]);

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

          _dataSource.push(data);
        });

        let cycleRs = calculateHall(_dataSource);
        console.log("cycle rs:", cycleRs);

        let m = [];
        let s = [];
        _.each(cycleRs, (ds) => {
          let ctRs = calculate(ds.dataSet, stop, stopCount);
          console.log("ct rs:", position.name, ctRs);
          if (m.length > 0) {
            m[0] = m[0] + ctRs.m;
          } else {
            m[0] = ctRs.m;
          }
          if (s.length > 0) {
            s[0] = s[0] + ctRs.s;
          } else {
            s[0] = ctRs.s;
          }
        });
        if (m.length > 0) {
          console.log("m:", m[0] / cycleRs.length);
          rsRunDs.push(m[0]);
        } else {
          rsRunDs.push(0);
        }
        if (s.length > 0) {
          console.log("s:", s[0] / cycleRs.length);
          rsRestDs.push(s[0]);
        } else {
          rsRestDs.push(0);
        }

        console.log(rsLabels, rsRunDs, rsRestDs);

        setBasicData({
          labels: rsLabels,
          datasets: [
            {
              label: "有效工作时间",
              backgroundColor: "#42A5F5",
              data: rsRunDs,
            },
            {
              label: "休息时间",
              backgroundColor: "#FFA726",
              data: rsRestDs,
            },
          ],
        });
      }
    });
  };

  const calculateOrigin = (dataSet) => {
    let labelSet = [];
    let _dataSet = [];
    _.each(dataSet, (data) => {
      labelSet.push(moment(data.datetime));
      _dataSet.push(data.value);
    });
    return { label: labelSet, data: _dataSet };
  };

  const stopRead = () => {
    setTimerStart(false);
    clearInterval(timer.current);
    // setCount(0);
  };

  return (
    <div className="m-2">
      <Toolbar
        className="mb-4"
        left={
          <div>
            <span>选择生产线：</span>
            <Dropdown
              value={currentLine}
              options={lineList}
              onChange={async (e) => {
                setCanStart(false);
                setCurrentLine(e.value);
                await getPositionList(e.value);
              }}
              placeholder="请选择"
              optionLabel="name"
              optionValue="id"
              className="mr-4"
            />
            <Button
              label="开始"
              className="mr-2"
              disabled={canStart ? undefined : true}
              onClick={() => {
                //setBaseTime(moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]"));
                //setBaseTime("2022-12-09T12:16:53");
                setCount(0);
                setTimerStart(true);
              }}
            />
            <Button label="停止" onClick={stopRead} />
          </div>
        }
      />
      <Chart type="bar" data={basicData} options={basicOptions} />
    </div>
  );
}
