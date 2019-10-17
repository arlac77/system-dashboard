import Koa from "koa";
import Router from "koa-better-router";
import execa from "execa";

export const defaultServerConfig = {
  http: {
    port: "${first(env.PORT,8096)}"
  }
};

export async function server(config, sd) {
  const app = new Koa();

  const router = Router({
    notFound: async (ctx, next) => {
      console.log("route not found", ctx.request.url);
      return next();
    }
  });

  router.addRoute(
    "GET",
    "/systemctl/status",
    // restricted,
    async (ctx, next) => {
      const p = await execa("systemctl", ["status"], { all: true });
      ctx.body = p.all;
      return next();
    }
  );

  let server = app.listen(config.http.port, () => {
    console.log("listen on", server.address());
    sd.notify("READY=1\nSTATUS=running");
  });

  return server;
}
