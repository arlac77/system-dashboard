import { Service } from "@kronos-integration/service";
import { execa } from "execa";
import {
  decodeDate,
  hex2char,
  parseBoolean,
  parseBytes
} from "../src/util.mjs";

async function systemctl(cmd, params) {
  const p = await execa("systemctl", [cmd, params.unit], { all: true });
  return p.all;
}

export function decodeUnits(data) {
  // auditd.service                             loaded    inactive dead    Security Auditing Service
  // avahi-daemon.service                       loaded    active   running Avahi mDNS/DNS-SD Stack
  // backup.service                             loaded    inactive dead    backup

  return hex2char(data)
    .split(/\n/)
    .map(line => {
      const [unit, load, active, sub, ...description] = line.split(/\s+/);
      return {
        unit,
        load,
        active,
        sub,
        description: description.join(" ").trim()
      };
    });
}

/*
Thu 2020-08-13 00:00:00 CEST 3h 25min left Wed 2020-08-12 00:00:03 CEST 20h ago    logrotate.timer              logrotate.service             
Thu 2020-08-27 00:00:00 CEST 9h left        Wed 2020-08-26 00:00:00 CEST 14h ago    logrotate.timer              logrotate.service             
*/
export function decodeTimers(data) {
  return hex2char(data)
    .split(/\n/)
    .map(line => {
      const suffix = line
        .substring(line.indexOf("ago") + 4)
        .trim()
        .split(/\s+/);

      return {
        next: decodeDate(line),
        last: decodeDate(line.substring(line.indexOf("left") + 5)),
        unit: suffix[0],
        activates: suffix[1]
      };
    })
    .filter(e => e.unit);
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
    switch (line[0]) {
      case "/":
      case "[": {
        const [listen, unit, activates] = line.split(/\s+/);
        return {
          listen,
          units: [unit],
          activates
        };
      }
      default: {
        const [listen, extra, unit, activates] = line.split(/\s+/);
        return {
          listen: listen + " " + extra,
          units: [unit],
          activates
        };
      }
    }
  });
}

export function decodeMachines(data) {
  /*
  NAME         STATE    FAILED JOBS
* pine1 (host) degraded 2      0   
*/

  return hex2char(data)
    .split(/\n/)
    .map(line => {
      const [name, type, state, failed, jobs] = line.split(/\s+/);
      return {
        name,
        state,
        failed: parseInt(failed),
        jobs: parseInt(jobs)
      };
    });
}

