import test from "ava";
import { readFileSync } from "node:fs";
import { decodeUnit } from "../src/service-systemd-control.mjs";

function getRawUnit(name) {
  return readFileSync(new URL(`fixtures/${name}`, import.meta.url).pathname, {
    encoding: "utf8"
  });
}

test("systemctl decode service unit", t => {
  t.like(decodeUnit(getRawUnit("hook-ci.service-list")), {
    unit: "hook-ci.service",
    description: "simple ci to be triggered by git hooks",
    load: "loaded",
    active: "active",
    sub: "running",
    memory: 345.0 * 1024 * 1024,
    highMemory: 500 * 1024 * 1024,
    maxMemory: 1000 * 1024 * 1024,
    since: new Date("2020-08-12T12:16:01Z"),
    mainPid: 21944,
    tasks: 11,
    taskLimit: 2211,
    triggeredBy: "hook-ci.socket",

    dropIn: { "/etc/systemd/system/hook-ci.service.d": ["env.conf"] },
    CGroup: { "/system.slice/hook-ci.service": ["21944 hook-ci"] }
  });
});

test("systemctl decode service unit cgroup", t => {
  t.like(decodeUnit(getRawUnit("nginx.service-list")), {
    unit: "nginx.service",
    description: "A high performance web server and a reverse proxy server",
    load: "loaded",
    active: "active",
    sub: "running",
    memory: 8.6 * 1024 * 1024,
    since: new Date("2020-08-11T23:32:23Z"),
    mainPid: 377,
    CGroup: {
      "/system.slice/nginx.service": [
        "377 nginx: master process /usr/bin/nginx -g pid /run/nginx.pid; error_log stderr;",
        "4997 nginx: worker process"
      ]
    }
  });
});

test("systemctl decode device unit", t => {
  t.like(decodeUnit(getRawUnit("dev-sda2.device-list")), {
    unit: "dev-sda2.device",
    description: "WDC_WD20EARS-00MVWB0 MF-TM-003",
    load: "loaded",
    active: "active",
    sub: "plugged",
    since: new Date("2020-08-11T23:32:13Z"),
    device:
      "/sys/devices/platform/soc/soc:usb3-0/12000000.dwc3/xhci-hcd.3.auto/usb3/3-1/3-1.2/3-1.2:1.0/host0/target0:0:0/0:0:0:0/block/sda/sda2",
    follow:
      "sys-devices-platform-soc-soc:usb3\x2d0-12000000.dwc3-xhci\x2dhcd.3.auto-usb3-3\x2d1-3\x2d1.2-3\x2d1.2:1.0-host0-target0:0:0-0:0:0:0-block-sda-sda2.device"
  });
});

test("systemctl decode timer unit", t => {
  t.like(decodeUnit(getRawUnit("paccache.timer-list")), {
    unit: "paccache.timer",
    description: "Discard unused packages weekly",
    load: "loaded",
    active: "active",
    sub: "waiting",
    since: new Date("2020-08-11T23:32:20Z"),
    trigger: new Date("2020-08-16T22:00:00Z"),
    triggers: "paccache.service"
  });
});

test("systemctl decode scope unit", t => {
  t.like(decodeUnit(getRawUnit("init.scope-list")), {
    unit: "init.scope",
    description: "System and Service Manager",
    load: "loaded",
    active: "active",
    sub: "running",
    since: new Date("2020-08-11T23:32:09Z"),
    memory: 17.3 * 1024 * 1024,
    transient: true
    //    docs: ["man:systemd(1)" ]
  });
});

test("systemctl decode automount unit", t => {
  t.like(decodeUnit(getRawUnit("proc-sys-fs-binfmt_misc.automount-list")), {
    unit: "proc-sys-fs-binfmt_misc.automount",
    description:
      "Arbitrary Executable File Formats File System Automount Point",
    load: "loaded",
    active: "active",
    sub: "waiting",
    since: new Date("2020-08-11T23:32:10Z"),
    triggers: "proc-sys-fs-binfmt_misc.mount",
    where: "/proc/sys/fs/binfmt_misc",
    docs: [
      "https://www.kernel.org/doc/html/latest/admin-guide/binfmt-misc.html",
      "https://www.freedesktop.org/wiki/Software/systemd/APIFileSystems"
    ]
  });
});

test("systemctl decode slice unit", t => {
  t.like(decodeUnit(getRawUnit("root.slice-list")), {
    unit: "-.slice",
    description: "Root Slice",
    load: "loaded",

    //Active: active since Wed 2020-08-12 01:32:09 CEST; 4 days ago
    active: "active",
    since: new Date("2020-08-11T23:32:09Z"),
    tasks: 361,
    memory: 1.7 * 1024 * 1024 * 1024,
    docs: ["man:systemd.special(7)"],
    CGroup: {
      "init.scope": undefined /*[
        "-1 /sbin/init"
      ]*/
    }
  });
});

test("systemctl decode path unit", t => {
  t.like(decodeUnit(getRawUnit("pacman-update.path-list")), {
    unit: "pacman-update.path",
    load: "loaded",
    active: "active",
    since: new Date("2020-08-11T23:32:20Z")
  });
});
