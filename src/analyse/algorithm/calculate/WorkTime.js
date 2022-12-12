export function calculate(ds, stop, stopCount) {
  let rs = { m: 0, s: 0 };

  let rest = [];
  let run = [];

  let rest_start = false;

  let rest_temp = [];
  let rest_index = 0;

  for (let i = 0; i < ds.length; i++) {
    let v = ds[i];
    if (Math.abs(v.left) >= stop || Math.abs(v.right) >= stop) {
      run.push(v);
      if (rest_temp.length >= stopCount) {
        rest = rest.concat(rest_temp);
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

  console.log("run", run);
  console.log("rest", rest);

  rs.m = run.length;
  rs.s = ds.length - run.length;

  return rs;
}
