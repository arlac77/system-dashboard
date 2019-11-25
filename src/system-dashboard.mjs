import ServiceKOA from "@kronos-integration/service-koa";
import ServiceHealthCheck from "@kronos-integration/service-health-check";
import {
  CTXInterceptor,
  CTXBodyParamInterceptor
} from "@kronos-integration/service-koa";
import ServiceLDAP from "@kronos-integration/service-ldap";
import ServiceAuthenticator from "@kronos-integration/service-authenticator";
import ServiceAdmin from "@kronos-integration/service-admin";
import ServiceSystemdControl from "./service-systemd-control.mjs";


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
        "/authenticate": { ...POST, connected: "service(auth).access_token" },
        "/services": {...GET, connected: "service(admin).services" },
        "/systemctl/status": {...GET, connected: "service(systemctl).status" }
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
    },
    admin: {
      type: ServiceAdmin
    },
    systemctl : {
      type: ServiceSystemdControl
    }
  });

  await sp.start();
  await Promise.all(services.map(s => s.start()));
}
