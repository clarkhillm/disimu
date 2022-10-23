import { Card } from "primereact/card";
import { TabPanel, TabView } from "primereact/tabview";
import React from "react";
export default function Home() {
  return (
    <div>
      <Card className="m-2">
        <TabView>
          <TabPanel header="首页"></TabPanel>
        </TabView>
      </Card>
    </div>
  );
}
