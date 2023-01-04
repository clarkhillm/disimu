import { Card } from "primereact/card";
import React, { useEffect } from "react";
import { washData } from "./analyse/algorithm/calculate/WorkTime";
export default function Home() {
  useEffect(() => {
    let test = [
      { left: 0 },
      { left: 0 },
      { left: 5 },
      { left: 5 },
      { left: 5 },
      { left: 5 },
      { left: 5 },
      { left: 5 },
      { left: 0 },
      { left: 0 },
      { left: 0 },
      { left: 0 },
      { left: 0 },
    ];
    washData(test, 3);
    console.log(test);
  }, []);
  return (
    <div>
      <Card className="m-2" title="首页">
        暂无数据
      </Card>
    </div>
  );
}
