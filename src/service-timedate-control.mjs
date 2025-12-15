import { Service } from "@kronos-integration/service";
import { execa } from "execa";

/**
 * 
 * @param {string} data 
 * @returns {Object}
 */
export function decodeTimedate(data) {
  const properties = {};

  data.split(/\n/).map(line => {
    const m = line.match(/^([\w≤\s]+): (.*)/);
    if (m) {
      properties[m[1].trim()] = m[2];
    }
  });

  return properties;
}

export class TimeDateControl extends Service {
  /**
   * @return {string} 'timedatectl'
   */
  static get name() {
    return "timedatectl";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      properties: {
        default: true,
        status: async params => {
          const p = await execa("timedatectl", [], {
            reject: false
          });
          return decodeTimedate(p.stdout);
        }
      }
    };
  }
}

export default TimeDateControl;
