import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { list } from "./service";
export default function DevMain() {
  let [devList, setDevList] = useState([]);
  const getList = async () => {
    let rs = await list();
    setDevList(rs);
  };
  useEffect(() => {
    getList();
  }, []);
  return (
    <Card className="m-2" title="设备管理">
      <Toolbar
        className="mb-4"
        left={
          <div>
            <Button label="新建设备" icon="pi pi-plus" />
          </div>
        }
      ></Toolbar>
      <DataTable
        value={devList}
        dataKey="id"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate=" 显示{first}到{last}条  共{totalRecords}条"
        responsiveLayout="scroll"
      >
        <Column header="ID" field="devId" sortable />
        <Column header="端口" field="measurement" sortable />
        <Column header="归零" field="zeroMetric" />
        <Column header="正阈值" field="positiveMetric" />
        <Column header="负阈值" field="negativeMetric" />
        <Column
          header="操作"
          body={
            <div className="">
              <Button
                label="查看15分钟数据"
                icon="pi pi-search"
                className="p-button-rounded p-button-sm mr-2"
              />
              <Button
                label="更新"
                icon="pi pi-file"
                className="p-button-rounded p-button-warning p-button-sm mr-2"
              />
              <Button
                label="删除"
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-sm"
              />
            </div>
          }
        />
      </DataTable>
    </Card>
  );
}
