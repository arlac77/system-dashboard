import test from "ava";
import { decodeDateSpanUntil } from "../src/util.mjs";

test("decode date", t => {
  t.is(
    decodeDateSpanUntil("Thu 2020-08-13 00:00:00 CEST 12h ago", "ago").toString(),
    "Thu Aug 13 2020 00:00:00 GMT+0200 (Central European Summer Time)"
  );
});
