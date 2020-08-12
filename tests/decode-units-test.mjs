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

  //console.log(units.map(u => u.unit));
  t.deepEqual(
    units.find(u => u.unit === "dev-disk-by-uuid-806fc6bb-526c-40ea-be90-233701157796.device"),
    {
      unit: "dev-disk-by-uuid-806fc6bb-526c-40ea-be90-233701157796.device",
      load: "loaded",
      active: "active",
      sub: "plugged",
      description: "/dev/disk/by-uuid/806fc6bb-526c-40ea-be90-233701157796"
    }
  );
});
