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

import { describe, it, expect, afterEach } from "vitest";
import { StringTokenTypeChecker } from "./string-token-type-checker";

describe("StringTokenTypeChecker", () => {
  let stringTokenTypeChecker: StringTokenTypeChecker =
    new StringTokenTypeChecker();

  afterEach(() => {
    stringTokenTypeChecker = new StringTokenTypeChecker();
  });

  describe(".execute", () => {
    it("Should return true for a string", () => {
      const result = stringTokenTypeChecker.execute("some string");

      expect(result).toBe(true);
    });

    it("Should return false for a number", () => {
      const result = stringTokenTypeChecker.execute(123);

      expect(result).toBe(false);
    });

    it("Should return false for a boolean", () => {
      const result = stringTokenTypeChecker.execute(true);

      expect(result).toBe(false);
    });

    it("Should return false for an object", () => {
      const result = stringTokenTypeChecker.execute({});

      expect(result).toBe(false);
    });

    it("Should return false for an array", () => {
      const result = stringTokenTypeChecker.execute(["item1", "item2"]);

      expect(result).toBe(false);
    });

    it("Should return false for a symbol", () => {
      const result = stringTokenTypeChecker.execute(Symbol("DI_SomePattern"));

      expect(result).toBe(false);
    });

    it("Should return false for null", () => {
      const result = stringTokenTypeChecker.execute(null);

      expect(result).toBe(false);
    });

    it("Should return false for undefined", () => {
      const result = stringTokenTypeChecker.execute(undefined);

      expect(result).toBe(false);
    });
  });
});
