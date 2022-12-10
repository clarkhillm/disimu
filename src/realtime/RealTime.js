import moment from "moment";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import WorkTimeAuto from "../analyse/algorithm/WorkTimeAuto";
import { Divider } from "primereact/divider";
import BigLineChart from "../analyse/BigLineChart";
import { appFetch } from "../utils";

export default function RealTime() {
  const [positionList, setPositionList] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");

  const [dataSet, setDataSet] = useState({ LEFT: [], RIGHT: [], cycle: [] });
  const [dataSource, setDataSource] = useState([]);

  const [timerStart, setTimerStart] = useState(false);

  const [cycleData, setCycleData] = useState([]);

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

  //const baseTime = "2022-11-27T16:18:31";
  const [baseTime, setBaseTime] = useState({});

  console.log("baseTime: " + baseTime);

  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("===", count);
    if (count > 0) {
      updateDataSet(count);
    }
  }, [count]);

  useEffect(() => {
    if (timerStart) {
      timer.current = window.setInterval(() => {
        setCount((prevCount) => {
          return prevCount + 1;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [timerStart]);

  let timer = useRef();
  const calculateOrigin = (dataSet) => {
    let labelSet = [];
    let _dataSet = [];
    _.each(dataSet, (data) => {
      labelSet.push(moment(data.datetime));
      _dataSet.push(data.value);
    });
    return { label: labelSet, data: _dataSet };
  };
  const updateDataSet = async (index) => {
    if (currentPosition) {
      index += 1;
      let from = moment(baseTime)
        .utc()
        .add(index - 1, "s")
        .format("YYYY-MM-DDTHH:mm:ss[Z]");
      let to = moment(baseTime)
        .utc()
        .add(index, "s")
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      console.log(timerStart, from, to);

      let rs = await appFetch(
        `/imu/analyses/query/${currentPosition}?timeRange=start:${from},stop:${to}`,
        {
          method: "GET",
        }
      );
      if (rs.status == 200) {
        let ds = await rs.json();

        // console.log("ds---", ds);

        let dds = _.cloneDeep(dataSet);

        if (ds.LEFT) {
          dds.LEFT = dds.LEFT.concat(ds.LEFT);
        }
        if (ds.RIGHT) {
          dds.RIGHT = dds.RIGHT.concat(ds.RIGHT);
        }
        if (ds.cycle) {
          dds.cycle = dds.cycle.concat(ds.cycle);
        }

        setDataSet(dds);

        let _dataSource = [];

        let left_ds = calculateOrigin(dds["LEFT"]);
        let right_ds = calculateOrigin(dds["RIGHT"]);
        let cycle_ds = calculateOrigin(dds["cycle"]);

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

        setDataSource(_dataSource);
      }
    }
  };

  const stop = () => {
    setTimerStart(false);
    clearInterval(timer.current);
    // setCount(0);
  };

  const calculateCycle = (dataSet) => {
    console.log("Calculating cycle ...");

    //找到所有的cycle第一个数据。

    let _cycleSet = _.filter(dataSet, (data) => {
      return data.cycle > 10;
    });
    // console.log("cycle set", _cycleSet);

    if (_cycleSet.length == 0) {
      return [];
    }

    let stander = _cycleSet[0];
    let rs0 = [];
    let xxx = [];
    _.each(_cycleSet, (v) => {
      let diff = moment(v.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(stander.time, "YYYY-MM-DD HH:mm:ss SSSS")
      );
      //   console.log(diff);
      if (diff < 2000) {
        xxx.push(v);
      } else {
        rs0.push(xxx);
        stander = v;
        xxx = [v];
      }
    });

    rs0.push(xxx);

    // console.log(rs0);

    let cycleData = [];

    let cyclePointSet = [];
    _.each(rs0, (v) => {
      cyclePointSet.push(_.first(v));
    });

    // console.log(cyclePointSet);

    let rs = [];
    if (cyclePointSet.length > 0) {
      let pointIndex = 0;

      _.each(_.cloneDeep(dataSet), (data) => {
        if (pointIndex + 1 < cyclePointSet.length) {
          let diff0 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
            moment(cyclePointSet[pointIndex].time, "YYYY-MM-DD HH:mm:ss SSSS")
          );
          let diff1 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
            moment(
              cyclePointSet[pointIndex + 1].time,
              "YYYY-MM-DD HH:mm:ss SSSS"
            )
          );
          //   console.log(diff0, diff1);
          if (diff0 < 0) {
            data.cycle = undefined;
            rs.push(data);
          }
          if (diff0 == 0) {
            cycleData.push(rs);
            rs = [];
          }
          if (diff0 > 0 && diff1 < 0) {
            data.cycle = undefined;
            rs.push(data);
          }
          if (diff1 == 0) {
            cycleData.push(rs);
            rs = [];
            pointIndex += 1;
          }
        }
      });

      rs = [];
      _.each(_.cloneDeep(dataSet), (data) => {
        let diff0 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
          moment(_.last(cyclePointSet).time, "YYYY-MM-DD HH:mm:ss SSSS")
        );
        if (diff0 >= 0) {
          data.cycle = undefined;
          rs.push(data);
        }
      });
    }

    if (rs.length > 0) {
      cycleData.push(rs);
    }

    // console.log(cycleData);

    if (cycleData.length > 0) {
      let result = _.map(cycleData, (v, i) => {
        return {
          code: i + 1,
          dataSet: v,
          TimeRanges: [_.first(v).time, _.last(v).time],
        };
      });

      let _cycleData = [];
      if (result.length > 2) {
        _cycleData = _.initial(result);
        _cycleData = _.tail(_cycleData);

        _.each(_cycleData, (v, i) => {
          v.code = i + 1;
        });
      }

      console.log("result", _cycleData);

      setCycleData(_cycleData);
    }
  };

  useEffect(() => {
    let rs = calculateCycle(dataSource);
    console.log("cycle", rs);
  }, [dataSource]);

  return (
    <div className="m-2 ">
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
              }}
              placeholder="请选择工位"
              className="mr-4"
            />
            <Button
              label="开始"
              className="mr-2"
              onClick={() => {
                setBaseTime(moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]"));
                setCount(0);
                setTimerStart(true);
              }}
            />
            <Button label="停止" onClick={stop} />
          </div>
        }
      />
      <div className="card">
        <BigLineChart dataSource={dataSource} />
        <Divider className="text-900 m-5"></Divider>
        <WorkTimeAuto cycleData={cycleData} />
      </div>
    </div>
  );
}
