import _ from "lodash";

export default function MoveAccount(dataSet, params) {
  console.log("--动作次数分析--", params);

  let watchSet = _.chunk(dataSet, 5);

  let moveAccountLeft = [];
  let stopAccountLeft = [];

  let moveAccountRight = [];
  let stopAccountRight = [];

  _.each(watchSet, (v, i) => {
    let leftSumSS = _.chain(v)
      .map((vi) => {
        return Math.abs(vi.left);
      })
      .sum()
      .value();

    let rightSumSS = _.chain(v)
      .map((vi) => {
        if (!vi.right) return 0;
        return Math.abs(vi.right);
      })
      .sum()
      .value();

    // console.log("-" + i + "-", leftSumSS / 5, rightSumSS / 5);

    if (leftSumSS / 5 < params.zeroAccount) {
      stopAccountLeft.push(v);
    } else {
      moveAccountLeft.push(v);
    }

    if (rightSumSS / 5 < params.zeroAccount) {
      stopAccountRight.push(v);
    } else {
      moveAccountRight.push(v);
    }
  });

  //   console.log("lm", moveAccountLeft);
  //   console.log("ls", stopAccountLeft);
  //   console.log("rm", moveAccountRight);
  //   console.log("rs", stopAccountRight);

  return {
    lm: moveAccountLeft,
    ls: stopAccountLeft,
    rm: moveAccountRight,
    rs: stopAccountRight,
  };
}
