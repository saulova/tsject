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
import { ClassTokenTypeChecker } from "./class-token-type-checker";

describe("ClassTokenTypeChecker", () => {
  let classTokenTypeChecker: ClassTokenTypeChecker =
    new ClassTokenTypeChecker();

  afterEach(() => {
    classTokenTypeChecker = new ClassTokenTypeChecker();
  });

  describe(".execute", () => {
    it("Should return true for a class constructor function", () => {
      class MyClass {}
      const result = classTokenTypeChecker.execute(MyClass);

      expect(result).toBe(true);
    });

    it("Should return false for a regular function", () => {
      const myFunction = () => {};
      const result = classTokenTypeChecker.execute(myFunction);

      expect(result).toBe(false);
    });

    it("Should return false for undefined", () => {
      const result = classTokenTypeChecker.execute(undefined);

      expect(result).toBe(false);
    });

    it("Should return false for null", () => {
      const result = classTokenTypeChecker.execute(null);

      expect(result).toBe(false);
    });

    it("Should return false for an object that is not a function", () => {
      const result = classTokenTypeChecker.execute({});

      expect(result).toBe(false);
    });

    it("Should return false for a primitive value", () => {
      const result = classTokenTypeChecker.execute(42);

      expect(result).toBe(false);
    });

    it("Should return false for an arrow function", () => {
      const arrowFunction = () => {};
      const result = classTokenTypeChecker.execute(arrowFunction);

      expect(result).toBe(false);
    });

    it("Should return true for a class with a constructor", () => {
      class AnotherClass {
        constructor(private value: number) {}
      }
      const result = classTokenTypeChecker.execute(AnotherClass);

      expect(result).toBe(true);
    });
  });
});
