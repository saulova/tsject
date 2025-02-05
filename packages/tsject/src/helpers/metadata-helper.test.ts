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

import { describe, it, expect, beforeEach } from "vitest";
import { MetadataHelper } from "./metadata-helper";
import { MetadataEnum } from "../enums";

class MockClass {}

class MockDep1 {}
class MockDep2 {}

class MockClassWithDependencies {
  constructor(dep1: MockDep1, dep2: MockDep2) {}
}

describe("MetadataHelper", () => {
  beforeEach(() => {
    delete (MockClass as any)[MetadataEnum.CLASS_METADATA];
    delete (MockClassWithDependencies as any)[MetadataEnum.CLASS_METADATA];
  });

  describe(".getAllClassMetadata", () => {
    it("Should initialize and return an empty metadata object if none exists", () => {
      const result = MetadataHelper.getAllClassMetadata(MockClass);

      expect(result).toEqual({});
      expect((MockClass as any)[MetadataEnum.CLASS_METADATA]).toEqual({});
    });

    it("Should return the existing class metadata", () => {
      (MockClass as any)[MetadataEnum.CLASS_METADATA] = { existing: "data" };

      const result = MetadataHelper.getAllClassMetadata(MockClass);

      expect(result).toEqual({ existing: "data" });
    });
  });

  describe(".getClassMetadata", () => {
    it("Should return undefined if no metadata is set", () => {
      const result = MetadataHelper.getClassMetadata(
        MockClass,
        MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
      );

      expect(result).toBeUndefined();
    });

    it("Should retrieve existing metadata", () => {
      (MockClass as any)[MetadataEnum.CLASS_METADATA] = {
        [MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]: [MockDep1, MockDep2],
      };

      const result = MetadataHelper.getClassMetadata(
        MockClass,
        MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
      );

      expect(result).toEqual([MockDep1, MockDep2]);
    });
  });

  describe(".setClassMetadata", () => {
    it("Should set metadata for a specific key on the class", () => {
      MetadataHelper.setClassMetadata(
        MockClass,
        MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
        [MockDep1, MockDep2],
      );

      const metadata = (MockClass as any)[MetadataEnum.CLASS_METADATA];
      expect(metadata[MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]).toEqual([
        MockDep1,
        MockDep2,
      ]);
    });

    it("Should not overwrite other metadata keys", () => {
      const testMetadata = Symbol.for("test_metadata");

      MetadataHelper.setClassMetadata(MockClass, testMetadata, {
        otherKey: "value",
      });

      MetadataHelper.setClassMetadata(
        MockClass,
        MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
        [MockDep1, MockDep2],
      );

      const metadata = (MockClass as any)[MetadataEnum.CLASS_METADATA];
      expect(metadata).toEqual({
        [testMetadata]: { otherKey: "value" },
        [MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]: [MockDep1, MockDep2],
      });
    });
  });

  describe(".getConstructorParamsMetadata", () => {
    it("Should retrieve constructor parameter metadata if set", () => {
      MetadataHelper.setConstructorParamsMetadata(MockClass, [
        MockDep1,
        MockDep2,
      ]);

      const result = MetadataHelper.getConstructorParamsMetadata(MockClass);

      expect(result).toEqual([MockDep1, MockDep2]);
    });

    it("Should return undefined if constructor parameter metadata is not set", () => {
      const result = MetadataHelper.getConstructorParamsMetadata(
        MockClassWithDependencies,
      );

      expect(result).toBeUndefined();
    });
  });

  describe(".getSpecificConstructorParamsMetadata", () => {
    it("Should retrieve metadata for a specific constructor parameter index", () => {
      MetadataHelper.setConstructorParamsMetadata(MockClass, [
        MockDep1,
        MockDep2,
      ]);

      const result = MetadataHelper.getSpecificConstructorParamsMetadata(
        MockClass,
        1,
      );

      expect(result).toBe(MockDep2);
    });

    it("Should return undefined if metadata for the index is not set", () => {
      MetadataHelper.setConstructorParamsMetadata(MockClass, [MockDep1]);

      const result = MetadataHelper.getSpecificConstructorParamsMetadata(
        MockClass,
        5,
      );

      expect(result).toBeUndefined();
    });
  });

  describe(".setConstructorParamsMetadata", () => {
    it("Should set constructor parameter metadata on the class", () => {
      MetadataHelper.setConstructorParamsMetadata(MockClassWithDependencies, [
        MockDep1,
        MockDep2,
      ]);

      const metadata = (MockClassWithDependencies as any)[
        MetadataEnum.CLASS_METADATA
      ];

      expect(metadata).toEqual({
        [MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]: [MockDep1, MockDep2],
      });
    });

    it("Should not overwrite unrelated metadata", () => {
      (MockClassWithDependencies as any)[MetadataEnum.CLASS_METADATA] = {
        unrelatedMetadata: "test",
      };

      MetadataHelper.setConstructorParamsMetadata(MockClassWithDependencies, [
        MockDep1,
        MockDep2,
      ]);

      const metadata = (MockClassWithDependencies as any)[
        MetadataEnum.CLASS_METADATA
      ];

      expect(metadata).toEqual({
        unrelatedMetadata: "test",
        [MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]: [MockDep1, MockDep2],
      });
    });
  });

  describe(".setSpecificConstructorParamsMetadata", () => {
    it("Should set metadata for a specific constructor parameter index", () => {
      MetadataHelper.setConstructorParamsMetadata(MockClass, [
        MockDep1,
        MockDep2,
      ]);

      MetadataHelper.setSpecificConstructorParamsMetadata(
        MockClass,
        1,
        "NewDep",
      );

      const metadata = (MockClass as any)[MetadataEnum.CLASS_METADATA];
      expect(metadata[MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]).toEqual([
        MockDep1,
        "NewDep",
      ]);
    });

    it("Should initialize metadata array if it doesn't exist", () => {
      MetadataHelper.setSpecificConstructorParamsMetadata(
        MockClass,
        0,
        MockDep1,
      );

      const metadata = (MockClass as any)[MetadataEnum.CLASS_METADATA];
      expect(metadata[MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA]).toEqual([
        MockDep1,
      ]);
    });
  });
});
