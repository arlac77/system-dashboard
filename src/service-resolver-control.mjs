import { Service } from "@kronos-integration/service";
import { execa } from "execa";

export function decodeResolverInterfaces(data) {
  const interfaces = [];
  let iface;

  data.split(/\n/).map(line => {
    let m = line.match(/^(\w+)(\s+(\d+))?(\s+\((\w+)\))?$/);
    if (m) {
      let name = m[1];
      if (m[3]) {
        name += ` ${m[3]}`;
      }
      iface = { name, properties: {} };
      if (m[5]) {
        iface.alias = m[5];
      }

      interfaces.push(iface);
    } else {
      m = line.match(/^([\s\w\.]+)\w+: (.*)/);
      if(m) {
        iface.properties[m[1].trim()] = m[2];
      }
    }
  });

  return interfaces;
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
          const p = await execa("resolvectl", [], {
            reject: false
          });
          return decodeResolverInterfaces(p.stdout);
        }
      }
    };
  }
}

export default ServiceResolverControl;
