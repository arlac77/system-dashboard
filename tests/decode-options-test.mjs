import test from "ava";
import { decodeOptions } from "../src/service-systemd-control.mjs";

function dot(t, options, expected) {
  t.deepEqual(decodeOptions(options), expected);
}

dot.title = (providedTitle = "", options, expected) =>
  `decode options ${providedTitle} '${options}'`.trim();

test(dot, undefined, {});
test(dot, " ", {});

test(dot, "high: 500.0M max: 1000.0M", { high: "500.0M", max: "1000.0M" });

test.skip(
  dot,
  "/usr/lib/systemd/system/hook-ci.service; enabled; vendor preset: disabled",
  {
    "/usr/lib/systemd/system/hook-ci.service": true,
    enabled: true,
    "vendor preset": "disabled"
  }
);
