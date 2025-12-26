import { Service } from "@kronos-integration/service";
import { execa } from "execa";

/**
 *
 * @param {string} data
 * @returns {Array<Object>}
 */
export function decodeResolver(data) {
  return JSON.parse(data);
}

export class ServiceResolverControl extends Service {
  /**
   * @return {string} 'resolvectl'
   */
  static get name() {
    return "resolvectl";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      status: {
        default: true,
        status: async params => {
          const p = await execa("resolvectl", ["status", "--json=short"], {
            reject: false
          });
          return decodeResolver(p.stdout);
        }
      },
      statistics: {
        default: true,
        status: async params => {
          const p = await execa("resolvectl", ["statistics", "--json=short"], {
            reject: false
          });
          return decodeResolver(p.stdout);
        }
      },
      "show-cache": {
        default: true,
        status: async params => {
          const p = await execa("resolvectl", ["show-cache", "--json=short"], {
            reject: false
          });
          return decodeResolver(p.stdout);
        }
      },
      "show-server-state": {
        default: true,
        status: async params => {
          const p = await execa(
            "resolvectl",
            ["show-server-state", "--json=short"],
            {
              reject: false
            }
          );
          return decodeResolver(p.stdout);
        }
      }
    };
  }
}

export default ServiceResolverControl;
