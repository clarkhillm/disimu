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
        start: 0,
        end: 10,
      },
      {
        start: 0,
        end: 10,
      },
    ],
    dataset: {
      dimensions: ["time", "left", "right"],
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

    // console.log(props.dataSource);

    option.dataset.source = props.dataSource;

    option && myChart.setOption(option);
  }, [props.dataSource]);

  return <div style={{ width: "100%", height: "400px" }} ref={chartRef} />;
}
