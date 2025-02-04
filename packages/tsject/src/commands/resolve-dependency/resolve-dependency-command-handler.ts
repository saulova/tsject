import { IHandler } from "../../seedwork";
import { TDependencyId } from "../../types";
import { TokenStore } from "../../token";
import { DependencyStore } from "../../dependency";
import { ResolveDependencyCommandInput } from "./resolve-dependency-command-input";
import { ResolveDependencyCommandOutput } from "./resolve-dependency-command-output";
import { DependencyResolver } from "../../dependency";

export class ResolveDependencyCommandHandler
  implements
    IHandler<ResolveDependencyCommandInput, ResolveDependencyCommandOutput>
{
  constructor(
    private dependencyTokenStore: TokenStore,
    private dependencyStore: DependencyStore,
    private dependencyResolver: DependencyResolver,
  ) {}

  private resolveDependency(dependencyId: TDependencyId): unknown {
    const dependencyRegistry = this.dependencyStore.getDependency(dependencyId);

    const classConstructorDependenciesIds =
      dependencyRegistry.implementationDetails.classConstructorDependenciesIds;

    const resolvedClassConstructorDependencies =
      classConstructorDependenciesIds.map((constructorDependencyId) =>
        this.resolveDependency(constructorDependencyId),
      );

    return this.dependencyResolver.resolve(
      dependencyRegistry,
      resolvedClassConstructorDependencies,
    );
  }

  public handle(
    input: ResolveDependencyCommandInput,
  ): ResolveDependencyCommandOutput {
    const dependencyId =
      this.dependencyTokenStore.retrieveOrCreateDependencyIdByTokens([
        input.dependencyToken,
        input.qualifierToken,
      ]);

    const dependencyInstance = this.resolveDependency(dependencyId);

    const output = new ResolveDependencyCommandOutput(dependencyInstance);

    return output;
  }
}
