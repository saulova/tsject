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
import { InjectMappedDependency } from "./inject-mapped-dependency-decorator";
import { MetadataHelper } from "../helpers";
import { MappedDependency } from "../mapped-dependency";

describe("InjectMappedDependency decorator", () => {
  vi.mock("../helpers", () => ({
    MetadataHelper: {
      getSpecificConstructorParamsMetadata: vi.fn(),
      setSpecificConstructorParamsMetadata: vi.fn(),
      getAllClassMetadata: vi.fn(),
    },
  }));

  const addInitializerSpy = vi.fn();
  const mockContext = {
    kind: "class",
    addInitializer: addInitializerSpy,
    metadata: {},
  } as unknown as ClassDecoratorContext<abstract new (...args: any) => any>;
  const mockTarget = {};

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Should add an initializer and set mapped dependency metadata", () => {
    const constructorArgIndex = 0;
    const qualifierToken = "qualifier-token";
    const dependencyToken = "dependency-token";

    (
      MetadataHelper.getSpecificConstructorParamsMetadata as any
    ).mockReturnValue(dependencyToken);
    (MetadataHelper.getAllClassMetadata as any).mockReturnValue({
      classMeta: "metaData",
    });

    InjectMappedDependency(constructorArgIndex, qualifierToken)(
      mockTarget,
      mockContext,
    );

    expect(addInitializerSpy).toHaveBeenCalled();

    const initializerFn = addInitializerSpy.mock.calls[0][0];
    initializerFn();

    expect(
      MetadataHelper.getSpecificConstructorParamsMetadata,
    ).toHaveBeenCalledWith(mockTarget, constructorArgIndex);
    expect(
      MetadataHelper.setSpecificConstructorParamsMetadata,
    ).toHaveBeenCalledWith(
      mockTarget,
      constructorArgIndex,
      new MappedDependency(dependencyToken, qualifierToken),
    );
    expect(MetadataHelper.getAllClassMetadata).toHaveBeenCalledWith(mockTarget);
    expect(mockContext.metadata).toEqual({ classMeta: "metaData" });
  });

  it("Should throw an error for an invalid constructor argument index", () => {
    const constructorArgIndex = 1;
    const qualifierToken = "qualifier-token";

    (
      MetadataHelper.getSpecificConstructorParamsMetadata as any
    ).mockReturnValue(undefined);

    InjectMappedDependency(constructorArgIndex, qualifierToken)(
      mockTarget,
      mockContext,
    );

    const initializerFn = addInitializerSpy.mock.calls[0][0];

    expect(() => initializerFn()).toThrowError(
      "Invalid constructor argument index.",
    );
  });

  it("Should throw an error if used on a non-class context", () => {
    const constructorArgIndex = 0;
    const qualifierToken = "qualifier-token";
    const mockInvalidContext = {
      kind: "method",
    } as unknown as ClassDecoratorContext;

    expect(() =>
      InjectMappedDependency(constructorArgIndex, qualifierToken)(
        mockTarget,
        mockInvalidContext,
      ),
    ).toThrowError("Inject just work with classes.");
  });
});
