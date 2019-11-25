import { Service } from "@kronos-integration/service";
import execa from "execa";

export class ServiceSystemdControl extends Service {
  static get endpoints() {
    return {
      ...super.endpoints,
      status: {
        default: true,
        receive: async () => {
          const p = await execa("systemctl", ["status"], { all: true });
          return p.all;
        }
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
