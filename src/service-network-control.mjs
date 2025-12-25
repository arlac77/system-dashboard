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

/**
 * 
 * @param {string} data 
 * @returns {Array<Object>}
 */
export function decodeNetworkStatus(data) {
  return JSON.parse(data).Interfaces;
}

/**
 * 
 * @param {string} data 
 * @returns {Object}
 */
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
            ["--json=short", "status"],
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
