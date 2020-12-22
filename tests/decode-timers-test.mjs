import test from "ava";
import { readFileSync } from "fs";
import { decodeTimers } from "../src/service-systemd-control.mjs";

test("systemctl decode timers 1", t => {
  const raw = readFileSync(
    new URL("fixtures/list-timers-1", import.meta.url).pathname,
    {
      encoding: "utf8"
    }
  );

  const timers = decodeTimers(raw);
  t.deepEqual(timers, [
    {
      next: new Date("2020-08-12 22:00:00 GMT+2"),
      last: new Date("2020-08-11 22:00:03 GMT+2"),
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      next: new Date("2020-08-12 22:00:00 GMT+2"),
      last: new Date("2020-08-11 22:00:03 GMT+2"),
      unit: "man-db.timer",
      activates: "man-db.service"
    },
    {
      activates: "shadow.service",
      last: new Date("2020-08-11 22:00:03 GMT+2"),
      next: new Date("2020-08-12 22:00:00 GMT+2"),
      unit: "shadow.timer"
    },
    {
      activates: "spamassassin-update.service",
      last: new Date("2020-08-11 22:00:03 GMT+2"),
      next: new Date("2020-08-12 22:00:00 GMT+2"),
      unit: "spamassassin-update.timer"
    },
    {
      activates: "certbot-renewal.service",
      last: new Date("2020-08-11 23:45:27 GMT+2"),
      next: new Date("2020-08-12 23:46:00 GMT+2"),
      unit: "certbot-renewal.timer"
    },
    {
      activates: "systemd-tmpfiles-clean.service",
      last: new Date("2020-08-11 23:47:01 GMT+2"),
      next: new Date("2020-08-12 23:47:01 GMT+2"),
      unit: "systemd-tmpfiles-clean.timer"
    },
    {
      activates: "desec.service",
      last: new Date("2020-08-12 11:50:06 GMT+2"),
      next: new Date("2020-08-13 01:50:00 GMT+2"),
      unit: "desec.timer"
    },
    {
      activates: "dynv6.service",
      last: new Date("2020-08-12 02:00:10 GMT+2"),
      next: new Date("2020-08-13 02:00:00 GMT+2"),
      unit: "dynv6.timer"
    },
    {
      activates: "backup.service",
      last: new Date("2020-08-09 23:58:03 GMT+2"),
      next: new Date("2020-08-13 23:42:38 GMT+2"),
      unit: "backup.timer"
    },
    {
      activates: "paccache.service",
      last: new Date("2020-08-09 22:00:03 GMT+2"),
      next: new Date("2020-08-16 22:00:00 GMT+2"),
      unit: "paccache.timer"
    }
  ]);
});

test("systemctl decode timers 2", t => {
  const raw = readFileSync(
    new URL("fixtures/list-timers-2", import.meta.url).pathname,
    {
      encoding: "utf8"
    }
  );

  const timers = decodeTimers(raw);
  t.deepEqual(timers, [
    {
      // Thu 2020-08-27 00:00:00 CEST 9h left        Wed 2020-08-26 00:00:00 CEST 14h ago    logrotate.timer              logrotate.service
      next: new Date("2020-08-26 22:00:00 GMT+2"),
      last: new Date("2020-08-25 22:00:00 GMT+2"),
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      // Sun 2020-09-27 01:07:45 CEST 46min left    Sat 2020-09-26 01:05:31 CEST 23h ago       certbot-renewal.timer        certbot-renewal.service
      next: new Date("2020-09-26 23:07:45 GMT+2"),
      last: new Date("2020-09-25 23:05:31 GMT+2"),
      unit: "certbot-renewal.timer",
      activates: "certbot-renewal.service"
    }
  ]);
});
