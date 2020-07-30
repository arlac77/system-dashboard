import test from "ava";
import { decodeUnitList } from "../src/service-systemd-control.mjs";

test("systemctl list-unit decode", t => {
  const raw = `auditd.service                             loaded    inactive dead    Security Auditing Service
avahi-daemon.service                       loaded    active   running Avahi mDNS/DNS-SD Stack
backup.service                             loaded    inactive dead    backup`;

  t.deepEqual(decodeUnitList(raw), [
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
