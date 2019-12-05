import ServiceHealthCheck from "@kronos-integration/service-health-check";
import ServiceLDAP from "@kronos-integration/service-ldap";
import ServiceAuthenticator from "@kronos-integration/service-authenticator";
import ServiceAdmin from "@kronos-integration/service-admin";
import ServiceSystemdControl from "./service-systemd-control.mjs";
import {
  ServiceHTTP,
  CTXInterceptor,
  CTXJWTVerifyInterceptor,
  CTXBodyParamInterceptor
} from "@kronos-integration/service-http";


export async function setup(sp) {
  const getInterceptors = [/*new CTXJWTVerifyInterceptor(),*/ new CTXInterceptor()]
  const GET = {
    interceptors: getInterceptors
  };
  const POST = {
    method: "POST",
    interceptors: [CTXBodyParamInterceptor /*, LoggingInterceptor*/]
  };

  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "/ws/state/uptime": {
          ws: true,
          connected: "service(health).uptime"
        },
        "/ws/state/cpu": {
          ws: true,
          connected: "service(health).cpu"
        },
        "/ws/state/memory": {
          ws: true,
          connected: "service(health).memory"
        },
        "/ws/state": {
          ws: true,
          connected: "service(health).state"
        },
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
