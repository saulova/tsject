/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectHelper } from "../helpers";

export function Inject(...injectableTokens: Array<any>) {
  return (target: any, context: any) => {
    if (target === undefined) return;

    if (context.kind === "class") {
      injectHelper(target, injectableTokens);

      return;
    }

    throw new Error("Inject just work with classes.");
  };
}
