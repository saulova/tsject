/* eslint-disable @typescript-eslint/no-explicit-any */

export type TClassConstructor = (new (...args: Array<any>) => any) &
  Record<symbol | string, any>;
