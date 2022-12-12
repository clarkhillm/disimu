import moment from "moment";

export function calculateHall(ds) {
  //找到所有的cycle第一个数据。
  let _cycleSet = _.filter(ds, (data) => {
    return data.cycle > 10;
  });
  console.log("cycle set", _cycleSet);

  if (_cycleSet.length == 0) {
    return [];
  }

  let stander = _cycleSet[0];
  let rs0 = [];
  let xxx = [];
  _.each(_cycleSet, (v) => {
    let diff = moment(v.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
      moment(stander.time, "YYYY-MM-DD HH:mm:ss SSSS")
    );
    console.log(diff);
    if (diff < 2000) {
      xxx.push(v);
    } else {
      rs0.push(xxx);
      stander = v;
      xxx = [v];
    }
  });

  rs0.push(xxx);

  console.log(rs0);

  let cyclePointSet = [];
  _.each(rs0, (v) => {
    cyclePointSet.push(_.first(v));
  });

  let pointIndex = 0;

  let rs = [];
  let cycleData = [];
  _.each(_.cloneDeep(ds), (data) => {
    if (pointIndex + 1 < cyclePointSet.length) {
      let diff0 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(cyclePointSet[pointIndex].time, "YYYY-MM-DD HH:mm:ss SSSS")
      );
      let diff1 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
        moment(cyclePointSet[pointIndex + 1].time, "YYYY-MM-DD HH:mm:ss SSSS")
      );
      // console.log(diff0, diff1);
      if (diff0 < 0) {
        data.cycle = undefined;
        rs.push(data);
      }
      if (diff0 == 0) {
        cycleData.push(rs);
        rs = [];
      }
      if (diff0 > 0 && diff1 < 0) {
        data.cycle = undefined;
        rs.push(data);
      }
      if (diff1 == 0) {
        cycleData.push(rs);
        rs = [];
        pointIndex += 1;
      }
    }
  });

  rs = [];
  _.each(_.cloneDeep(ds), (data) => {
    let diff0 = moment(data.time, "YYYY-MM-DD HH:mm:ss SSSS").diff(
      moment(_.last(cyclePointSet).time, "YYYY-MM-DD HH:mm:ss SSSS")
    );
    if (diff0 >= 0) {
      data.cycle = undefined;
      rs.push(data);
    }
  });

  cycleData.push(rs);

  let result = _.map(cycleData, (v, i) => {
    return {
      code: i + 1,
      dataSet: v,
      TimeRanges: [_.first(v).time, _.last(v).time],
    };
  });

  result = _.initial(result);
  result = _.tail(result);

  _.each(result, (v, i) => {
    v.code = i + 1;
  });

  return result;
}
