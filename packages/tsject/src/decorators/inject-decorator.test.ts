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

import { describe, it, expect, vi, afterEach, afterAll } from "vitest";
import { Inject } from "./inject-decorator";
import { injectHelper } from "../helpers";

describe("Inject decorator", () => {
  vi.mock("../helpers", () => ({
    injectHelper: vi.fn(),
  }));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Should call injectHelper with the target and injectable tokens for classes", () => {
    const mockInjectableTokens = ["token1", "token2"];
    const mockTarget = class MockClass {};
    const mockContext = { kind: "class" };

    Inject(...mockInjectableTokens)(mockTarget, mockContext);

    expect(injectHelper).toHaveBeenCalledWith(mockTarget, mockInjectableTokens);
  });

  it("Should throw an error if used on a non-class context", () => {
    const mockInjectableTokens = ["token1", "token2"];
    const mockTarget = {};
    const mockContext = { kind: "method" };

    expect(() =>
      Inject(...mockInjectableTokens)(mockTarget, mockContext),
    ).toThrowError("Inject just work with classes.");
  });

  it("Should do nothing if the target is undefined", () => {
    const mockInjectableTokens = ["token1", "token2"];
    const mockTarget = undefined;
    const mockContext = { kind: "class" };

    expect(() =>
      Inject(...mockInjectableTokens)(mockTarget, mockContext),
    ).not.toThrow();
    expect(injectHelper).not.toHaveBeenCalled();
  });
});
