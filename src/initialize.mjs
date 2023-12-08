import ServiceHealth from "@kronos-integration/service-health";
import ServiceLDAP from "@kronos-integration/service-ldap";
import ServiceAuthenticator from "@kronos-integration/service-authenticator";
import {
  ServiceAdmin,
  LiveProbeInterceptor
} from "@kronos-integration/service-admin";
//import ServiceSwarm from "@kronos-integration/service-swarm";
import ServiceSystemdControl from "./service-systemd-control.mjs";
import ServiceNetworkControl from "./service-network-control.mjs";
import ServiceResolverControl from "./service-resolver-control.mjs";
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

export default async function initialize(sp) {
  sp.registerFactories([
    ServiceHTTP,
    ServiceLDAP,
    ServiceAuthenticator,
    ServiceHealth,
    ServiceAdmin,
//    ServiceSwarm,
    ServiceNamed,
    ServiceNetworkControl,
    ServiceSystemdControl,
    ServiceResolverControl,
    DecodeJSONInterceptor,
    EncodeJSONInterceptor,
    CTXBodyParamInterceptor,
    CTXJWTVerifyInterceptor,
    CTXInterceptor,
    LiveProbeInterceptor
  ]);

  const GETInterceptors = [
    new CTXJWTVerifyInterceptor(),
    new CTXInterceptor({
      headers: {
        "cache-control": "no-cache"
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
    interceptors: new CTXBodyParamInterceptor()
  };
  const WS = {
    ws: true,
    interceptors: new DecodeJSONInterceptor(),
    receivingInterceptors: new EncodeJSONInterceptor()
  };

  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
/*        "/services/peers": {
          ...WS,
          connected: "service(swarm).peers.services"
        },
*/
        "/admin/services": { ...WS, connected: "service(admin).services" },
        "/admin/requests": { ...WS, connected: "service(admin).requests" },

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

        "/authenticate": {
          ...POST_PLAIN,
          connected: "service(authenticator).access_token"
        },
        "/systemctl/machine": {
          ...GET,
          connected: "service(systemctl).machines"
        },
        "/systemctl/timer": { ...GET, connected: "service(systemctl).timers" },
        "/systemctl/socket": {
          ...GET,
          connected: "service(systemctl).sockets"
        },
        "/systemctl/unit": { ...GET, connected: "service(systemctl).units" },
        "/systemctl/unit/:unit": {
          ...GET,
          connected: "service(systemctl).unit"
        },
        "/systemctl/unit/:unit/files": {
          ...GET,
          connected: "service(systemctl).files"
        },
        ...Object.fromEntries(
          ServiceSystemdControl.unitActionNames.map(name => [
            `/systemctl/unit/:unit/${name}`,
            {
              ...POST,
              connected: `service(systemctl).${name}`
            }
          ])
        ),
        "/networkctl/interfaces": {
          ...GET,
          connected: "service(networkctl).interfaces"
        },
        "/networkctl/neighbours": {
          ...GET,
          connected: "service(networkctl).neighbours"
        },
        "/resolverctl/interfaces": {
          ...GET,
          connected: "service(resolverctl).interfaces"
        },

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
    ldap: {},
    health: {},
    authenticator: {
      endpoints: {
        "ldap.authenticate": "service(ldap).authenticate"
      }
    },
    admin: {},
   /* swarm: {
      autostart: true,
      endpoints: {
        "topic.services": {
          connected: "service(admin).services",
          receivingInterceptors: new EncodeJSONInterceptor()
        },
        "peers.services": {}
      }
    },
    */
    systemctl: {},
    networkctl: {},
    named: {}
  });
}
