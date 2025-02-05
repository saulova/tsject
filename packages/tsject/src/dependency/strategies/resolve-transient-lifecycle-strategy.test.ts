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
import { CanNotConstructDependencyException } from "../../exceptions";

import { ResolveTransientLifecycleStrategy } from "./resolve-transient-lifecycle-strategy";
import { DependencyRegistry, ImplementationDetails } from "..";
import { LifecycleEnum } from "../../enums";
import { TDependencyId } from "../../types";

class MockClass {
  constructor(
    public arg1: string,
    public arg2: string,
  ) {}
}

describe("ResolveTransientLifecycleStrategy", () => {
  let strategy = new ResolveTransientLifecycleStrategy();

  const mockClassConstructorSpy = vi.fn(
    (arg1: string, arg2: string) => new MockClass(arg1, arg2),
  );

  const createMockDependencyRegistry = (
    dependencyId: TDependencyId,
    classConstructorDependenciesIds: TDependencyId[] = [],
  ) => {
    const implementationDetails = new ImplementationDetails(
      mockClassConstructorSpy,
      classConstructorDependenciesIds,
    );

    return new DependencyRegistry(
      dependencyId,
      LifecycleEnum.TRANSIENT,
      implementationDetails,
    );
  };

  afterEach(() => {
    strategy = new ResolveTransientLifecycleStrategy();
    mockClassConstructorSpy.mockRestore();
  });

  describe(".execute", () => {
    it("Should create instance", () => {
      const input = {
        dependencyRegistry: createMockDependencyRegistry("mock-dependency-id", [
          "depId1",
          "depId2",
        ]),
        resolvedClassConstructorDependencies: ["dep1", "dep2"],
      };

      const result = strategy.execute(input);

      expect(result).toBeInstanceOf(MockClass);
      expect(result.arg1).toBe("dep1");
      expect(result.arg2).toBe("dep2");
      expect(mockClassConstructorSpy).toHaveBeenCalledOnce();
    });

    it("Should return a new instance if execute is called twice", () => {
      const input = {
        dependencyRegistry: createMockDependencyRegistry("mock-dependency-id", [
          "depId1",
          "depId2",
        ]),
        resolvedClassConstructorDependencies: ["dep1", "dep2"],
      };

      const firstCallResult = strategy.execute(input);

      input.resolvedClassConstructorDependencies[1] = "dep7";

      const secondCallResult = strategy.execute(input);

      expect(secondCallResult).not.toBe(firstCallResult);
      expect(firstCallResult.arg1).toBe("dep1");
      expect(firstCallResult.arg2).toBe("dep2");
      expect(secondCallResult.arg1).toBe("dep1");
      expect(secondCallResult.arg2).toBe("dep7");
      expect(mockClassConstructorSpy).toHaveBeenCalledTimes(2);
    });

    it("Should throw CanNotConstructDependencyException if neither builder nor classConstructor is provided", () => {
      const input = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.TRANSIENT,
          new ImplementationDetails(),
        ),
        resolvedClassConstructorDependencies: [],
      };

      expect(() => strategy.execute(input)).toThrowError(
        CanNotConstructDependencyException,
      );
    });
  });
});
