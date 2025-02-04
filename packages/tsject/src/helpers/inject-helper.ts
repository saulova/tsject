/* eslint-disable @typescript-eslint/no-explicit-any */

import { MetadataHelper } from "../helpers";
import { TClassConstructor } from "../types";

export function injectHelper(
  target: TClassConstructor,
  injectableTokens: Array<any>,
) {
  MetadataHelper.setConstructorParamsMetadata(target, injectableTokens);
}
