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

  await sp.declareServices({
    http: {
      type: ServiceKOA,
      autostart: true,
      endpoints: {
        "/state" : { ...GET, connected: "service(health).state" },
        "/state/uptime" : { ...GET, connected: "service(health).uptime" },
        "/state/cpu": { ...GET, connected: "service(health).cpu" },
        "/state/memory" : { ...GET, connected: "service(health).memory" },
        "/authenticate": { ...POST, connected: "service(auth).access_token" },
        "/services": {...GET, connected: "service(admin).services" },
        "/systemctl/status": {...GET, connected: "service(systemctl).status" },
        "/systemctl/start/:unit": {...GET, connected: "service(systemctl).start" },
        "/systemctl/stop/:unit": {...GET, connected: "service(systemctl).stop" },
        "/systemctl/restart/:unit": {...GET, connected: "service(systemctl).restart" },
        "/systemctl/reload/:unit": {...GET, connected: "service(systemctl).reload" }
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
      autostart: true,
      endpoints: {
        ldap: "service(ldap).authenticate"
      }
    },
    admin: {
      type: ServiceAdmin,
      autostart: true
    },
    systemctl : {
      type: ServiceSystemdControl,
      autostart: true
    }
  });

  await sp.start();
}
