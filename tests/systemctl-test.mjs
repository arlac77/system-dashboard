import test from "ava";
import {
  decodeSockets,
  decodeTimers,
  decodeMachines,
  decodeFiles
} from "../src/service-systemd-control.mjs";

test("systemctl decode timers", t => {
  const raw = `Sat 2020-08-01 00:00:00 CEST 4h 12min left Fri 2020-07-31 00:00:21 CEST 19h ago      logrotate.timer              logrotate.service             
Sat 2020-08-01 00:00:00 CEST 4h 12min left Fri 2020-07-31 00:00:21 CEST 19h ago      man-db.timer                 man-db.service                `;

  t.deepEqual(decodeTimers(raw), [
    {
      next: "Sat 2020-08-01 00:00:00 CEST",
      left: "4h 12min left",
      last: "Fri 2020-07-31 00:00:21 CEST",
      passed: "19h ago",
      unit: "logrotate.timer",
      activates: "logrotate.service"
    },
    {
      next: "Sat 2020-08-01 00:00:00 CEST",
      left: "4h 12min left",
      last: "Fri 2020-07-31 00:00:21 CEST",
      passed: "19h ago",
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
      units: ["avahi-daemon.socket"],
      activates: "avahi-daemon.service"
    },
    {
      listen: "/run/dbus/system_bus_socket",
      units: ["dbus.socket"],
      activates: "dbus.service"
    },
    {
      listen: "[::]:19531",
      units: ["systemd-journal-gatewayd.socket"],
      activates: "systemd-journal-gatewayd.service"
    },
    {
      listen: "route 1361",
      units: ["systemd-networkd.socket"],
      activates: "systemd-networkd.service"
    }
  ]);
});

test("systemctl decode files", t => {
  const raw = `# /file1
line 1
line 2
# /file2
line a`;

  t.deepEqual(decodeFiles(raw), {
    "/file1": ["line 1", "line 2"],
    "/file2": ["line a"]
  });
});
