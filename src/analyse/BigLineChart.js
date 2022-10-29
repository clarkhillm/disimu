import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import React, { useEffect, useRef } from "react";

export default function BigLineChart(props) {
  echarts.use([
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
    LineChart,
    CanvasRenderer,
    UniversalTransition,
    LegendComponent,
  ]);

  const chartRef = useRef();

  let myChart = null;

  let option = {
    grid: {
      x: 25,
      x2: 25,
    },
    title: {
      text: "加速度",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },

    legend: {
      data: ["左手", "右手"],
      left: 10,
    },

    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, "10%"],
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 10,
      },
      {
        start: 0,
        end: 10,
      },
    ],
    series: [
      {
        name: "左手",
        type: "line",
        //symbol: "none",
        sampling: "lttb",
        data: [],
      },
      {
        name: "右手",
        type: "line",
        //symbol: "none",
        sampling: "lttb",
        data: [],
      },
      ,
    ],
  };

  useEffect(() => {
    const chart = echarts.getInstanceByDom(chartRef.current);
    if (chart) {
      myChart = chart;
    } else {
      myChart = echarts.init(chartRef.current);
    }

    option.xAxis.data = props.date;
    option.series[0].data = props.data[0];
    option.series[1].data = props.data[1];

    option && myChart.setOption(option);
  }, [props.date]);

  return <div style={{ width: "100%", height: "400px" }} ref={chartRef} />;
}
