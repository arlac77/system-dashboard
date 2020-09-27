import test from "ava";
import { decodeDate } from "../src/util.mjs";

test("decode date", t => {
  const line =
    "Thu 2020-08-13 00:00:00 CEST 3h 25min left Wed 2020-08-12 00:00:03 CEST 20h ago    logrotate.timer              logrotate.service";

  t.is(
    decodeDate(line).toString(),
    "Thu Aug 13 2020 00:00:00 GMT+0200 (Central European Summer Time)"
  );

  t.is(
    decodeDate(line.substring(line.indexOf("left") + 5)).toString(),
    "Wed Aug 12 2020 00:00:03 GMT+0200 (Central European Summer Time)"
  );

  t.deepEqual(line.substring(line.indexOf("ago") + 4).trim().split(/\s+/), [
    "logrotate.timer",
    "logrotate.service"
  ]);
});
