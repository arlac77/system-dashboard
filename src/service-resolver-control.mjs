import { Service } from "@kronos-integration/service";
import { execa } from "execa";

/**
 * 
 * @param {string} data 
 * @returns {Array<Object>}
 */
export function decodeResolverInterfaces(data) {
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
      interfaces: {
        default: true,
        status: async params => {
          const p = await execa("resolvectl", ["--json=short"], {
            reject: false
          });
          return decodeResolverInterfaces(p.stdout);
        }
      }
    };
  }
}

export default ServiceResolverControl;
