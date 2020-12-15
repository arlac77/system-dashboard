import { Service } from "@kronos-integration/service";
import execa from "execa";

export class ServiceNamed extends Service {
  /**
   * @return {string} 'named'
   */
  static get name() {
    return "named";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      status: {
        default: true,
        receive: async params => {
          const p = await execa(
            "rndc",
            ["status"]
          );
          return p.stdout;
        }
      }
    };
  }
}

export default ServiceNamed;
