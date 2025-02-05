/*
 * Copyright 2025 Saulo V. Alvarenga
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CanNotConstructDependencyException } from "../../exceptions";
import { IStrategy } from "../../seedwork";
import { TResolveLifecycleStrategyExecuteInput } from "./types";

export abstract class BaseResolveLifecycleStrategy
  implements IStrategy<TResolveLifecycleStrategyExecuteInput, any>
{
  protected construct(input: TResolveLifecycleStrategyExecuteInput) {
    if (input.dependencyRegistry.implementationDetails.instance !== undefined) {
      return input.dependencyRegistry.implementationDetails.instance;
    }

    if (input.dependencyRegistry.implementationDetails.builder !== undefined) {
      return input.dependencyRegistry.implementationDetails.builder();
    }

    if (
      input.dependencyRegistry.implementationDetails.classConstructor ===
      undefined
    ) {
      throw new CanNotConstructDependencyException([
        input.dependencyRegistry.dependencyId,
      ]);
    }

    return Reflect.construct(
      input.dependencyRegistry.implementationDetails.classConstructor,
      input.resolvedClassConstructorDependencies,
    );
  }

  public execute(input: TResolveLifecycleStrategyExecuteInput): any {
    throw new Error("Method not implemented.");
  }
}
