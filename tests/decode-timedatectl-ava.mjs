import test from "ava";
import { readFileSync } from "node:fs";
import { decodeTimedate } from "../src/service-timedate-control.mjs";

test("timedatectl decode", t => {
  const raw = readFileSync(
    new URL("fixtures/timedatectl-status", import.meta.url).pathname,
    {
      encoding: "utf8"
    }
  );

  const properties = decodeTimedate(raw);
  t.deepEqual(properties, {
    "Local time": "Fri 2025-12-12 18:25:17 WET",
    "Universal time": "Fri 2025-12-12 18:25:17 UTC",
    "RTC time": "Fri 2025-12-12 18:25:17",
    "Time zone": "Europe/Lisbon (WET, +0000)",
    "System clock synchronized": "yes",
    "NTP service": "active",
    "RTC in local TZ": "no"
  });
});
