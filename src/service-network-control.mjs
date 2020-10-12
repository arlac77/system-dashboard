import { Service } from "@kronos-integration/service";
import execa from "execa";

const types = {
  Collisions: { type: "integer" },
  MTU: { type: "integer" },
  "Multicast Packets": { type: "integer" },
  "Rx Bytes": { type: "integer" },
  "Rx Dropped": { type: "integer" },
  "Rx Errors": { type: "integer" },
  "Rx Packets": { type: "integer" },
  "Tx Bytes": { type: "integer" },
  "Tx Dropped": { type: "integer" },
  "Tx Errors": { type: "integer" },
  "Tx Packets": { type: "integer" }
};

export function decodeNetworkStatus(data) {
  const interfaces = [];
  let i;
  data.split(/\n/).map(line => {
    let m = line.match(/^\*?\s+(\d+):\s+(\w+)/);
    if (m) {
      i = { number: parseInt(m[1]), name: m[2] };
      interfaces.push(i);
    } else {
      let m = line.match(/^\s+([^:]+):\s+(.*)/);
      if (m) {
        const type = types[m[1]];

        if (type) {
          switch (type.type) {
            case "integer":
              i[m[1]] = parseInt(m[2].trim());
          }
        } else {
          i[m[1]] = m[2].trim();
        }
      }
    }
  });

  return interfaces;
}

export class ServiceNetworkControl extends Service {
  /**
   * @return {string} 'networkctl'
   */
  static get name() {
    return "networkctl";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      interfaces: {
        default: true,
        receive: async params => {
          const p = await execa(
            "networkctl",
            ["-a", "-s", "status", "--no-legend"],
            {
              reject: false
            }
          );
          return decodeNetworkStatus(p.stdout);
        }
      }
    };
  }
}

export default ServiceNetworkControl;
