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
