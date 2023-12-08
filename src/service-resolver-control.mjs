import { Service } from "@kronos-integration/service";
import { execa } from "execa";

export function decodeResolverInterfaces(data) {
  const interfaces = [];
  let iface;

  data.split(/\n/).map(line => {
    let m = line.match(/^([^\(]+)\((\w+)\)|(\w+))$/);
    if (m) {
      iface = { name: m[0] || m[2] };
      interfaces.push(iface);
    } else {
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
