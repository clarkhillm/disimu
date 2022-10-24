import _ from "lodash";

export function hexTransform(i) {
  let two = parseInt(i, 16).toString(2);
  let bitNum = i.length * 4;
  if (two.length < bitNum) {
    while (two.length < bitNum) {
      two = "0" + two;
    }
  }

  if (two.substring(0, 1) == "0") {
    two = parseInt(two, 2);

    return two;
  } else {
    let two_unsign = "";
    two = parseInt(two, 2) - 1;
    two = two.toString(2);
    two_unsign = two.substring(1, bitNum);
    two_unsign = two_unsign.replace(/0/g, "z");
    two_unsign = two_unsign.replace(/1/g, "0");
    two_unsign = two_unsign.replace(/z/g, "1");
    two = parseInt(-two_unsign, 2);

    return two;
  }
}

export async function appFetch(url, options) {
  let response = await fetch(
    url,
    _.assign(
      {
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "RFID-USER-TOKEN": sessionStorage.getItem("token"),
        },
      },
      options
    )
  );
  return response;
}
