import _ from "lodash";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { calculateHall } from "./calculate/HallCT";
import CycleDataView from "./CycleDataView";

export default function HallSensor(props) {
  const { setCycleData } = props;
  const [result, setResult] = useState([]);

  useEffect(() => {}, []);
  return (
    <div>
      <Toolbar
        right={
          <React.Fragment>
            <Button
              label="分析"
              onClick={() => {
                let rs = calculateHall(props.dataSet);
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
