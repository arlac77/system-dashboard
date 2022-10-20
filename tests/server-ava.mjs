import test from "ava";
import got from "got";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import initialize from "../src/initialize.mjs";

let port = 3149;

test.before(async t => {
  port++;

  const config = {
    http: {
      logLevel: "error",
      listen: { socket: port }
    },
    swarm: {
      logLevel: "error",
      key: "sdlfkjdf-dsakfds-sdfrj4.s-ss-rk4jl3l"
    }
  };

  t.context.sp = new StandaloneServiceProvider(config);

  initialize(t.context.sp);
  await t.context.sp.start();

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

//test.after(async t => t.context.sp.stop());

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
