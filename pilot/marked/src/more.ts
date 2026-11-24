import { Base } from "./base";

export interface Stage extends Base { // @T12
  retries: number;
}

class StageRunner {}
