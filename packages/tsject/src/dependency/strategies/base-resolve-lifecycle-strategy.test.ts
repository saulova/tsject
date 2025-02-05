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

import { describe, it, expect, vi } from "vitest";
import { BaseResolveLifecycleStrategy } from "./base-resolve-lifecycle-strategy";
import { CanNotConstructDependencyException } from "../../exceptions";
import { TResolveLifecycleStrategyExecuteInput } from "./types";
import { DependencyRegistry, ImplementationDetails } from "..";
import { LifecycleEnum } from "../../enums";

class MockLifecycleStrategy extends BaseResolveLifecycleStrategy {
  public callProtectedConstruct(input: TResolveLifecycleStrategyExecuteInput) {
    return this.construct(input);
  }

  public execute(input: TResolveLifecycleStrategyExecuteInput) {
    return "executed";
  }
}

const mockBuilder = vi.fn(() => ({ mockKey: "mockValue" }));

class MockClass {
  constructor(
    public arg1: string,
    public arg2: string,
  ) {}
}

describe("BaseResolveLifecycleStrategy", () => {
  describe(".construct", () => {
    it("Should construct an instance using an instance if provided", () => {
      const mockInstance = { mockKey: "mockValue" };

      const input: TResolveLifecycleStrategyExecuteInput = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.SINGLETON,
          new ImplementationDetails(
            undefined,
            undefined,
            undefined,
            mockInstance,
          ),
        ),
        resolvedClassConstructorDependencies: [],
      };

      const strategy = new MockLifecycleStrategy();
      const result = strategy.callProtectedConstruct(input);

      expect(result).toEqual({ mockKey: "mockValue" });
    });

    it("Should construct an instance using a builder if provided", () => {
      const input: TResolveLifecycleStrategyExecuteInput = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.SINGLETON,
          new ImplementationDetails(undefined, undefined, mockBuilder),
        ),
        resolvedClassConstructorDependencies: [],
      };

      const strategy = new MockLifecycleStrategy();
      const result = strategy.callProtectedConstruct(input);

      expect(mockBuilder).toHaveBeenCalledOnce();
      expect(result).toEqual({ mockKey: "mockValue" });
    });

    it("Should construct an instance using classConstructor if builder is not provided", () => {
      const input: TResolveLifecycleStrategyExecuteInput = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.SINGLETON,
          new ImplementationDetails(MockClass),
        ),
        resolvedClassConstructorDependencies: ["arg1Value", "arg2Value"],
      };

      const strategy = new MockLifecycleStrategy();
      const result = strategy.callProtectedConstruct(input);

      expect(result).toBeInstanceOf(MockClass);
      expect(result.arg1).toBe("arg1Value");
      expect(result.arg2).toBe("arg2Value");
    });

    it("Should throw CanNotConstructDependencyException if neither builder nor classConstructor is provided", () => {
      const input: TResolveLifecycleStrategyExecuteInput = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.SINGLETON,
          new ImplementationDetails(),
        ),
        resolvedClassConstructorDependencies: [],
      };

      const strategy = new MockLifecycleStrategy();

      expect(() => strategy.callProtectedConstruct(input)).toThrowError(
        CanNotConstructDependencyException,
      );
    });
  });

  describe(".execute", () => {
    it("Should throw an error if execute is not implemented", () => {
      class UnimplementedStrategy extends BaseResolveLifecycleStrategy {}

      const strategy = new UnimplementedStrategy();

      const input = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.SINGLETON,
          new ImplementationDetails(MockClass),
        ),
        resolvedClassConstructorDependencies: [],
      };

      expect(() => strategy.execute(input)).toThrowError(
        "Method not implemented.",
      );
    });

    it("Should allow derived classes to implement execute method", () => {
      const strategy = new MockLifecycleStrategy();

      const input = {
        dependencyRegistry: new DependencyRegistry(
          "mock-dependency-id",
          LifecycleEnum.SINGLETON,
          new ImplementationDetails(MockClass),
        ),
        resolvedClassConstructorDependencies: [],
      };

      const result = strategy.execute(input);

      expect(result).toBe("executed");
    });
  });
});
