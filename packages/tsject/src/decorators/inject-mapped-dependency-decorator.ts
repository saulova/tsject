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

import { MetadataHelper } from "../helpers";
import { MappedDependency } from "../mapped-dependency";

export function InjectMappedDependency(
  constructorArgIndex: number,
  qualifierToken: unknown,
) {
  return (target: any, context: ClassDecoratorContext) => {
    if (context.kind === "class") {
      context.addInitializer(function () {
        const dependencyToken =
          MetadataHelper.getSpecificConstructorParamsMetadata(
            target,
            constructorArgIndex,
          );

        if (dependencyToken === undefined) {
          throw new Error("Invalid constructor argument index.");
        }

        MetadataHelper.setSpecificConstructorParamsMetadata(
          target,
          constructorArgIndex,
          new MappedDependency(dependencyToken, qualifierToken),
        );

        Object.assign(
          context.metadata,
          MetadataHelper.getAllClassMetadata(target),
        );
      });

      return;
    }

    throw new Error("Inject just work with classes.");
  };
}
