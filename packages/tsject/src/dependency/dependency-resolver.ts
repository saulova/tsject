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

import { LifecycleEnum } from "../enums";
import { InvalidLifecycleException } from "../exceptions";

import {
  ResolveSingletonLifecycleStrategy,
  ResolveTransientLifecycleStrategy,
} from "./strategies";
import { BaseResolveLifecycleStrategy } from "./strategies";
import { DependencyRegistry } from ".";

export class DependencyResolver {
  private strategies: Map<string, BaseResolveLifecycleStrategy> = new Map();

  public setDefaultResolveLifecycleStrategies() {
    this.strategies.set(
      LifecycleEnum.SINGLETON,
      new ResolveSingletonLifecycleStrategy(),
    );
    this.strategies.set(
      LifecycleEnum.TRANSIENT,
      new ResolveTransientLifecycleStrategy(),
    );
  }

  public addResolveLifecycleStrategy(
    lifecycle: string,
    strategy: BaseResolveLifecycleStrategy,
  ) {
    this.strategies.set(lifecycle, strategy);
  }

  private useLifecycleStrategy(
    dependencyRegistry: DependencyRegistry,
    resolvedClassConstructorDependencies: Array<unknown>,
  ) {
    const strategy = this.strategies.get(dependencyRegistry.lifecycle);

    if (strategy === undefined) {
      throw new InvalidLifecycleException(
        [dependencyRegistry.dependencyId],
        dependencyRegistry.lifecycle,
      );
    }

    return strategy.execute({
      dependencyRegistry,
      resolvedClassConstructorDependencies,
    });
  }

  public resolve(
    dependencyRegistry: DependencyRegistry,
    resolvedClassConstructorDependencies: Array<unknown>,
  ): unknown {
    return this.useLifecycleStrategy(
      dependencyRegistry,
      resolvedClassConstructorDependencies,
    );
  }
}
