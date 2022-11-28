import _ from "lodash";
import moment from "moment";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import CycleDataView from "./CycleDataView";

export default function HallSensor(props) {
  const { setCycleData } = props;
  const [result, setResult] = useState([]);

  const calculate = () => {
    console.log("Calculating");

    console.log(props.dataSet);

    //找到所有的cycle第一个数据。

    let _cycleSet = _.filter(props.dataSet, (data) => {
      return data.cycle > 10;
    });
    console.log("cycle set", _cycleSet);

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
      if (diff < 5000) {
        xxx.push(v);
      } else {
        rs0.push(xxx);
        stander = v;
        xxx = [v];
      }
    });
    console.log(rs0);

    let cyclePointSet = [];
    _.each(rs0, (v) => {
      cyclePointSet.push(_.first(v));
    });

    console.log(cyclePointSet);

    let pointIndex = 0;

    let rs = [];
    let cycleData = [];
    _.each(props.dataSet, (data) => {
      if (pointIndex + 1 < cyclePointSet.length) {
        let diff0 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
          moment(cyclePointSet[pointIndex].time, "YYYY-MM-DD HH:mm:ss SSSS")
        );
        let diff1 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
          moment(cyclePointSet[pointIndex + 1].time, "YYYY-MM-DD HH:mm:ss SSSS")
        );
        console.log(diff0, diff1);
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
    _.each(props.dataSet, (data) => {
      let diff0 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(_.last(cyclePointSet).time, "YYYY-MM-DD HH:mm:ss SSSS")
      );
      if (diff0 >= 0) {
        data.cycle = undefined;
        rs.push(data);
      }
    });

    cycleData.push(rs);

    console.log(cycleData);

    let result = _.map(cycleData, (v, i) => {
      return {
        code: i + 1,
        dataSet: v,
        TimeRanges: [_.first(v).time, _.last(v).time],
      };
    });

    return result;
  };
  useEffect(() => {}, []);
  return (
    <div>
      <Toolbar
        right={
          <React.Fragment>
            <Button
              label="分析"
              onClick={() => {
                let rs = calculate();
                setResult(rs);
                setCycleData(rs);
              }}
            />
          </React.Fragment>
        }
      />
      <CycleDataView data={result} />
    </div>
  );
}
