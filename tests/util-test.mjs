import test from "ava";
import { decodeDate } from "../src/util.mjs";

test("decode date", t => {
  const line =
    "Thu 2020-08-13 00:00:00 CEST 3h 25min left Wed 2020-08-12 00:00:03 CEST 20h ago    logrotate.timer              logrotate.service";

  t.deepEqual(decodeDate(line), new Date("Wed Aug 12 2020 22:00:00 GMT+0200"));

  t.deepEqual(
    decodeDate(line.substring(line.indexOf("left") + 5)),
    new Date("Tue Aug 11 2020 22:00:03 GMT+0200")
  );

  t.deepEqual(
    line
      .substring(line.indexOf("ago") + 4)
      .trim()
      .split(/\s+/),
    ["logrotate.timer", "logrotate.service"]
  );
});
