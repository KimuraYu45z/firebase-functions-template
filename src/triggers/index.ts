import { handleHandlers as handleHandlers_ } from "./handle-handlers";
import { isAlready as isAlready_ } from "./is-already";

export namespace Trigger {
  export const path = "triggers";

  export const handleHandlers = handleHandlers_;
  export const isAlready = isAlready_;
}
