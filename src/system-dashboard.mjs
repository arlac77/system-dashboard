import ServiceHealthCheck from "@kronos-integration/service-health-check";
import ServiceLDAP from "@kronos-integration/service-ldap";
import ServiceAuthenticator from "@kronos-integration/service-authenticator";
import ServiceAdmin from "@kronos-integration/service-admin";
import ServiceSwarm from "@kronos-integration/service-swarm";
import ServiceSystemdControl from "./service-systemd-control.mjs";
import {
  DecodeJSONInterceptor,
  EncodeJSONInterceptor
} from "@kronos-integration/interceptor-decode-json";

import {
  ServiceHTTP,
  CTXInterceptor,
  CTXJWTVerifyInterceptor,
  CTXBodyParamInterceptor
} from "@kronos-integration/service-http";

export async function setup(sp) {
  const WSOutInterceptors = [new EncodeJSONInterceptor()];
  const GETInterceptors = [
    new CTXJWTVerifyInterceptor(),
    new CTXInterceptor({
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: 0
      }
    })
  ];
  const GET = {
    interceptors: GETInterceptors
  };
  const POST = {
    method: "POST",
    interceptors: [new CTXBodyParamInterceptor()]
  };
  const WS = {
    ws: true,
    interceptors: [new DecodeJSONInterceptor()]
  };

  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "/state/uptime": {
          ...WS,
          connected: "service(health).uptime"
        },
        "/state/cpu": {
          ...WS,
          connected: "service(health).cpu"
        },
        "/state/memory": {
          ...WS,
          connected: "service(health).memory"
        },
        "/state": {
          ...WS,
          connected: "service(health).state"
        },
        "/authenticate": { ...POST, connected: "service(auth).access_token" },
        "/services": { ...GET, connected: "service(admin).services" },
        "/systemctl/status": { ...GET, connected: "service(systemctl).status" },
        "/systemctl/start/:unit": {
          ...GET,
          connected: "service(systemctl).start"
        },
        "/systemctl/stop/:unit": {
          ...GET,
          connected: "service(systemctl).stop"
        },
        "/systemctl/restart/:unit": {
          ...GET,
          connected: "service(systemctl).restart"
        },
        "/systemctl/reload/:unit": {
          ...GET,
          connected: "service(systemctl).reload"
        }
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
    swarm: {
      type: ServiceSwarm,
      autostart: true,
      endpoints: {
        "topic.uptime": { lookup: false, connected: "service(health).uptime" }
      }
    },
    systemctl: {
      type: ServiceSystemdControl,
      autostart: true
    }
  });

  await sp.start();

  sp.services.health.endpoints.memory.interceptors = WSOutInterceptors;
  sp.services.health.endpoints.cpu.interceptors = WSOutInterceptors;
  sp.services.health.endpoints.uptime.interceptors = WSOutInterceptors;
  sp.services.health.endpoints.state.interceptors = WSOutInterceptors;
}