export function decodeOptions(str) {
  const options = {};

  while (str?.length) {
    let m = str.match(/^(\w+)$/);
    if (m) {
      options[m[1]] = true;
      break;
    }
    m = str.match(/\s*([\s\w]+):\s+([^\s,]+)([\s,]*)(.*)/);
    if (m) {
      options[m[1]] = m[2];
      str = m[4];
    } else {
      break;
    }
  }

  return options;
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

  let key;
  let values;

  hex2char(data)
    .split(/\n/)
    .forEach(line => {
      let m = line.match(
        /^\s*([\w\-\s]+):\s+([^\(]+)(\s*\(([^\)]*)\))?\s*(.*)/
      );
      if (m) {
        key = m[1].toLowerCase();

        const value = m[2].trim();
        const extra = m[5];
        const options = decodeOptions(m[4]);
        switch (m[1]) {
          case "Loaded":
            unit.load = value.split(/\s/)[0];
            break;
          case "Memory":
            unit.memory = parseBytes(value);
            if (options.high) {
              unit.highMemory = parseBytes(options.high);
            }
            if (options.max) {
              unit.maxMemory = parseBytes(options.max);
            }
            break;
          case "Tasks":
            unit.tasks = parseInt(value);
            if (options.limit) {
              unit.taskLimit = parseInt(options.limit);
            }
            break;
          case "Active":
            unit.active = value;
            unit.sub = Object.keys(options)[0];

            m = extra.match(/\w+\s+([^;]+);\s+(.*)/);
            if (m) {
              unit.since = decodeDate(m[1]);
            } else {
              m = value.match(/(.+)since\s+(.+)/);
              if (m) {
                unit.active = m[1].trim();
                unit.since = decodeDate(m[2]);
              }
            }
            break;
          case "Docs":
            m = line.match(/^\s*([\w\-\s]+):\s+(.*)/);
            values = [m[2]];
            unit.docs = values;
            break;

          case "Transient":
            unit.transient = parseBoolean(value);
            break;
          case "Follow":
            unit.follow = value.replace("unit currently follows state of ", "");
            break;
          case "Main PID":
            unit.mainPid = parseInt(value.split(/\s/)[0]);
            break;
          case "TriggeredBy":
            unit.triggeredBy = value.split(/\s/)[1];
            break;
          case "Trigger":
            m = value.match(/([^;]+);\s+(.*)\s+left/);
            if (m) {
              unit.trigger = decodeDate(m[1]);
            }
            break;

          case "Triggers":
            unit.triggers = value.replace(/\*\s+/, "");
            break;

          case "Drop-In":
            values = [];
            unit.dropIn = { [value]: values };
            break;
          case "CGroup":
            values = [];
            unit.CGroup = { [value]: values };
            break;

          //case "Where":
          //case "Device":
          default:
            unit[key] = value;
        }
      } else {
        m = line.match(/^\*?\s?([\w\.\-]+)(\s+-\s+(.*))?/);
        if (m) {
          unit.unit = m[1];
          unit.description = m[3];
        } else {
          m = line.match(/^\s{13}(.+)/);
          if (m) {
            const value = m[1];

            m = value.match(/^(`|\|)(\-)?\s*(.*)/);
            if (m) {
              values.push(m[3]);
            } else {
              values.push(value);
            }
          }
        }
      }
    });

  return unit;
}

export function decodeFiles(data) {
  const files = {};
  let lines;

  for (const line of hex2char(data).split(/\n/)) {
    const m = line.match(/^#\s+(\/(.+))/);

    if (m) {
      lines = [];
      files[m[1]] = lines;
    } else {
      lines.push(line);
    }
  }

  return files;
}

export class ServiceSystemdControl extends Service {
  /**
   * @return {string} 'systemctl'
   */
  static get name() {
    return "systemctl";
  }

  static get unitActionNames() {
    return ["start", "stop", "restart", "reload", "freeze", "thaw"];
  }

  static get endpoints() {
    const commonFlags = ["--full", "--all", "--plain", "--no-legend"];

    return {
      ...super.endpoints,
      files: {
        default: true,
        receive: async params => {
          const p = await execa("systemctl", ["cat", params.unit], {
            reject: false
          });
          return decodeFiles(p.stdout);
        }
      },
      unit: {
        default: true,
        receive: async params => {
          const p = await execa(
            "systemctl",
            ["status", "--full", "--all", "--lines", "0", "--", params.unit],
            { reject: false }
          );
          return decodeUnit(p.stdout);
        }
      },
      units: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", ["list-units", ...commonFlags]);
          return decodeUnits(p.stdout);
        }
      },
      timers: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", ["list-timers", ...commonFlags]);
          return decodeTimers(p.stdout);
        }
      },
      sockets: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", ["list-sockets", ...commonFlags]);
          return decodeSockets(p.stdout);
        }
      },
      machines: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", ["list-machines", ...commonFlags]);
          return decodeMachines(p.stdout);
        }
      },

      ...Object.fromEntries(
        this.unitActionNames.map(name => [
          name,
          {
            default: true,
            receive: async params => systemctl(name, params)
          }
        ])
      ),

      fail2ban: {
        default: true,
        receive: async params => {
          const p = await execa("fail2ban-client", ["status"]);
          return p.stdout;
        }
      }
    };
  }
}

export default ServiceSystemdControl;
