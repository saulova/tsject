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

import { describe, it, expect, vi, afterEach } from "vitest";
import { ResolveDependencyCommandHandler } from "./resolve-dependency-command-handler";
import { DependencyResolver } from "../../dependency";
import { ResolveDependencyCommandInput } from "./resolve-dependency-command-input";
import { ResolveDependencyCommandOutput } from "./resolve-dependency-command-output";
import {
  DependencyStore,
  DependencyRegistry,
  ImplementationDetails,
} from "../../dependency";
import { LifecycleEnum } from "../../enums";
import { TokenStore } from "../../token";

class MockClass {}

describe("ResolveDependencyCommandHandler", () => {
  const dependencyTokenStoreMock: TokenStore = {
    retrieveOrCreateDependencyIdByTokens: vi.fn(),
  } as any;
  const dependencyStoreMock: DependencyStore = {
    getDependency: vi.fn(),
  } as any;
  const dependencyResolverMock: DependencyResolver = {
    resolve: vi.fn(),
  } as any;
  const resolveDependencyCommandHandler: ResolveDependencyCommandHandler =
    new ResolveDependencyCommandHandler(
      dependencyTokenStoreMock,
      dependencyStoreMock,
      dependencyResolverMock,
    );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(".handle", () => {
    it("Should resolve a dependency and return the ResolveDependencyCommandOutput", () => {
      const dependencyToken = "mock-token";
      const qualifierToken = "mock-qualifier";
      const dependencyId = "mock-dependency-id";

      const input = new ResolveDependencyCommandInput(
        dependencyToken,
        qualifierToken,
      );

      const implementationDetails = new ImplementationDetails(MockClass);
      const dependencyRegistry = new DependencyRegistry(
        dependencyId,
        LifecycleEnum.SINGLETON,
        implementationDetails,
      );

      vi.spyOn(
        dependencyTokenStoreMock,
        "retrieveOrCreateDependencyIdByTokens",
      ).mockReturnValue(dependencyId);
      vi.spyOn(dependencyStoreMock, "getDependency").mockReturnValue(
        dependencyRegistry,
      );
      vi.spyOn(dependencyResolverMock, "resolve").mockReturnValue({
        instance: "mockResolvedInstance",
      });

      const result = resolveDependencyCommandHandler.handle(input);

      expect(
        dependencyTokenStoreMock.retrieveOrCreateDependencyIdByTokens,
      ).toHaveBeenCalledOnce();
      expect(
        dependencyTokenStoreMock.retrieveOrCreateDependencyIdByTokens,
      ).toHaveBeenCalledWith([dependencyToken, qualifierToken]);

      expect(dependencyStoreMock.getDependency).toHaveBeenCalledOnce();
      expect(dependencyStoreMock.getDependency).toHaveBeenCalledWith(
        dependencyId,
      );

      expect(dependencyResolverMock.resolve).toHaveBeenCalledOnce();
      expect(result).toBeInstanceOf(ResolveDependencyCommandOutput);
      expect(result.dependencyInstance).toEqual({
        instance: "mockResolvedInstance",
      });
    });

    it("Should resolve dependencies recursively based on classConstructorDependenciesIds", () => {
      const dependencyToken = "mock-parent-token";
      const qualifierToken = "mock-parent-qualifier";
      const parentDependencyId = "mock-parent-id";
      const childDependencyId = "mock-child-id";

      const input = new ResolveDependencyCommandInput(
        dependencyToken,
        qualifierToken,
      );

      const childDependencyRegistry = new DependencyRegistry(
        childDependencyId,
        LifecycleEnum.TRANSIENT,
        new ImplementationDetails(MockClass, []),
      );

      const parentImplementationDetails = new ImplementationDetails(MockClass, [
        childDependencyId,
      ]);

      const parentDependencyRegistry = new DependencyRegistry(
        parentDependencyId,
        LifecycleEnum.SINGLETON,
        parentImplementationDetails,
      );

      vi.spyOn(
        dependencyTokenStoreMock,
        "retrieveOrCreateDependencyIdByTokens",
      ).mockReturnValue(parentDependencyId);

      vi.spyOn(dependencyStoreMock, "getDependency").mockImplementation(
        (id) => {
          if (id === parentDependencyId) return parentDependencyRegistry;
          if (id === childDependencyId) return childDependencyRegistry;
          throw new Error();
        },
      );

      const resolveChildResult = { instance: "childInstance" };
      const resolveParentResult = { instance: "parentInstance" };

      vi.spyOn(dependencyResolverMock, "resolve").mockImplementation(
        (registry) => {
          if (registry === childDependencyRegistry) return resolveChildResult;
          if (registry === parentDependencyRegistry) return resolveParentResult;
          return null;
        },
      );

      const result = resolveDependencyCommandHandler.handle(input);

      expect(
        dependencyTokenStoreMock.retrieveOrCreateDependencyIdByTokens,
      ).toHaveBeenCalledOnce();
      expect(dependencyStoreMock.getDependency).toHaveBeenCalledWith(
        parentDependencyId,
      );
      expect(dependencyStoreMock.getDependency).toHaveBeenCalledWith(
        childDependencyId,
      );

      expect(dependencyResolverMock.resolve).toHaveBeenCalledWith(
        childDependencyRegistry,
        [],
      );
      expect(dependencyResolverMock.resolve).toHaveBeenCalledWith(
        parentDependencyRegistry,
        [resolveChildResult],
      );

      expect(result).toBeInstanceOf(ResolveDependencyCommandOutput);
      expect(result.dependencyInstance).toEqual(resolveParentResult);
    });
  });
});
