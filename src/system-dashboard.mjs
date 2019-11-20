import ServiceKOA from "@kronos-integration/service-koa";
import ServiceHealthCheck from "@kronos-integration/service-health-check";
import Router from "koa-better-router";
import BodyParser from "koa-bodyparser";
import { endpointRouter } from "@kronos-integration/service-koa";
import { accessTokenGenerator } from "./auth.mjs";
import KoaJWT from "koa-jwt";


export const config = {
  jwt: {
    options: {
      algorithm: "RS256",
      expiresIn: "12h"
    }
  },
  ldap: {
    url: "ldap://ldap.mf.de",
    bindDN: "uid={{username}},ou=accounts,dc=mf,dc=de",
    entitlements: {
      base: "ou=groups,dc=mf,dc=de",
      attribute: "cn",
      scope: "sub",
      filter:
        "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{username}},ou=accounts,dc=mf,dc=de))"
    }
  }
};

export async function setup(sp) {
  const services = await sp.declareServices({
    http: {
      type: ServiceKOA,
      endpoints: {
        "/state" : {},
        "/state/uptime" : {},
        "/state/cpu" : {},
        "/state/memory" : {}
      }
    },
    health: {
      type: ServiceHealthCheck
    }
  });

  const koaService = services[0];


  const restricted = KoaJWT({
  //  secret: config.auth.jwt.public
  });


  const router = Router({
    notFound: async (ctx, next) => {
      console.log("route not found", ctx.request.url);
      return next();
    }
  });

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

  router.addRoute(
    "POST",
    "/authenticate",
    BodyParser(),
    accessTokenGenerator(config)
  );

  koaService.koa.use(router.middleware());

  koaService.endpoints["/state/uptime"].connected = sp.getService('health').endpoints.uptime;
  koaService.endpoints["/state/memory"].connected = sp.getService('health').endpoints.memory;
  koaService.endpoints["/state/cpu"].connected = sp.getService('health').endpoints.cpu;
  koaService.endpoints["/state"].connected = sp.getService('health').endpoints.state;

  koaService.koa.use(endpointRouter(koaService));  

  await sp.start();
  await Promise.all(services.map(s => s.start()));
}
