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

import {
  DependencyStore,
  DependencyRegistry,
  ImplementationDetails,
} from "../../dependency";
import { TokenStore } from "../../token";
import { MetadataHelper } from "../../helpers";
import { MappedDependency } from "../../mapped-dependency";
import { IHandler } from "../../seedwork";
import { AddDependencyCommandInput } from "./add-dependency-command-input";
import { AddDependencyCommandOutput } from "./add-dependency-command-output";

export class AddDependencyCommandHandler
  implements IHandler<AddDependencyCommandInput, AddDependencyCommandOutput>
{
  constructor(
    private dependencyTokenStore: TokenStore,
    private dependencyStore: DependencyStore,
  ) {}

  public handle(input: AddDependencyCommandInput): AddDependencyCommandOutput {
    const dependencyId =
      this.dependencyTokenStore.retrieveOrCreateDependencyIdByTokens([
        input.dependencyToken,
        input.qualifierToken,
      ]);

    let classConstructorDependenciesTokens: Array<unknown> = [];

    if (input.classConstructor) {
      classConstructorDependenciesTokens =
        MetadataHelper.getConstructorParamsMetadata(input.classConstructor) ||
        [];
    }

    const classConstructorDependenciesIds =
      classConstructorDependenciesTokens.map(
        (classConstructorDependencyToken) => {
          if (classConstructorDependencyToken instanceof MappedDependency) {
            return this.dependencyTokenStore.retrieveOrCreateDependencyIdByTokens(
              [
                classConstructorDependencyToken.dependencyToken,
                classConstructorDependencyToken.qualifierToken,
              ],
            );
          }

          return this.dependencyTokenStore.retrieveOrCreateDependencyIdByTokens(
            [classConstructorDependencyToken],
          );
        },
      );

    const implementationDetails = new ImplementationDetails(
      input.classConstructor,
      classConstructorDependenciesIds,
      input.builder,
      input.instance,
    );

    const registry = new DependencyRegistry(
      dependencyId,
      input.lifecycle,
      implementationDetails,
    );

    this.dependencyStore.addDependency(registry);

    return new AddDependencyCommandOutput(dependencyId);
  }
}
