export const list = async () => {
  let rs = await fetch("/imu/dev/list", { method: "GET" });
  console.log("list", rs);
  if (rs.status == 200) {
    return await rs.json();
  }
};
