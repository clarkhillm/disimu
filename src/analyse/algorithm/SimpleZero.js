import _ from "lodash";

/**
 * 算法根据加速度的峰值来决定周期划分
 * 
 * 任何一个手的正峰表示周期开始。
 * 
 * 正负峰之间表示工作阶段
 * 
 * 负峰之后表示休息阶段
 * 
 * 负峰之后的零表示停止状态，双手都停止认为周期结束。
 *  
 */

const log = (title, value) => {
  console.log("algorithm.SimpleZero." + title, value);
};

export default function SimpleZero(dataSet, params) {
  //   log("dataSet", dataSet);
  //   log("params", params);

  let ld = dataSet["LEFT"];
  let rd = dataSet["RIGHT"];

  ld = _.map(ld, (v) => {
    if (Math.abs(v.value) <= params.zeroFlag) {
      v.value = 0;
    }
    return v;
  });

  log("ld", ld);

  rd = _.map(rd, (v) => {
    if (Math.abs(v.value) <= params.zeroFlag) {
      v.value = 0;
    }
    return v;
  });

  log("rd", rd);

  //   let rld = _.zipWith(ld, rd, (l, r) => {
  //     if (l && r) {
  //       return l.value + r.value;
  //     } else {
  //       if (l) {
  //         return l;
  //       }
  //       if (r) {
  //         return r;
  //       }
  //     }
  //   });

  //   log("rld", rld);

  let rs = [];

  _.each(ld, (v) => {
    let cycle = [];
    if (v.value == 0) cycle.push(v);
  });
}
