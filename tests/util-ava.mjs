import test from "ava";
import { decodeDate } from "../src/util.mjs";

test("decode date", t => {
  const line =
    "Thu 2020-08-13 00:00:00 CEST 3h 25min left Wed 2020-08-12 00:00:03 CEST 20h ago";

  t.deepEqual(decodeDate(line), new Date("2020-08-12T22:00:00Z"));

  t.deepEqual(
    decodeDate(line.substring(line.indexOf("left") + 5)),
    new Date("2020-08-11T22:00:03Z")
  );
});
