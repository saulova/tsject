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

import { TDependencyId } from "../types";
import { DependencyRegistry } from "./dependency-registry";
import {
  CyclicDependenciesException,
  MissingDependencyException,
} from "../exceptions";

export class DependencyStore {
  private dependencies: Map<TDependencyId, DependencyRegistry> = new Map();

  public addDependency(registry: DependencyRegistry): void {
    this.dependencies.set(registry.dependencyId, registry);
  }

  public getDependency(dependencyId: TDependencyId): DependencyRegistry {
    const registry = this.dependencies.get(dependencyId);

    if (registry === undefined) {
      throw new MissingDependencyException([dependencyId]);
    }

    return registry;
  }

  private initializeGraphAndDegrees(): {
    graph: Map<TDependencyId, Array<TDependencyId>>;
    inputDegree: Map<TDependencyId, number>;
  } {
    const graph = new Map<TDependencyId, Array<TDependencyId>>();
    const inputDegree = new Map<TDependencyId, number>();

    this.dependencies.forEach((dependencyRegistry, dependencyId) => {
      inputDegree.set(dependencyId, inputDegree.get(dependencyId) ?? 0);

      dependencyRegistry.implementationDetails.classConstructorDependenciesIds.forEach(
        (classConstructorDependencyId) => {
          inputDegree.set(
            classConstructorDependencyId,
            (inputDegree.get(classConstructorDependencyId) ?? 0) + 1,
          );

          if (!graph.has(dependencyId)) {
            graph.set(dependencyId, []);
          }

          graph.get(dependencyId)!.push(classConstructorDependencyId);
        },
      );
    });

    return { graph, inputDegree };
  }

  private performTopologicalSort(
    graph: Map<TDependencyId, Array<TDependencyId>>,
    inputDegree: Map<TDependencyId, number>,
  ): Array<TDependencyId> {
    const queue: Array<TDependencyId> = [];

    inputDegree.forEach((degree, dependencyId) => {
      if (degree === 0) {
        queue.push(dependencyId);
      }
    });

    const sortedList: Array<TDependencyId> = [];

    while (queue.length > 0) {
      const currentItem = queue.shift()!;
      sortedList.push(currentItem);

      if (!graph.has(currentItem)) {
        continue;
      }

      graph.get(currentItem)!.forEach((dependent) => {
        inputDegree.set(dependent, inputDegree.get(dependent)! - 1);

        if (inputDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      });
    }

    return sortedList;
  }

  private detectAndThrowCyclicDependencies(
    graph: Map<TDependencyId, Array<TDependencyId>>,
    inputDegree: Map<TDependencyId, number>,
  ): void {
    const unresolved = Array.from(inputDegree.keys()).filter(
      (dependencyId) =>
        inputDegree.get(dependencyId)! > 0 && graph.get(dependencyId),
    );

    if (unresolved.length > 0) {
      throw new CyclicDependenciesException(unresolved);
    }
  }

  public getSortedDependenciesIds(): Array<TDependencyId> {
    const { graph, inputDegree } = this.initializeGraphAndDegrees();
    const sortedList = this.performTopologicalSort(graph, inputDegree);

    if (sortedList.length !== this.dependencies.size) {
      this.detectAndThrowCyclicDependencies(graph, inputDegree);
    }

    return sortedList.reverse();
  }
}
