import test from "ava";
import { readFile } from "node:fs/promises";
import { decodeResolverInterfaces } from "../src/service-resolver-control.mjs";

test("netowkctl status", async t => {
  const interfaces = decodeResolverInterfaces(
    await readFile(new URL("fixtures/resolvectl", import.meta.url).pathname, {
      encoding: "utf8"
    })
  );

  t.deepEqual(interfaces, [
    {
      name: "Global",
      properties: {
        "Current DNS Serve": "10.0.0.20",
        "DNS Domai": "mf.de",
        "DNS Server": "10.0.0.20",
        "Fallback DNS Server":
          "10.0.0.21 1.1.1.1 8.8.8.8 9.9.9.10 2606:4700:4700::1111 2620:fe::10 2001:4860:4860::8888",
        Protocol: "+LLMNR +mDNS -DNSOverTLS DNSSEC=no/unsupported",
        "resolv.conf mod": "uplink"
      }
    },
    {
      name: "Link 2",
      alias: "ip6tnl0",
      properties: {
        "Current Scope": "none",
        Protocol: "-DefaultRoute +LLMNR +mDNS -DNSOverTLS DNSSEC=no/unsupported"
      }
    },
    {
      name: "Link 3",
      alias: "net0",
      properties: {
        "Current DNS Serve": "fd02:adeb:9d7:2e18:2e3a:fdff:abab:abab",
        "Current Scope": "DNS LLMNR/IPv4 LLMNR/IPv6",
        "DNS Domai": "mf.de",
        "DNS Server":
          "fd02:adeb:9d7:2e18:2e3a:fdff:abab:abab 2003:fb:f47:8a00:2e3a:fdff:abab:abab",
        Protocol: "+DefaultRoute +LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported"
      }
    },
    {
      name: "Link 81",
      alias: "docker0",
      properties: {
        "Current Scope": "none",
        Protocol: "-DefaultRoute +LLMNR +mDNS -DNSOverTLS DNSSEC=no/unsupported"
      }
    }
  ]);
});
