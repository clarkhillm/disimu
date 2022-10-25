import { Card } from "primereact/card";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";

export default function DevPair() {
  let [showCreate, setShowCreate] = useState(false);

  const getList = async () => {};
  useEffect(() => {}, []);
  return (
    <Card className="m-2" title="设备组管理">
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
      />
    </Card>
  );
}
