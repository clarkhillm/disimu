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

export default function Line() {
  const [list, setList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const getList = async () => {
    let rs = await appFetch("/imu/line/list", { method: "GET" });
    if (rs.status == 200) {
      setList(await rs.json());
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const formikCreate = useFormik({
    initialValues: {
      name: "",
      code: "",
    },
    validate: (data) => {
      let errors = {};

      if (!data.name) {
        errors.name = "名称不能为空";
      }

      if (!data.code) {
        errors.name = "编号不能为空";
      }

      return errors;
    },
    onSubmit: async (data) => {
      console.log("on submit create ...", data);
      setShowCreate(false);
      let rs = await appFetch("/imu/line", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (rs.status == 200) {
        IMU_GLOBALS.toast.current.show({
          severity: "info",
          summary: "信息",
          detail: "添加成功。",
          life: 3000,
        });
        getList();
      } else {
        IMU_GLOBALS.toast.current.show({
          severity: "error",
          summary: "错误",
          detail: "添加失败。",
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
    <div>
      <Card className="m-2" title="生产线管理">
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
          value={list}
          dataKey="id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate=" 显示{first}到{last}条  共{totalRecords}条"
          responsiveLayout="scroll"
          emptyMessage="没有数据"
        >
          <Column header="名称" field="name" sortable />
          <Column header="编号" field="code" sortable />
          <Column header="创建日期" field="dtCreated" sortable />
          <Column header="更新日期" field="dtUpdated" sortable />
          <Column
            header="操作"
            body={(rowdata) => {
              return (
                <div>
                  <Button
                    label="删除"
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-outlined p-button-danger p-button-sm"
                    onClick={async () => {
                      console.log("rowdata", rowdata);
                      confirmDialog({
                        message: "确认删除：" + rowdata.code,
                        header: "确认删除",
                        icon: "pi pi-exclamation-triangle",
                        acceptClassName: "p-button-danger",
                        accept: async () => {
                          let rs = await appFetch(
                            `/imu/line/del/${rowdata.id}`,
                            {
                              method: "delete",
                            }
                          );
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
      </Card>
      <Dialog
        header="新建生产线"
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
              name="name"
              value={formikCreate.values.name}
              placeholder="名称"
              onChange={formikCreate.handleChange}
            />
            {getFormErrorMessage("name")}
          </div>
          <div className="field">
            <InputText
              name="code"
              value={formikCreate.values.code}
              placeholder="编号"
              onChange={formikCreate.handleChange}
            />
            {getFormErrorMessage("code")}
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
    </div>
  );
}
