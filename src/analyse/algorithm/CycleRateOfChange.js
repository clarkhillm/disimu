import { Button } from "primereact/button";

import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";

import CycleDataView from "./CycleDataView";
import SimpleZero from "./SimpleZero";

export default function CycleRateOfChange(props) {
  const { setCycleData } = props;

  const [pt, setPt] = useState(0.15);
  const [nt, setNt] = useState(0.15);
  const [result, setResult] = useState([]);

  useEffect(() => {}, []);
  return (
    <div>
      <Toolbar
        left={
          <React.Fragment>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">正阈值:</span>
              <InputNumber
                mode="decimal"
                minFractionDigits={2}
                value={pt}
                style={{ width: "30px" }}
                onChange={(e) => {
                  setPt(e.value);
                }}
              />
            </div>
            <div className="p-inputgroup ml-2">
              <span className="p-inputgroup-addon">负阈值:</span>
              <InputNumber
                mode="decimal"
                minFractionDigits={2}
                value={nt}
                onChange={(e) => {
                  setNt(e.value);
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
                let rs = SimpleZero(props.dataSet, { pt: pt, nt: nt });
                console.log(rs);
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
