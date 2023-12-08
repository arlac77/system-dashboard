import test from "ava";
import { readFile } from "node:fs/promises";
import {
  decodeNetworkStatus,
  decodeNetworkNeighburs
} from "../src/service-network-control.mjs";

test("netowkctl status", async t => {
  const interfaces = decodeNetworkStatus(
    await readFile(
      new URL("fixtures/networkctl-status", import.meta.url).pathname,
      {
        encoding: "utf8"
      }
    )
  );
  t.deepEqual(interfaces, [
    {
      Address: "127.0.0.1",
      Collisions: 0,
      "IPv6 Address Generation Mode": "eui64",
      "Link File": "/usr/lib/systemd/network/99-default.link",
      MTU: 65536,
      "Multicast Packets": 0,
      "Network File": "n/a",
      QDisc: "noqueue",
      "Queue Length (Tx/Rx)": "1/1",
      "Rx Bytes": 6026170741,
      "Rx Dropped": 0,
      "Rx Errors": 0,
      "Rx Packets": 9588427,
      State: "carrier (unmanaged)",
      "Tx Bytes": 6026170741,
      "Tx Dropped": 0,
      "Tx Errors": 0,
      "Tx Packets": 9588427,
      Type: "loopback",
      name: "lo",
      number: 1
    },
    {
      Address: "10.0.0.20",
      "Auto negotiation": "yes",
      Collisions: 0,
      "Connected To": "fritz.box on port c0:25:08:e2:7a:78 (LAN:3)",
      "DHCP6 Client DUID": "DUID-EN/Vendor:0000ab11189e3c5fa9bd8f340000",
      "DHCP6 Client IAID": "0xa01fce31",
      DNS: "ed02:adeb:9d7:2e18:10::20",
      Driver: "r8152",
      Duplex: "full",
      Gateway: "10.0.0.2 (AVM GmbH)",
      "HW Address": "00:1f:06:61:08:57 (WIBRAIN)",
      "IPv6 Address Generation Mode": "eui64",
      "Link File": "/usr/lib/systemd/network/99-default.link",
      MTU: 1500,
      Model: "RTL8153 Gigabit Ethernet Adapter",
      "Multicast Packets": 0,
      "Network File": "/etc/systemd/network/eth0.network",
      Path: "platform-xhci-hcd.6.auto-usb-0:1:1.0",
      Port: "mii",
      QDisc: "fq_codel",
      "Queue Length (Tx/Rx)": "1/1",
      "Rx Bytes": 2011490494,
      "Rx Dropped": 1149,
      "Rx Errors": 0,
      "Rx Packets": 327464905,
      Speed: "1Gbps",
      State: "routable (configured)",
      "Tx Bytes": 1979451813,
      "Tx Dropped": 0,
      "Tx Errors": 0,
      "Tx Packets": 189393298,
      Type: "ether",
      Vendor: "Realtek Semiconductor Corp.",
      name: "eth0",
      number: 2
    },
    {
      "Activation Policy": "up",
      Address: "10.0.0.20",
      "Auto negotiation": "yes",
      Collisions: 0,
      "Connected To": "fritz.box on port 2c:3a:fd:b3:b9:e2 (LAN:3)",
      "DHCP6 Client DUID": "DUID-EN/Vendor:0000ab114b53c87fd26b5dd60000",
      DNS: "fd02:adeb:9d7:2e18:2e3a:fdff:feb3:b9e2",
      Driver: "st_gmac",
      Duplex: "full",
      Gateway: "10.0.0.2",
      "Hardware Address": "00:1e:06:49:04:5c (WIBRAIN)",
      "IPv6 Address Generation Mode": "none",
      "Link File": "/etc/systemd/network/0-net0.link",
      MTU: 1500,
      "Multicast Packets": 0,
      "Network File": "/etc/systemd/network/net0.network",
      "Number of Queues (Tx/Rx)": "8/8",
      "Online state": "online",
      Path: "platform-ff3f0000.ethernet",
      Port: "tp",
      QDisc: "mq",
      "Required For Online": "yes",
      "Rx Bytes": 204595738005,
      "Rx Dropped": 0,
      "Rx Errors": 0,
      "Rx Packets": 313998292,
      "Search Domains": "mf.de",
      Speed: "1Gbps",
      State: "routable (configured)",
      "Tx Bytes": 333711117395,
      "Tx Dropped": 0,
      "Tx Errors": 0,
      "Tx Packets": 307386392,
      Type: "ether",
      name: "net0",
      number: 3
    }
  ]);
});

test("neighbour", async t => {
  const neighbour = decodeNetworkNeighburs(
    await readFile(new URL("fixtures/ip-neighbour", import.meta.url).pathname, {
      encoding: "utf8"
    })
  );
  t.deepEqual(neighbour, [
    {
      address: "10.0.1.6",
      device: "eth0",
      hwaddr: "c8:1b:14:87:ca:32",
      state: "STALE"
    },
    {
      address: "10.0.168.110",
      device: "eth0",
      hwaddr: undefined,
      state: "FAILED"
    },
    {
      address: "fd02:adeb:9d7:2e18:10:0:4:3",
      device: "eth0",
      hwaddr: undefined,
      state: "FAILED"
    },
    {
      address: "fe80::ce8:b2ef:d54d:d831",
      device: "eth0",
      hwaddr: "29:37:38:41:0c:40",
      state: "STALE"
    }
  ]);
});
