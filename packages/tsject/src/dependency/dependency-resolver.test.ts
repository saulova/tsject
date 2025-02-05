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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DependencyResolver } from "./dependency-resolver";
import { LifecycleEnum } from "../enums";
import { InvalidLifecycleException } from "../exceptions";

import {
  ResolveSingletonLifecycleStrategy,
  ResolveTransientLifecycleStrategy,
  BaseResolveLifecycleStrategy,
} from "./strategies";

import { DependencyRegistry } from "./dependency-registry";
import { ImplementationDetails } from ".";

class MockClass {
  constructor() {}
}

describe("DependencyResolver", () => {
  let dependencyResolver: DependencyResolver;

  const createMockDependencyRegistry = () => {
    const implementationDetails = new ImplementationDetails(MockClass, []);

    return new DependencyRegistry(
      "mock-dependency-id",
      LifecycleEnum.SINGLETON,
      implementationDetails,
    );
  };

  beforeEach(() => {
    dependencyResolver = new DependencyResolver();
  });

  describe(".setDefaultResolveLifecycleStrategies", () => {
    it("Should set default lifecycle strategies", () => {
      dependencyResolver.setDefaultResolveLifecycleStrategies();

      const singletonStrategy = dependencyResolver["strategies"].get(
        LifecycleEnum.SINGLETON,
      );
      const transientStrategy = dependencyResolver["strategies"].get(
        LifecycleEnum.TRANSIENT,
      );

      expect(singletonStrategy).toBeInstanceOf(
        ResolveSingletonLifecycleStrategy,
      );
      expect(transientStrategy).toBeInstanceOf(
        ResolveTransientLifecycleStrategy,
      );
    });
  });

  describe(".addResolveLifecycleStrategy", () => {
    it("Should allow adding custom lifecycle strategies", () => {
      const mockStrategy = {
        execute: vi.fn(),
      } as unknown as BaseResolveLifecycleStrategy;

      dependencyResolver.addResolveLifecycleStrategy("CUSTOM", mockStrategy);

      const customStrategy = dependencyResolver["strategies"].get("CUSTOM");

      expect(customStrategy).toBe(mockStrategy);
    });
  });

  describe(".resolve", () => {
    it("Should resolve dependencies using the appropriate lifecycle strategy", () => {
      const dependencyRegistry = createMockDependencyRegistry();
      const mockDependencies = ["dep1", "dep2"];

      const singletonStrategy = new ResolveSingletonLifecycleStrategy();
      const executeSpy = vi
        .spyOn(singletonStrategy, "execute")
        .mockReturnValue({ instance: "singleton-resolved" });

      dependencyResolver.addResolveLifecycleStrategy(
        LifecycleEnum.SINGLETON,
        singletonStrategy,
      );

      const result = dependencyResolver.resolve(
        dependencyRegistry,
        mockDependencies,
      );

      expect(executeSpy).toHaveBeenCalledWith({
        dependencyRegistry: dependencyRegistry,
        resolvedClassConstructorDependencies: mockDependencies,
      });
      expect(result).toEqual({ instance: "singleton-resolved" });
    });

    it("Should throw InvalidLifecycleException for unsupported lifecycles", () => {
      const mockRegistry = {
        dependencyId: "mock-id",
        lifecycle: "UNSUPPORTED",
      } as DependencyRegistry;

      expect(() => dependencyResolver.resolve(mockRegistry, [])).toThrowError(
        InvalidLifecycleException,
      );
    });
  });
});
