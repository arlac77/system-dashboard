import Koa from "koa";
import Router from "koa-better-router";
import KoaJWT from "koa-jwt";
import execa from "execa";
import { list } from "./dbus.mjs";

export const defaultServerConfig = {
  http: {
    port: "${first(env.PORT,8096)}"
  }
};

function setNoCacheHeaders(ctx) {
  ctx.set("Cache-Control", "no-store, no-cache, must-revalidate");
  ctx.set("Pragma", "no-cache");
  ctx.set("Expires", 0);
}

export async function server(config, sd) {
  const app = new Koa();

  const router = Router({
    notFound: async (ctx, next) => {
      console.log("route not found", ctx.request.url);
      return next();
    }
  });

  const restricted = KoaJWT({
    secret: config.auth.jwt.public
  });

  router.addRoute("GET", "/state", async (ctx, next) => {
    setNoCacheHeaders(ctx);

    ctx.body = {
      version: config.version,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    return next();
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

  app.use(router.middleware());

  let server = app.listen(config.http.port, () => {
    console.log("listen on", server.address());
    sd.notify("READY=1\nSTATUS=running");
  });

  return server;
}
