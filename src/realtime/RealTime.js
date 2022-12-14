import moment from "moment";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import WorkTimeAuto from "../analyse/algorithm/WorkTimeAuto";
import BigLineChart from "../analyse/BigLineChart";
import { appFetch } from "../utils";

export default function RealTime() {
  const [positionList, setPositionList] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");

  const [dataSet, setDataSet] = useState({ LEFT: [], RIGHT: [], cycle: [] });
  const [dataSource, setDataSource] = useState([]);

  const [timerStart, setTimerStart] = useState(false);

  const [cycleData, setCycleData] = useState([]);

  const [delay, setDelay] = useState(3);

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

  const [baseTime, setBaseTime] = useState({});

  // const baseTime = "2022-12-09T13:28:00";

  // console.log("baseTime: " + baseTime);

  const [count, setCount] = useState(0);

  let cycleCount = 0;

  useEffect(() => {
    console.log("===", count);
    if (count > 0) {
      updateDataSet(count);
      if (dataSet.length > 0) {
        console.log("clean data set");
      }
    }
  }, [count]);

  const cleanDataSet = (dds) => {
    let dsTmp = [];
    if (dds.LEFT.length > 0) {
      dsTmp = dds.LEFT;
    } else {
      dsTmp = dds.RIGHT;
    }

    if (dsTmp.length == 0) {
      return;
    }

    let p0 = _.first(dsTmp);
    let pl = _.last(dsTmp);
    // console.log("p0&pl: ", p0, pl);

    let from = moment(p0.datetime);
    let to = moment(pl.datetime);

    if (to.diff(from, "minutes") >= 1) {
      console.log("start cleaning ...");
      cycleCount += 1;
      if (dds.LEFT.length > 0) {
        dds.LEFT = _.drop(dds.LEFT, 10);
      }
      if (dds.RIGHT.length > 0) {
        dds.RIGHT = _.drop(dds.RIGHT, 10);
      }
      if (dds.cycle.length > 0) {
        //dds.cycle = _.drop(dds.cycle, 1);
      }
    }
  };

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

      // console.log(timerStart, from, to);

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

        cleanDataSet(dds);

        if (ds.LEFT) {
          dds.LEFT = dds.LEFT.concat(ds.LEFT);
          console.log("ds size:", dds.LEFT.length);
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

  const calculateCycle = (dataSource__) => {
    console.log("Calculating cycle ...");

    //???????????????cycle??????????????????

    let _cycleSet = _.filter(dataSource__, (data) => {
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

    let cycleAllCount = dataSet.cycle.length - 2;
    console.log("cycleAllCount: " + cycleAllCount);

    let rs = [];
    if (cyclePointSet.length > 0) {
      let pointIndex = 0;

      _.each(_.cloneDeep(dataSource__), (data) => {
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
      _.each(_.cloneDeep(dataSource__), (data) => {
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

    console.log(cycleData);

    if (cycleData.length > 0) {
      cycleData = _.filter(cycleData, (data) => data.length > 0);
      let result = _.map(cycleData, (v, i) => {
        return {
          code: 0,
          dataSet: v,
          TimeRanges: [_.first(v).time, _.last(v).time],
        };
      });

      let _cycleData = [];
      if (result.length > 2) {
        _cycleData = _.initial(result);
        _cycleData = _.tail(_cycleData);

        _.each(_cycleData, (v, i) => {
          v.code = i + (cycleAllCount - _cycleData.length);
        });
      }

      // console.log("result", _cycleData);

      if (_cycleData.length >= 5) {
        _cycleData = _.takeRight(_cycleData, 5);
      }

      setCycleData(_cycleData);
    }
  };

  useEffect(() => {
    let rs = calculateCycle(dataSource);
    // console.log("cycle", rs);
  }, [dataSource]);

  return (
    <div className="m-2 ">
      <Toolbar
        className="mb-4"
        left={
          <div>
            <span>?????????</span>
            <Dropdown
              name="position"
              value={currentPosition}
              options={positionList}
              onChange={(e) => {
                setCurrentPosition(e.value);
              }}
              placeholder="???????????????"
              className="mr-4"
            />
            <Button
              label="??????"
              className="mr-2"
              onClick={() => {
                let baseTime = moment()
                  .utc()
                  .subtract(delay, "s")
                  .format("YYYY-MM-DDTHH:mm:ss[Z]");
                setBaseTime(baseTime);
                // setBaseTime("2022-12-15T15:28:30");
                console.log("baseTime", baseTime);
                setTimerStart(true);
              }}
            />
            <Button label="??????" onClick={stop} />
          </div>
        }
        right={
          <div>
            ?????????
            <InputText
              value={delay}
              onChange={(e) => {
                setDelay(e.value);
              }}
            />
          </div>
        }
      />
      <div className="card">
        <Accordion multiple activeIndex={[0]}>
          <AccordionTab header="????????????">
            <BigLineChart dataSource={dataSource} />
          </AccordionTab>
          <AccordionTab header="CT??????">
            <WorkTimeAuto cycleData={cycleData} />
          </AccordionTab>
        </Accordion>
      </div>
    </div>
  );
}
