import _ from "lodash";
import moment from "moment";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import CycleDataView from "./CycleDataView";
export default function CycleExtremum(props) {
  const { setCycleData } = props;

  const [result, setResult] = useState([]);
  const [pt, setPt] = useState(0.2);
  const [zero, setZero] = useState(0.12);
  const [zeroAccount, setZeroAccount] = useState(5);
  useEffect(() => {}, []);

  const calculate = () => {
    console.log(props.dataSet);

    let afterZ = _.map(props.dataSet, (v) => {
      let left = v.left;
      let right = v.right;
      if (Math.abs(left) < zero) {
        left = 0;
      }
      if (Math.abs(right) < zero) {
        right = 0;
      }
      return { time: v.time, left: left, right: right };
    });

    console.log("zero---", afterZ);

    let zeroSet = _.filter(afterZ, (v) => {
      return v.left == 0 && v.right == 0;
    });

    // console.log("zs", zeroSet);

    let zero_group = [];
    let zero_set = [];

    _.reduce(zeroSet, (acc, v) => {
      let diff = moment(v.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(acc.time, "YYYY-MM-DD HH:mm:ss SSSS")
      );
      //   console.log(diff, acc, v);
      if (diff < 5000) {
        zero_set.push(acc);
      } else {
        zero_group.push(zero_set);
        zero_set = [];
      }
      return v;
    });

    zero_group = _.filter(zero_group, (v) => {
      return v.length >= zeroAccount;
    });

    console.log("zg", zero_group);

    let rs_set = [];
    let rs = [];

    let zero_group_index = 0;
    for (let i = 0; i < afterZ.length; i++) {
      let v = afterZ[i];
      let diff = moment(v.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(
          _.last(zero_group[zero_group_index]).time,
          "YYYY-MM-DD HH:mm:ss SSSS"
        )
      );

      //   console.log(diff, v, zero_group_index);

      if (
        zero_group_index < zero_group.length - 1 &&
        diff >= 0 &&
        (v.left >= pt || v.right >= pt)
      ) {
        zero_group_index += 1;
        rs_set.push(rs);
        rs = [];
      }

      rs.push(v);
    }

    console.log("rs_set", rs_set);

    //rs_set = _.tail(rs_set);
    //rs_set = _.initial(rs_set);

    // rs_set = _.filter(rs_set, (v) => {
    //   return v.length >= 50;
    // });

    let result = _.map(rs_set, (v, i) => {
      return {
        code: i + 1,
        dataSet: v,
        TimeRanges: [_.first(v).time, _.last(v).time],
      };
    });

    return result;
  };

  return (
    <div>
      <Toolbar
        left={
          <React.Fragment>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">正阈值:</span>
              <InputNumber
                mode="decimal"
                style={{ width: "50px" }}
                minFractionDigits={2}
                value={pt}
                onChange={(e) => {
                  setPt(e.value);
                }}
              />
            </div>
            <div className="p-inputgroup ml-2">
              <span className="p-inputgroup-addon">归零:</span>
              <InputNumber
                mode="decimal"
                minFractionDigits={2}
                value={zero}
                onChange={(e) => {
                  setZero(e.value);
                }}
              />
            </div>
            <div className="p-inputgroup ml-2">
              <span className="p-inputgroup-addon">归零数:</span>
              <InputNumber
                value={zeroAccount}
                onChange={(e) => {
                  setZeroAccount(e.value);
                }}
              />
            </div>
          </React.Fragment>
        }
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
