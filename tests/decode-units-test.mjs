import test from "ava";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { decodeUnits } from "../src/service-systemd-control.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test("systemctl decode units", t => {
  const raw = readFileSync(join(here, "fixtures", "list-units"), {
    encoding: "utf8"
  });

  const units = decodeUnits(raw);

  t.deepEqual(
    units.find(u => u.unit === "auditd.service"),
    {
      unit: "auditd.service",
      load: "loaded",
      active: "inactive",
      sub: "dead",
      description: "Security Auditing Service"
    }
  );
  t.deepEqual(
    units.find(u => u.unit === "avahi-daemon.service"),
    {
      unit: "avahi-daemon.service",
      load: "loaded",
      active: "active",
      sub: "running",
      description: "Avahi mDNS/DNS-SD Stack"
    }
  );

  t.deepEqual(
    units.find(u => u.unit === "backup.service"),
    {
      unit: "backup.service",
      load: "loaded",
      active: "inactive",
      sub: "dead",
      description: "backup"
    }
  );
});
