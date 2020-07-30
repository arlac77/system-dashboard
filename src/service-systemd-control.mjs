import { Service } from "@kronos-integration/service";
import execa from "execa";

async function systemctl(cmd, params) {
  const p = await execa("systemctl", [cmd, params.unit], { all: true });
  return p.all;
}

export function decodeUnitList(data) {
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
          return decodeUnitList(p.stdout);
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
