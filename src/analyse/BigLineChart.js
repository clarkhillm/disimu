import * as echarts from "echarts";
import _ from "lodash";
import React, { useEffect, useRef } from "react";

export default function BigLineChart(props) {
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
    },
    yAxis: {},
    dataZoom: [
      {
        type: "inside",
        start: 90,
        end: 100,
        
      },
      {
        start: 90,
        end: 100,
      },
    ],
    dataset: {
      dimensions: ["time", "left", "right", "cycle"],
      source: [],
    },
    series: [
      {
        type: "line",
        //symbol: "none",
        sampling: "lttb",
      },
      {
        type: "line",
        //symbol: "none",
        sampling: "lttb",
      },
      {
        type: "line",
        //symbol: "none",
        sampling: "lttb",
      },
      ,
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

    option.dataset.source = props.dataSource;

    option && myChart.setOption(option);
  }, [props.dataSource]);

  return <div style={{ width: "100%", height: "400px" }} ref={chartRef} />;
}
