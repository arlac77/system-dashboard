import test from "ava";
import {
  decodeSockets,
  decodeMachines,
  decodeFiles
} from "../src/service-systemd-control.mjs";

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
