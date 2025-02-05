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
