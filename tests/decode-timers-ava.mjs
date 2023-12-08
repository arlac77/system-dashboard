import test from "ava";
import { readFileSync } from "node:fs";
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
      next: new Date("2020-08-12T22:00:00Z"),
      last: new Date("2020-08-11T22:00:03Z"),
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      next: new Date("2020-08-12T22:00:00Z"),
      last: new Date("2020-08-11T22:00:03Z"),
      unit: "man-db.timer",
      activates: "man-db.service"
    },
    {
      activates: "shadow.service",
      next: new Date("2020-08-12T22:00:00Z"),
      last: new Date("2020-08-11T22:00:03Z"),
      unit: "shadow.timer"
    },
    {
      activates: "spamassassin-update.service",
      next: new Date("2020-08-12T22:00:00Z"),
      last: new Date("2020-08-11T22:00:03Z"),
      unit: "spamassassin-update.timer"
    },
    {
      activates: "certbot-renewal.service",
      next: new Date("2020-08-12T23:46:00Z"),
      last: new Date("2020-08-11T23:45:27Z"),
      unit: "certbot-renewal.timer"
    },
    {
      activates: "systemd-tmpfiles-clean.service",
      next: new Date("2020-08-12T23:47:01Z"),
      last: new Date("2020-08-11T23:47:01Z"),
      unit: "systemd-tmpfiles-clean.timer"
    },
    {
      activates: "desec.service",
      next: new Date("2020-08-13T01:50:00Z"),
      last: new Date("2020-08-12T11:50:06Z"),
      unit: "desec.timer"
    },
    {
      activates: "dynv6.service",
      next: new Date("2020-08-13T02:00:00Z"),
      last: new Date("2020-08-12T02:00:10Z"),
      unit: "dynv6.timer"
    },
    {
      activates: "backup.service",
      next: new Date("2020-08-13T23:42:38Z"),
      last: new Date("2020-08-09T23:58:03Z"),
      unit: "backup.timer"
    },
    {
      activates: "paccache.service",
      next: new Date("2020-08-16T22:00:00Z"),
      last: new Date("2020-08-09T22:00:03Z"),
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
      next: new Date("2020-08-26T22:00:00Z"),
      last: new Date("2020-08-25T22:00:00Z"),
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      // Sun 2020-09-27 01:07:45 CEST 46min left    Sat 2020-09-26 01:05:31 CEST 23h ago       certbot-renewal.timer        certbot-renewal.service
      next: new Date("2020-09-26T23:07:45Z"),
      last: new Date("2020-09-25T23:05:31Z"),
      unit: "certbot-renewal.timer",
      activates: "certbot-renewal.service"
    }
  ]);
});
