import test from "ava";
import { decodeUnits, decodeSockets, decodeTimers } from "../src/service-systemd-control.mjs";

test("systemctl decode units", t => {
  const raw = `auditd.service                             loaded    inactive dead    Security Auditing Service
avahi-daemon.service                       loaded    active   running Avahi mDNS/DNS-SD Stack
backup.service                             loaded    inactive dead    backup`;

  t.deepEqual(decodeUnits(raw), [
    {
      unit: "auditd.service",
      load: "loaded",
      active: "inactive",
      sub: "dead",
      description: "Security Auditing Service"
    },
    {
      unit: "avahi-daemon.service",
      load: "loaded",
      active: "active",
      sub: "running",
      description: "Avahi mDNS/DNS-SD Stack"
    },
    {
      unit: "backup.service",
      load: "loaded",
      active: "inactive",
      sub: "dead",
      description: "backup"
    }
  ]);
});

test.skip("systemctl decode timers", t => {
  const raw = `Fri 2020-07-31 00:00:00 CEST 2min 7s left  Thu 2020-07-30 00:00:00 CEST 23h ago    logrotate.timer              logrotate.service             
Fri 2020-07-31 00:00:00 CEST 2min 7s left  Thu 2020-07-30 00:00:00 CEST 23h ago    man-db.timer                 man-db.service  `;

  t.deepEqual(decodeTimers(raw), [{},{}]);
});
