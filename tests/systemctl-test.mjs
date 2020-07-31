import test from "ava";
import {
  decodeUnits,
  decodeSockets,
  decodeTimers,
  decodeMachines
} from "../src/service-systemd-control.mjs";

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

test("systemctl decode timers", t => {
  const raw = `Fri 2020-07-31 00:00:00 CEST 2min 7s left  Thu 2020-07-30 00:00:00 CEST 23h ago    logrotate.timer              logrotate.service             
Fri 2020-07-31 00:00:00 CEST 2min 7s left  Thu 2020-07-30 00:00:00 CEST 23h ago    man-db.timer                 man-db.service  `;

  t.deepEqual(decodeTimers(raw), [
    {
      next: "Fri 2020-07-31 00:00:00 CEST",
      left: "2min 7s left",
      last: "Thu 2020-07-30 00:00:00 CEST",
      passed: "23h ago",
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      next: "Fri 2020-07-31 00:00:00 CEST",
      left: "2min 7s left",
      last: "Thu 2020-07-30 00:00:00 CEST",
      passed: "23h ago",
      unit: "man-db.timer",
      activates: "man-db.service"
    }
  ]);
});

test("systemctl decode machines", t => {
  const raw = `pine1 (host) degraded 2      0   `;
  t.deepEqual(decodeMachines(raw), [
    { name: "pine1", state: "degraded", failed: 2, jobs: 0 }
  ]);
});

test("systemctl decode sockets", t => {
  const raw = `/run/avahi-daemon/socket                       avahi-daemon.socket                  avahi-daemon.service                 
/run/dbus/system_bus_socket                    dbus.socket                          dbus.service                         
[::]:19531                                     systemd-journal-gatewayd.socket      systemd-journal-gatewayd.service     
route 1361                                     systemd-networkd.socket              systemd-networkd.service             `;
  t.deepEqual(decodeSockets(raw), [
    {
      listen: "/run/avahi-daemon/socket",
      units: "avahi-daemon.socket",
      activates: "avahi-daemon.service"
    },
    {
      listen: "/run/dbus/system_bus_socket",
      units: "dbus.socket",
      activates: "dbus.service"
    },
    {
      listen: "[::]:19531",
      units: "systemd-journal-gatewayd.socket",
      activates: "systemd-journal-gatewayd.service"
    },
    {
      listen: "route 1361",
      units: "systemd-networkd.socket",
      activates: "systemd-networkd.service"
    }
  ]);
});
