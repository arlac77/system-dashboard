import { Service } from "@kronos-integration/service";
import execa from "execa";

async function systemctl(cmd, params) {
  const p = await execa("systemctl", [cmd, params.unit], { all: true });
  return p.all;
}

export function decodeUnits(data) {
  // auditd.service                             loaded    inactive dead    Security Auditing Service
  // avahi-daemon.service                       loaded    active   running Avahi mDNS/DNS-SD Stack
  // backup.service                             loaded    inactive dead    backup

  return data.split(/\n/).map(line => {
    const [unit, load, active, sub, ...description] = line.split(/\s+/);
    return {
      unit,
      load,
      active,
      sub,
      description: description.join(" ")
    };
  });
}

export function decodeTimers(data) {
  /*
NEXT                         LEFT          LAST                         PASSED       UNIT                         ACTIVATES                     
Sat 2020-08-01 00:00:00 CEST 4h 12min left Fri 2020-07-31 00:00:21 CEST 19h ago      logrotate.timer              logrotate.service             
Sat 2020-08-01 00:00:00 CEST 4h 12min left Fri 2020-07-31 00:00:21 CEST 19h ago      man-db.timer                 man-db.service                
  */
  return data.split(/\n/).map(line => {
    return {
      next: line.substr(0, 28),
      left: line.substr(29, 14).trim(),
      last: line.substr(43, 28),
      passed: line.substr(72, 11).trim(),
      unit: line.substr(85).split(/\s+/)[0],
      activates: line.substr(85).split(/\s+/)[1]
    };
  });
}

export function decodeSockets(data) {
  /*
LISTEN                                         UNITS                                ACTIVATES
/run/avahi-daemon/socket                       avahi-daemon.socket                  avahi-daemon.service                 
/run/dbus/system_bus_socket                    dbus.socket                          dbus.service                         
/run/udev/control                              systemd-udevd-control.socket         systemd-udevd.service                
[::]:19531                                     systemd-journal-gatewayd.socket      systemd-journal-gatewayd.service     
audit 1                                        systemd-journald-audit.socket        systemd-journald.service             
kobject-uevent 1                               systemd-udevd-kernel.socket          systemd-udevd.service                
route 1361                                     systemd-networkd.socket              systemd-networkd.service             
*/
  return data.split(/\n/).map(line => {
    const last = line.substr(47).split(/\s+/);
    return {
      listen: line.substring(0, 47).trim(),
      units: [last[0]],
      activates: last[1]
    };
  });
}

export function decodeMachines(data) {
  /*
  NAME         STATE    FAILED JOBS
* pine1 (host) degraded 2      0   
*/

  return data.split(/\n/).map(line => {
    const [name, type, state, failed, jobs] = line.split(/\s+/);
    return {
      name,
      state,
      failed: parseInt(failed),
      jobs: parseInt(jobs)
    };
  });
}

export function decodeUnit(data) {
  /*
* hook-ci.service - simple ci to be triggered by git hooks
     Loaded: loaded (/usr/lib/systemd/system/hook-ci.service; enabled; vendor preset: disabled)
    Drop-In: /etc/systemd/system/hook-ci.service.d
             `-env.conf
     Active: active (running) since Thu 2020-07-30 20:47:21 CEST; 17h ago
TriggeredBy: * hook-ci.socket
   Main PID: 22036 (node)
     Memory: 403.8M (high: 500.0M max: 1000.0M)
     CGroup: /system.slice/hook-ci.service
             `-22036 hook-ci
*/

  const unit = {};

  data.split(/\n/).forEach(line => {
    let m = line.match(/^\s*([\w\-\s]+):\s+(.+)/);
    if (m) {
      const value = m[2];
      switch (m[1]) {
        case "Loaded":
          unit.load = value.split(/\s/)[0];
          break;
          case "Memory":
            m = value.match(/([\d\.]+)(\w+)(\s+\([^\)]+\))?/);
            if (m) {
              unit.memory = parseFloat(m[1]);
              switch(m[2]) {
                case 'K': unit.memory *=  1024;
                break;
                case 'M': unit.memory *=  1024 * 1024;
                break;
                case 'G': unit.memory *=  1024 * 1024 * 1024;
                break;
              }
            }
            break;
          case "Tasks":
          m = value.match(/(\w+)\s+\(limit: (\w+)\)/);
          if (m) {
            unit.tasks = parseInt(m[1]);
            unit.taskLimit = parseInt(m[2]);
          }
          break;
        case "Active":
          m = value.match(/(\w+)\s+\((\w+)\)\s+\w+\s+([^;]+);\s+(.*)/);
          if (m) {
            unit.active = m[1];
            unit.sub = m[2];
            unit.since = m[3];
            unit.passed = m[4];
          }
          break;
        case "Main PID":
          unit.mainPid = parseInt(value.split(/\s/)[0]);
          break;
        case "TriggeredBy":
          unit.triggeredBy = value.split(/\s/)[1];
          break;
        default:
          unit[m[1]] = value;
      }
    } else {
      m = line.match(/^\*?\s+([\w\.\-]+)\s+-\s+(.*)/);
      if (m) {
        unit.unit = m[1];
        unit.description = m[2];
      }
    }
  });

  return unit;
}

export class ServiceSystemdControl extends Service {
  /**
   * @return {string} 'systemctl'
   */
  static get name() {
    return "systemctl";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      unit: {
        default: true,
        receive: async params => {
          const p = await execa(
            "systemctl",
            ["status", params.unit, "--full", "--all", "--lines", "0"],
            { reject: false }
          );
          return decodeUnit(p.stdout);
        }
      },
      units: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", [
            "list-units",
            "-t",
            "service",
            "--full",
            "--all",
            "--plain",
            "--no-legend"
          ]);
          return decodeUnits(p.stdout);
        }
      },
      timers: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", [
            "list-timers",
            "--full",
            "--all",
            "--plain",
            "--no-legend"
          ]);
          return decodeTimers(p.stdout);
        }
      },
      sockets: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", [
            "list-sockets",
            "--full",
            "--all",
            "--plain",
            "--no-legend"
          ]);
          return decodeSockets(p.stdout);
        }
      },
      machines: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", [
            "list-machines",
            "--full",
            "--all",
            "--plain",
            "--no-legend"
          ]);
          return decodeMachines(p.stdout);
        }
      },
      start: {
        default: true,
        receive: async params => systemctl("start", params)
      },
      stop: {
        default: true,
        receive: async params => systemctl("stop", params)
      },
      restart: {
        default: true,
        receive: async params => systemctl("restart", params)
      },
      reload: {
        default: true,
        receive: async params => systemctl("reload", params)
      }
    };
  }

  /*
  router.addRoute("GET", "/fail2ban/status", restricted, async (ctx, next) => {
    const p = await execa("fail2ban-client", ["status"], { all: true });
    ctx.body = p.all;
    return next();
  });
  router.addRoute("GET", "/dbus/list", restricted, async (ctx, next) => {
    ctx.body = await list();
    return next();
  });
  */
}

export default ServiceSystemdControl;
