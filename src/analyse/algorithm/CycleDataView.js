import { DataView } from "primereact/dataview";
import { Divider } from "primereact/divider";
import React from "react";
import { calculate_time_diff } from "../../utils";
import BigLineChart from "../BigLineChart";

export default function CycleDataView(props) {
  const itemTemplate = (data) => {
    return (
      <div style={{ width: "1200px", margin: "5px" }}>
        <Divider align="left">
          <div className="inline-flex align-items-center">
            <i className="pi pi-chart-line mr-2"></i>
            <b>
              第{data.code}
              个周期 总时长
              {(() => {
                if (data.dataSet.length > 0) {
                  let times = _.chain(data.dataSet)
                    .map((vt) => {
                      return vt.time;
                    })
                    .sort()
                    .value();

                  return calculate_time_diff(times);
                } else {
                  return 0;
                }
              })()}
              分钟
            </b>
          </div>
        </Divider>
        <BigLineChart dataSource={data.dataSet} />
      </div>
    );
  };

  return (
    <DataView
      value={props.data}
      layout="list"
      itemTemplate={itemTemplate}
      paginator
      paginatorTemplate="PageLinks FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={1}
    ></DataView>
  );
}
