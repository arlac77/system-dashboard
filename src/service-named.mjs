import {
  prepareAttributesDefinitions,
  object_attribute,
  private_key_attribute
} from "pacc";
import { Service } from "@kronos-integration/service";
import { execa } from "execa";

export class ServiceNamed extends Service {
  /**
   * @return {string} 'named'
   */
  static get name() {
    return "named";
  }

  static attributes = prepareAttributesDefinitions(
    {
      rndc: {
        ...object_attribute,
        attributes: {
          key: private_key_attribute
        }
      }
    },
    Service.attributes
  );

  static get endpoints() {
    return {
      ...super.endpoints,
      status: {
        default: true,
        receive: async params => {
          const p = await execa("rndc", [
            "-y",
            await this.getCredential("rndc.key"),
            "status"
          ]);
          return p.stdout;
        }
      }
    };
  }
}

export default ServiceNamed;
