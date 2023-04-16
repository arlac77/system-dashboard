import { Service } from "@kronos-integration/service";
import { execa } from "execa";

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
  let iface;
  data.split(/\n/).map(line => {
    let m = line.match(/^[^\s]+\s+(\d+):\s+([^\s+]+)/);
    if (m) {
      iface = { number: parseInt(m[1]), name: m[2] };
      interfaces.push(iface);
    } else {
      let m = line.match(/^\s+([^:]+):\s+(.*)/);
      if (m) {
        const type = types[m[1]];

        if (type) {
          switch (type.type) {
            case "integer":
              iface[m[1]] = parseInt(m[2].trim());
          }
        } else {
          iface[m[1]] = m[2].trim();
        }
      }
    }
  });

  return interfaces;
}

export function decodeNetworkNeighburs(data) {
  return data
    .split(/\n/)
    .filter(line => line.length > 0)
    .map(line => {
      const columns = line.split(/\s+/);
      return {
        address: columns[0],
        device: columns[2],
        hwaddr: columns[4],
        state: columns[columns.length - 1]
      };
    });
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
      },
      neighbours: {
        default: true,
        receive: async params => {
          const p = await execa("ip", ["neighbour"], {
            reject: false
          });
          return decodeNetworkNeighburs(p.stdout);
        }
      }
    };
  }
}

export default ServiceNetworkControl;
