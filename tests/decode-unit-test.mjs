import test from "ava";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { decodeUnit } from "../src/service-systemd-control.mjs";

const here = dirname(fileURLToPath(import.meta.url));

function getRawUnit(name) {
  return readFileSync(join(here, "fixtures", name), {
    encoding: "utf8"
  });
}

test("systemctl decode service unit", t => {
  t.like(decodeUnit(getRawUnit("hook-ci.service")), {
    unit: "hook-ci.service",
    description: "simple ci to be triggered by git hooks",
    load: "loaded",
    active: "active",
    sub: "running",
    memory: 345.0 * 1024 * 1024,
    highMemory: 500 * 1024 * 1024,
    maxMemory: 1000 * 1024 * 1024,
    since: "Wed 2020-08-12 14:16:01 CEST",
    passed: "8h ago",
    mainPid: 21944,
    tasks: 11,
    taskLimit: 2211,
    triggeredBy: "hook-ci.socket"
  });
});

test("systemctl decode device unit", t => {
  t.like(decodeUnit(getRawUnit("dev-sda2.device")), {
    unit: "dev-sda2.device",
    description: "WDC_WD20EARS-00MVWB0 MF-TM-003",
    load: "loaded",
    active: "active",
    sub: "plugged",
    since: "Wed 2020-08-12 01:32:13 CEST",
    passed: "20h ago",
    device: "/sys/devices/platform/soc/soc:usb3-0/12000000.dwc3/xhci-hcd.3.auto/usb3/3-1/3-1.2/3-1.2:1.0/host0/target0:0:0/0:0:0:0/block/sda/sda2",
    follow: "sys-devices-platform-soc-soc:usb3\x2d0-12000000.dwc3-xhci\x2dhcd.3.auto-usb3-3\x2d1-3\x2d1.2-3\x2d1.2:1.0-host0-target0:0:0-0:0:0:0-block-sda-sda2.device"
  });
});
