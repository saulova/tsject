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

import { describe, it, expect } from "vitest";
import { StringTokenNameStrategy } from "./string-token-name-strategy";

describe("StringTokenNameStrategy", () => {
  describe(".execute", () => {
    it("Should return the token if it is a non-empty string", () => {
      const strategy = new StringTokenNameStrategy();

      expect(strategy.execute("StringDependencyName")).toBe(
        "StringDependencyName",
      );
    });

    it("Should return 'Empty String' if the token is an empty string", () => {
      const strategy = new StringTokenNameStrategy();

      expect(strategy.execute("")).toBe("Empty String");
    });
  });
});
