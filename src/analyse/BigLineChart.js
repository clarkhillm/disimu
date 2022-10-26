import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
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
  ]);

  const chartRef = useRef();

  let myChart = null;

  let option = {
    tooltip: {
      trigger: "axis",
      position: function(pt) {
        return [pt[0], "10%"];
      },
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
        name: "加速度",
        type: "line",
        symbol: "none",
        sampling: "lttb",
        smooth: true,
        data: [],
      },
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
    option.series[0].data = props.data;

    option && myChart.setOption(option);
  }, [props.date]);

  return <div style={{ width: "100%", height: "400px" }} ref={chartRef} />;
}
