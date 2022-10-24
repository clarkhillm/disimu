import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { list } from "./service";
import { useFormik } from "formik";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { appFetch } from "../utils";
import { IMU_GLOBALS } from "../app";

export default function DevMain() {
  let [devList, setDevList] = useState([]);
  let [showCreate, setShowCreate] = useState(false);

  const formikCreate = useFormik({
    initialValues: {
      devId: "",
      measurement: "",
      zeroMetric: 0,
      positiveMetric: 0,
      negativeMetric: 0,
    },
    validate: (data) => {
      let errors = {};

      if (!data.devId) {
        errors.devId = "设备id不能为空";
      }

      if (!data.measurement) {
        errors.measurement = "设备的端口不能为空";
      }
      return errors;
    },
    onSubmit: async (data) => {
      console.log("on submit create ...", data);
      setShowCreate(false);
      let rs = await appFetch("/imu/dev", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (rs.status == 200) {
        IMU_GLOBALS.toast.current.show({
          severity: "info",
          summary: "信息",
          detail: "设备添加成功。",
          life: 3000,
        });
        getList();
      }
    },
  });

  const isFormFieldValid = (name) =>
    !!(formikCreate.touched[name] && formikCreate.errors[name]);
  const getFormErrorMessage = (name) => {
    return (
      isFormFieldValid(name) && (
        <small className="p-error">{formikCreate.errors[name]}</small>
      )
    );
  };

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
            <Button
              label="新建设备"
              icon="pi pi-plus"
              onClick={() => {
                setShowCreate(true);
              }}
            />
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
          body={(rowdata) => {
            return (
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
                  onClick={async () => {
                    console.log("rowdata", rowdata);
                    let rs = await appFetch(`/imu/dev/${rowdata.id}`, {
                      method: "delete",
                    });
                  }}
                />
              </div>
            );
          }}
        />
      </DataTable>
      <Dialog
        header="创建设备"
        visible={showCreate}
        position="top"
        modal
        draggable={false}
        resizable={false}
        style={{ width: "30vw" }}
        onHide={() => {
          setShowCreate(false);
        }}
      >
        <form onSubmit={formikCreate.handleSubmit} className="p-fluid">
          <div className="field">
            <InputText
              name="devId"
              value={formikCreate.values.devId}
              placeholder="设备ID"
              onChange={formikCreate.handleChange}
            />
            {getFormErrorMessage("devId")}
          </div>
          <div className="field">
            <InputText
              name="measurement"
              value={formikCreate.values.measurement}
              placeholder="端口"
              onChange={formikCreate.handleChange}
            />
            {getFormErrorMessage("measurement")}
          </div>
          <div className="field grid">
            <label className="col-12 md:col-2 md:mb-0">归零值：</label>
            <div className="col-12 md:col-2">
              <InputNumber
                name="zeroMetric"
                value={formikCreate.values.zeroMetric}
                onValueChange={formikCreate.handleChange}
                mode="decimal"
                minFractionDigits={2}
              />
            </div>
            <label className="col-12 md:col-2 md:mb-0">正阈值：</label>
            <div className="col-12 md:col-2">
              <InputNumber
                name="positiveMetric"
                value={formikCreate.values.positiveMetric}
                onValueChange={formikCreate.handleChange}
                mode="decimal"
                minFractionDigits={2}
              />
            </div>
            <label className="col-12 md:col-2 md:mb-0">负阈值：</label>
            <div className="col-12 md:col-2">
              <InputNumber
                name="negativeMetric"
                value={formikCreate.values.negativeMetric}
                onValueChange={formikCreate.handleChange}
                mode="decimal"
                minFractionDigits={2}
              />
            </div>
          </div>
          <div className="p-dialog-footer pb-0">
            <Button
              label="取消"
              type="button"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setShowCreate(false);
                formikCreate.resetForm();
              }}
            />
            <Button type="submit" label="确定" icon="pi pi-check" />
          </div>
        </form>
      </Dialog>
    </Card>
  );
}
