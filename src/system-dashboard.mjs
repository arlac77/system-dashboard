import ServiceHealthCheck from "@kronos-integration/service-health-check";
import ServiceLDAP from "@kronos-integration/service-ldap";
import ServiceAuthenticator from "@kronos-integration/service-authenticator";
import ServiceAdmin from "@kronos-integration/service-admin";
import ServiceSwarm from "@kronos-integration/service-swarm";
import ServiceSystemdControl from "./service-systemd-control.mjs";
import ServiceNetworkControl from "./service-network-control.mjs";
import ServiceNamed from "./service-named.mjs";
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

export default async function setup(sp) {
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
    interceptors: GETInterceptors
  };
  const POST_PLAIN = {
    method: "POST",
    interceptors: [new CTXBodyParamInterceptor()]
  };
  const WS = {
    ws: true,
    interceptors: [new DecodeJSONInterceptor()],
    receivingInterceptors :[new EncodeJSONInterceptor()]
  };

  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "/services/peers": {
          ...WS,
          connected: "service(swarm).peers.services"
        },
        "/services": { ...WS, connected: "service(admin).services" },

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

        "/authenticate": { ...POST_PLAIN, connected: "service(auth).access_token" },
        "/systemctl/machines": { ...GET, connected: "service(systemctl).machines" },
        "/systemctl/timers": { ...GET, connected: "service(systemctl).timers" },
        "/systemctl/sockets": { ...GET, connected: "service(systemctl).sockets" },
        "/systemctl/unit": { ...GET, connected: "service(systemctl).units" },
        "/systemctl/unit/:unit": { ...GET, connected: "service(systemctl).unit" },
        "/systemctl/unit/:unit/files": { ...GET, connected: "service(systemctl).files" },
        ...Object.fromEntries(
          ServiceSystemdControl.unitActionNames.map(name => [
            `/systemctl/unit/:unit/${name}`,
            {
              ...POST,
              connected: `service(systemctl).${name}`
            }
          ])
        ),
        "/networkctl/interfaces": { ...GET, connected: "service(networkctl).interfaces" },

        "/fail2ban": {
          ...GET,
          connected: "service(systemctl).fail2ban"
        },
        "/named": {
          ...GET,
          connected: "service(named).status"
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
        "ldap.authenticate": "service(ldap).authenticate"
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
        "topic.services": {
          connected: "service(admin).services",
          receivingInterceptors :[new EncodeJSONInterceptor()]
        }, 
        "peers.services": { }
      }
    },
    systemctl: {
      type: ServiceSystemdControl,
      autostart: true
    },
    networkctl: {
      type: ServiceNetworkControl,
      autostart: true
    },
    named: {
      type: ServiceNamed,
      autostart: true
    }
  });

  await sp.start();
}
