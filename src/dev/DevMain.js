import { useFormik } from "formik";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { IMU_GLOBALS } from "../appRoute";
import { appFetch } from "../utils";
import { list } from "./service";
import { Dropdown } from "primereact/dropdown";

export default function DevMain() {
  const [devList, setDevList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [positionList, setPositionList] = useState([]);

  const wristItems = [
    { label: "左手", value: "LEFT" },
    { label: "右手", value: "RIGHT" },
  ];

  const getList = async () => {
    let rs = await list();
    setDevList(rs);
  };

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
    getList();
    getPositionList();
  }, []);

  const formikCreate = useFormik({
    initialValues: {
      devId: "",
      measurement: "",
      position: "",
      wrist: "LEFT",
      description: "",
    },
    validate: (data) => {
      let errors = {};

      if (!data.devId) {
        errors.devId = "设备id不能为空";
      }

      if (!data.measurement) {
        errors.measurement = "设备的端口不能为空";
      }

      if (!data.position) {
        errors.position = "清选择一个工位";
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
      } else {
        IMU_GLOBALS.toast.current.show({
          severity: "error",
          summary: "错误",
          detail: "设备添加失败。",
          life: 3000,
        });
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

  return (
    <Card className="m-2" title="设备管理">
      <Toolbar
        className="mb-4"
        left={
          <div>
            <Button
              className="p-button-sm"
              label="新建"
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
        emptyMessage="没有数据"
      >
        <Column header="ID" field="devId" sortable />
        <Column header="端口" field="measurement" sortable />
        <Column header="工位" field="position" sortable />
        <Column header="手腕" field="wrist" sortable />
        <Column header="创建日期" field="dtCreated" sortable />
        <Column header="更新日期" field="dtUpdated" sortable />

        <Column
          header="操作"
          body={(rowdata) => {
            return (
              <div className="">
                <Button
                  label="查看15分钟数据"
                  icon="pi pi-search"
                  className="p-button-rounded p-button-outlined p-button-sm mr-2"
                />
                <Button
                  label="更新"
                  icon="pi pi-file"
                  className="p-button-rounded p-button-outlined p-button-warning p-button-sm mr-2"
                />
                <Button
                  label="删除"
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-outlined p-button-danger p-button-sm"
                  onClick={async () => {
                    console.log("rowdata", rowdata);
                    confirmDialog({
                      message: "确认删除" + rowdata.devId,
                      header: "确认删除",
                      icon: "pi pi-exclamation-triangle",
                      acceptClassName: "p-button-danger",
                      accept: async () => {
                        let rs = await appFetch(`/imu/dev/del/${rowdata.id}`, {
                          method: "delete",
                        });
                        if (rs.status == 200) {
                          getList();
                        }
                      },
                      reject: () => {},
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
          <div className="field">
            <Dropdown
              name="position"
              value={formikCreate.values.position}
              options={positionList}
              onChange={formikCreate.handleChange}
              placeholder="请选择工位"
            />
            {getFormErrorMessage("position")}
          </div>
          <div className="field">
            <Dropdown
              name="wrist"
              value={formikCreate.values.wrist}
              options={wristItems}
              onChange={formikCreate.handleChange}
              placeholder="请选择手腕"
            />
            {getFormErrorMessage("wrist")}
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
      <ConfirmDialog />
    </Card>
  );
}
