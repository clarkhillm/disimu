import _ from "lodash";

const log = (title, value) => {
  console.log("algorithm.SimpleZero." + title, value);
};

export default function SimpleZero(dataSet, params) {
  //   console.log("dataSet:", dataSet);

  console.log(params);

  let cycle = { code: 0, dataSet: [], timeRange: [] };

  let watchSet = _.chunk(dataSet, 5);

  let start_check_flag = true;
  let end_check_flag = false;

  _.each(watchSet, (v, i) => {
    // console.log(v);
    let ct = 0;

    let leftSum = _.chain(v)
      .map((vi) => {
        return vi.left;
      })
      .sum()
      .value();

    let rightSum = _.chain(v)
      .map((vi) => {
        if (!vi.right) return 0;
        return vi.right;
      })
      .sum()
      .value();

    //console.log("s", leftSum, rightSum, v[0].time);

    if (
      start_check_flag &&
      i != ct &&
      (leftSum / 10 > params.pt || rightSum / 10 > params.pt)
    ) {
      console.log("start:", _.first(v).time);
      ct = i;
      start_check_flag = false;
      end_check_flag = true;
    }

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

    if (end_check_flag && i != ct) {
      if (leftSumSS / 10 < params.nt && rightSumSS / 10 < params.nt) {
        console.log("end:", _.last(v).time);
        ct = i;
        start_check_flag = true;
        end_check_flag = false;
      }
    }
  });
}
