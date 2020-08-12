import test from "ava";
import { decodeUnit } from "../src/service-systemd-control.mjs";

test("systemctl decode unit", t => {
  const raw = `* hook-ci.service - simple ci to be triggered by git hooks
     Loaded: loaded (/usr/lib/systemd/system/hook-ci.service; enabled; vendor preset: disabled)
    Drop-In: /etc/systemd/system/hook-ci.service.d
        \`-env.conf
     Active: active (running) since Thu 2020-07-30 20:47:21 CEST; 17h ago
TriggeredBy: * hook-ci.socket
   Main PID: 22036 (node)
     Memory: 403.8M (high: 500.0M max: 1000.0M)
      Tasks: 11 (limit: 2211)
     CGroup: /system.slice/hook-ci.service
        \`-22036 hook-ci`;

  t.like(decodeUnit(raw), {
    unit: "hook-ci.service",
    description: "simple ci to be triggered by git hooks",
    load: "loaded",
    active: "active",
    sub: "running",
    memory: 403.8 * 1024 * 1024,
    highMemory : 500 * 1024 * 1024,
    maxMemory : 1000 * 1024 * 1024,
    since: "Thu 2020-07-30 20:47:21 CEST",
    passed: "17h ago",
    mainPid: 22036,
    tasks: 11,
    taskLimit: 2211,
    triggeredBy: "hook-ci.socket"
  });
});
