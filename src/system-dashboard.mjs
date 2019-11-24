import ServiceKOA from "@kronos-integration/service-koa";
import ServiceHealthCheck from "@kronos-integration/service-health-check";
import {
  CTXInterceptor,
  CTXBodyParamInterceptor,
  endpointRouter
} from "@kronos-integration/service-koa";
import ServiceLDAP from "@kronos-integration/service-ldap";
import ServiceAuthenticator from "@kronos-integration/service-authenticator";


export async function setup(sp) {
  const GET = { interceptors: [CTXInterceptor] };
  const POST = {
    method: "POST",
    interceptors: [CTXBodyParamInterceptor /*, LoggingInterceptor*/]
  };

  const services = await sp.declareServices({
    http: {
      type: ServiceKOA,
      endpoints: {
        "/state" : { ...GET, connected: "service(health).state" },
        "/state/uptime" : { ...GET, connected: "service(health).uptime" },
        "/state/cpu": { ...GET, connected: "service(health).cpu" },
        "/state/memory" : { ...GET, connected: "service(health).memory" },
        "/authenticate": { ...POST, connected: "service(auth).access_token" }
      }
    },
    ldap: {
      type: ServiceLDAP
    },
    health: {
      type: ServiceHealthCheck
    },
    auth: {
      type: ServiceAuthenticator,
      endpoints: {
        ldap: "service(ldap).authenticate"
      }
    }
  });

  const koaService = services[0];


  /*
  router.addRoute("GET", "/systemctl/status", restricted, async (ctx, next) => {
    const p = await execa("systemctl", ["status"], { all: true });
    ctx.body = p.all;
    return next();
  });

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

  koaService.koa.use(endpointRouter(koaService));  

  await sp.start();
  await Promise.all(services.map(s => s.start()));
}
