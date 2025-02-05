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
import { InterfaceSymbolTokenTypeChecker } from "./interface-symbol-token-type-checker";

describe("InterfaceSymbolTokenTypeChecker", () => {
  let interfaceSymbolTokenTypeChecker: InterfaceSymbolTokenTypeChecker =
    new InterfaceSymbolTokenTypeChecker();

  afterEach(() => {
    interfaceSymbolTokenTypeChecker = new InterfaceSymbolTokenTypeChecker();
  });

  describe(".execute", () => {
    it("Should return true for a symbol with an interface description format", () => {
      const validSymbol = Symbol("DI_SomePattern_AnotherPattern");

      const result = interfaceSymbolTokenTypeChecker.execute(validSymbol);

      expect(result).toBe(true);
    });

    it("Should return false for a symbol without the interface description format", () => {
      const invalidSymbol = Symbol("NotMatchingPattern");

      const result = interfaceSymbolTokenTypeChecker.execute(invalidSymbol);

      expect(result).toBe(false);
    });

    it("Should return false for a symbol without any description", () => {
      const symbolWithoutDescription = Symbol();

      const result = interfaceSymbolTokenTypeChecker.execute(
        symbolWithoutDescription,
      );

      expect(result).toBe(false);
    });

    it("Should return false for a non-symbol value", () => {
      const notSymbol = 42;

      const result = interfaceSymbolTokenTypeChecker.execute(notSymbol);

      expect(result).toBe(false);
    });

    it("Should return false for an object instead of symbol", () => {
      const obj = {};

      const result = interfaceSymbolTokenTypeChecker.execute(obj);

      expect(result).toBe(false);
    });

    it("Should return false for a string", () => {
      const notSymbol = "DI_SomePattern_AnotherPattern";

      const result = interfaceSymbolTokenTypeChecker.execute(notSymbol);

      expect(result).toBe(false);
    });

    it("Should return false for undefined", () => {
      const result = interfaceSymbolTokenTypeChecker.execute(undefined);

      expect(result).toBe(false);
    });

    it("Should return false for null", () => {
      const result = interfaceSymbolTokenTypeChecker.execute(null);

      expect(result).toBe(false);
    });
  });
});
