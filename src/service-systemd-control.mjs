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
    const [
      unit,
      load,
      active,
      sub,
      ...description
    ] = line.split(/\s+/);
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
  // Fri 2020-07-31 00:00:00 CEST 2min 7s left  Thu 2020-07-30 00:00:00 CEST 23h ago    logrotate.timer              logrotate.service             
  // Fri 2020-07-31 00:00:00 CEST 2min 7s left  Thu 2020-07-30 00:00:00 CEST 23h ago    man-db.timer                 man-db.service                
  return data;
}

export function decodeSockets(data) {
  // /run/avahi-daemon/socket                       avahi-daemon.socket                  avahi-daemon.service                 
  // /run/dbus/system_bus_socket                    dbus.socket                          dbus.service                         
  return data;
}

export function decodeMachines(data) {
/*
  NAME         STATE    FAILED JOBS
* pine1 (host) degraded 2      0   
*/

  return data.split(/\n/).map(line => {
    const [
      name,
      type,
      state,
      failed,
      jobs
    ] = line.split(/\s+/);
    return {
      name,
      state,
      failed: parseInt(failed),
      jobs: parseInt(jobs)
    };
  });
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
