import test from "ava";
import got from "got";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import setup from "../src/system-dashboard.mjs";

let port = 3149;

test.before(async t => {
  port++;

  const config = {
    http: {
      logLevel: "error",
      listen: { port }
    },
    swarm: {
      logLevel: "error",
      key: "sdlfkjdf-dsakfds-sdfrj4.s-ss-rk4jl3l"
    }
  };

  t.context.sp = new StandaloneServiceProvider(config);

  setup(t.context.sp);

  t.context.port = port;

  try {
    const response = await got.post(`http://localhost:${port}/authenticate`, {
      body: {
        username: "user1",
        password: "secret"
      },
      json: true
    });

    t.context.token = response.body.access_token;
  } catch (e) {}
});

test.after.always(async t => {
  //  t.context.server.close();
});

test("startup", async t => {
  t.true(t.context.sp.state === "running" || t.context.sp.state === "starting");
});

test.skip("state", async t => {
  const response = await got.get(
    `http://localhost:${t.context.port}/state/uptime`,
    {
      headers: {
        Authorization: `Bearer ${t.context.token}`
      }
    }
  );

  t.is(response.statusCode, 200);

  const json = JSON.parse(response.body);
  console.log(json);
  t.deepEqual(json, {});
});
