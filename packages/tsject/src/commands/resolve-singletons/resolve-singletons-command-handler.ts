import { IHandler } from "../../seedwork";
import { DependencyRegistry, DependencyStore } from "../../dependency";
import { DependencyResolver } from "../../dependency";

import { LifecycleEnum } from "../../enums";

export class ResolveSingletonsCommandHandler
  implements IHandler<undefined, void>
{
  constructor(
    private dependencyStore: DependencyStore,
    private dependencyResolver: DependencyResolver,
  ) {}

  private resolveDependency(dependencyRegistry: DependencyRegistry): unknown {
    const classConstructorDependenciesIds =
      dependencyRegistry.implementationDetails.classConstructorDependenciesIds;

    const resolvedClassConstructorDependencies =
      classConstructorDependenciesIds.map((constructorDependencyId) => {
        const constructorDependencyRegistry =
          this.dependencyStore.getDependency(constructorDependencyId);
        return this.resolveDependency(constructorDependencyRegistry);
      });

    return this.dependencyResolver.resolve(
      dependencyRegistry,
      resolvedClassConstructorDependencies,
    );
  }

  public handle() {
    const sortedDependencies = this.dependencyStore.getSortedDependenciesIds();

    sortedDependencies.forEach((dependencyId) => {
      const dependencyRegistry =
        this.dependencyStore.getDependency(dependencyId);

      if (dependencyRegistry.lifecycle === LifecycleEnum.SINGLETON) {
        this.resolveDependency(dependencyRegistry);
      }
    });
  }
}
