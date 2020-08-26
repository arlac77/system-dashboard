import test from "ava";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { decodeTimers } from "../src/service-systemd-control.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test("systemctl decode timers 1", t => {
  const raw = readFileSync(join(here, "fixtures", "list-timers-1"), {
    encoding: "utf8"
  });

  const timers = decodeTimers(raw);
  t.deepEqual(timers, [
    {
      next: "Thu 2020-08-13 00:00:00 CEST",
      left: "3h 25min left",
      last: "Wed 2020-08-12 00:00:03 CEST",
      passed: "20h ago",
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      next: "Thu 2020-08-13 00:00:00 CEST",
      left: "3h 25min left",
      last: "Wed 2020-08-12 00:00:03 CEST",
      passed: "20h ago",
      unit: "man-db.timer",
      activates: "man-db.service"
    },
    {
      activates: "shadow.service",
      last: "Wed 2020-08-12 00:00:03 CEST",
      left: "3h 25min left",
      next: "Thu 2020-08-13 00:00:00 CEST",
      passed: "20h ago",
      unit: "shadow.timer"
    },
    {
      activates: "spamassassin-update.service",
      last: "Wed 2020-08-12 00:00:03 CEST",
      left: "3h 25min left",
      next: "Thu 2020-08-13 00:00:00 CEST",
      passed: "20h ago",
      unit: "spamassassin-update.timer"
    },
    {
      activates: "certbot-renewal.service",
      last: "Wed 2020-08-12 01:45:27 CEST",
      left: "5h 11min left",
      next: "Thu 2020-08-13 01:46:00 CEST",
      passed: "18h ago",
      unit: "certbot-renewal.timer"
    },
    {
      activates: "systemd-tmpfiles-clean.service",
      last: "Wed 2020-08-12 01:47:01 CEST",
      left: "5h 13min left",
      next: "Thu 2020-08-13 01:47:01 CEST",
      passed: "18h ago",
      unit: "systemd-tmpfiles-clean.timer"
    },
    {
      activates: "desec.service",
      last: "Wed 2020-08-12 13:50:06 CEST",
      left: "7h left",
      next: "Thu 2020-08-13 03:50:00 CEST",
      passed: "6h ago",
      unit: "desec.timer"
    },
    {
      activates: "dynv6.service",
      last: "Wed 2020-08-12 04:00:10 CEST",
      left: "7h left",
      next: "Thu 2020-08-13 04:00:00 CEST",
      passed: "16h ago",
      unit: "dynv6.timer"
    },
    {
      activates: "backup.service",
      last: "Mon 2020-08-10 01:58:03 CEST",
      left: "1 day 5h left",
      next: "Fri 2020-08-14 01:42:38 CEST",
      passed: "2 days ago",
      unit: "backup.timer"
    },
    {
      activates: "paccache.service",
      last: "Mon 2020-08-10 00:00:03 CEST",
      left: "4 days left",
      next: "Mon 2020-08-17 00:00:00 CEST",
      passed: "2 days ago",
      unit: "paccache.timer"
    }
  ]);
});

test("systemctl decode timers 2", t => {
  const raw = readFileSync(join(here, "fixtures", "list-timers-2"), {
    encoding: "utf8"
  });

  const timers = decodeTimers(raw);
  t.deepEqual(timers[0], {
    next: "Thu 2020-08-27 00:00:00 CEST",
    left: "9h left",
    last: "Wed 2020-08-26 00:00:00 CEST",
    passed: "14h ago",
    unit: "logrotate.timer",
    activates: "logrotate.service"
  });
});
