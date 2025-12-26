import test from "ava";
import { readFile } from "node:fs/promises";
import { decodeResolverInterfaces } from "../src/service-resolver-control.mjs";

test("netowkctl status", async t => {
  const interfaces = decodeResolverInterfaces(
    await readFile(
      new URL("fixtures/resolvectl.json", import.meta.url).pathname,
      {
        encoding: "utf8"
      }
    )
  );

  t.deepEqual(interfaces, [
    {
      servers: [
        {
          addressString: "10.0.0.20",
          address: [10, 0, 0, 20],
          family: 2,
          port: 53,
          accessible: true
        },
        {
          addressString: "fd02:adeb:9d7:2e18::20",
          address: [253, 2, 173, 235, 9, 215, 46, 24, 0, 0, 0, 0, 0, 0, 0, 32],
          family: 10,
          port: 53,
          accessible: true
        },
        {
          addressString: "10.0.0.21",
          address: [10, 0, 0, 21],
          family: 2,
          port: 53,
          accessible: true
        },
        {
          addressString: "fd02:adeb:9d7:2e18::21",
          address: [253, 2, 173, 235, 9, 215, 46, 24, 0, 0, 0, 0, 0, 0, 0, 33],
          family: 10,
          port: 53,
          accessible: true
        }
      ],
      fallbackServers: [
        {
          addressString: "1.1.1.1",
          address: [1, 1, 1, 1],
          family: 2,
          port: 53,
          accessible: true
        },
        {
          addressString: "2606:4700:4700::1111",
          address: [38, 6, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17],
          family: 10,
          port: 53,
          accessible: true
        },
        {
          addressString: "8.8.8.8",
          address: [8, 8, 8, 8],
          family: 2,
          port: 53,
          accessible: true
        },
        {
          addressString: "2001:4860:4860::8888",
          address: [32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, 136, 136],
          family: 10,
          port: 53,
          accessible: true
        }
      ],
      searchDomains: [{ name: "mf.de", routeOnly: false }],
      negativeTrustAnchors: [
        "home.arpa",
        "10.in-addr.arpa",
        "16.172.in-addr.arpa",
        "17.172.in-addr.arpa",
        "18.172.in-addr.arpa",
        "19.172.in-addr.arpa",
        "20.172.in-addr.arpa",
        "21.172.in-addr.arpa",
        "22.172.in-addr.arpa",
        "23.172.in-addr.arpa",
        "24.172.in-addr.arpa",
        "25.172.in-addr.arpa",
        "26.172.in-addr.arpa",
        "27.172.in-addr.arpa",
        "28.172.in-addr.arpa",
        "29.172.in-addr.arpa",
        "30.172.in-addr.arpa",
        "31.172.in-addr.arpa",
        "170.0.0.192.in-addr.arpa",
        "171.0.0.192.in-addr.arpa",
        "168.192.in-addr.arpa",
        "d.f.ip6.arpa",
        "ipv4only.arpa",
        "resolver.arpa",
        "corp",
        "home",
        "internal",
        "intranet",
        "lan",
        "local",
        "private",
        "test"
      ],
      dnssec: "no",
      dnsOverTLS: "no",
      llmnr: "no",
      mDNS: "yes",
      resolvConfMode: "uplink",
      scopes: [{ protocol: "dns", dnssec: "no", dnsOverTLS: "no" }]
    },
    {
      ifname: "docker0",
      ifindex: 5,
      defaultRoute: false,
      dnssec: "no",
      dnsOverTLS: "no",
      llmnr: "no",
      mDNS: "yes"
    },
    {
      ifname: "eth0",
      ifindex: 3,
      defaultRoute: true,
      servers: [
        {
          addressString: "fd02:adeb:9d7:2e18:2e3a:fdff:feb3:b9e2",
          address: [
            253, 2, 173, 235, 9, 215, 46, 24, 46, 58, 253, 255, 254, 179, 185,
            226
          ],
          family: 10,
          port: 53,
          ifindex: 3,
          accessible: true
        },
        {
          addressString: "2003:fb:f27:1400:2e3a:fdff:feb3:b9e2",
          address: [
            32, 3, 0, 251, 15, 39, 20, 0, 46, 58, 253, 255, 254, 179, 185, 226
          ],
          family: 10,
          port: 53,
          ifindex: 3,
          accessible: true
        }
      ],
      dnssec: "no",
      dnsOverTLS: "no",
      llmnr: "no",
      mDNS: "yes",
      scopes: [
        {
          protocol: "dns",
          ifindex: 3,
          ifname: "eth0",
          dnssec: "no",
          dnsOverTLS: "no"
        },
        { protocol: "mdns", family: 2, ifindex: 3, ifname: "eth0" },
        { protocol: "mdns", family: 10, ifindex: 3, ifname: "eth0" }
      ]
    },
    {
      ifname: "ip6tnl0",
      ifindex: 2,
      defaultRoute: false,
      dnssec: "no",
      dnsOverTLS: "no",
      llmnr: "no",
      mDNS: "yes"
    }
  ]);
});
