import moment from "moment";
import _ from "lodash";

export function calculate(ds, stop, stopCount) {
  let rs = { m: 0, s: 0 };

  let rest = [];
  let run = [];

  let rest_start = false;

  let rest_temp = [];
  let rest_index = 0;

  let rest_start_point = [];
  let rest_end_point = [];

  for (let i = 0; i < ds.length; i++) {
    let v = ds[i];
    if (Math.abs(v.left) >= stop || Math.abs(v.right) >= stop) {
      run.push(v);
      if (rest_temp.length >= stopCount) {
        rest = rest.concat(rest_temp);
        rest_start_point.push(rest_temp[0]);
        rest_end_point.push(v);
      } else {
        run = run.concat(rest_temp);
      }
      rest_start = false;
      rest_index = 0;
      rest_temp = [];
    } else {
      if (rest_temp.length == 0) {
        rest_start = true;
      } else if (rest_index > 0 && rest_index == i - 1) {
        rest_start = true;
      } else {
        run.push(v);
        rest_start = false;
        rest_index = 0;
        rest_temp = [];
      }
      if (rest_start) {
        rest_index = i;
        rest_temp.push(v);
      }
    }
  }

  let rest_time_pieces = [];

  for (let i = 0; i < rest_start_point.length; i++) {
    if (rest_end_point.length > i) {
      rest_time_pieces.push(
        moment(rest_end_point[i].time, "YYYY-MM-DD HH:mm:ss").diff(
          moment(rest_start_point[i].time, "YYYY-MM-DD HH:mm:ss"),
          "s"
        )
      );
    }
  }

  let rest_time = 0;
  if (rest_time_pieces.length > 0) {
    rest_time = _.reduce(
      rest_time_pieces,
      function (sum, n) {
        return sum + n;
      },
      0
    );
  }

  let timeTotal = moment(_.last(ds).time, "YYYY-MM-DD HH:mm:ss").diff(
    moment(_.first(ds).time, "YYYY-MM-DD HH:mm:ss"),
    "s"
  );

  // run = _.orderBy(run, (v) => {
  //   return moment(v.time, "YYYY-MM-DD HH:mm:ss").unix();
  // });

  // console.log("run", run);
  // console.log("rest", rest);

  // for (let i = 0; i < run.length - 1; i++) {
  //   let diff = moment(run[i + 1].time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
  //     moment(run[i].time, "YYYY-MM-DD HH:mm:ss SSSS")
  //   );
  //   console.log("diff", diff);
  // }

  // console.log("time total", timeTotal);
  rs.m = timeTotal - rest_time;
  rs.s = rest_time;

  return rs;
}
