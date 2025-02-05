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

import { MetadataEnum } from "../enums";
import { TClassConstructor } from "../types";

export class MetadataHelper {
  private static setClassMetadataObjectIfNotExist(
    classConstructor: TClassConstructor,
  ) {
    classConstructor[MetadataEnum.CLASS_METADATA] ??= {};
  }

  public static getAllClassMetadata(classConstructor: TClassConstructor) {
    MetadataHelper.setClassMetadataObjectIfNotExist(classConstructor);

    return classConstructor[MetadataEnum.CLASS_METADATA];
  }

  public static getClassMetadata(
    classConstructor: TClassConstructor,
    metadata: symbol,
  ) {
    MetadataHelper.setClassMetadataObjectIfNotExist(classConstructor);

    return classConstructor[MetadataEnum.CLASS_METADATA][metadata];
  }

  public static setClassMetadata(
    classConstructor: TClassConstructor,
    metadata: symbol,
    value: any,
  ) {
    MetadataHelper.setClassMetadataObjectIfNotExist(classConstructor);

    classConstructor[MetadataEnum.CLASS_METADATA][metadata] = value;
  }

  public static getConstructorParamsMetadata(
    classConstructor: TClassConstructor,
  ) {
    return MetadataHelper.getClassMetadata(
      classConstructor,
      MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
    );
  }

  public static getSpecificConstructorParamsMetadata(
    classConstructor: TClassConstructor,
    index: number,
  ) {
    return MetadataHelper.getClassMetadata(
      classConstructor,
      MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
    )?.[index];
  }

  public static setConstructorParamsMetadata(
    classConstructor: TClassConstructor,
    constructorParams: Array<any>,
  ) {
    MetadataHelper.setClassMetadataObjectIfNotExist(classConstructor);

    classConstructor[MetadataEnum.CLASS_METADATA][
      MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA
    ] = constructorParams;
  }

  public static setSpecificConstructorParamsMetadata(
    classConstructor: TClassConstructor,
    index: number,
    constructorParam: any,
  ) {
    MetadataHelper.setClassMetadataObjectIfNotExist(classConstructor);

    if (
      MetadataHelper.getClassMetadata(
        classConstructor,
        MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA,
      ) === undefined
    ) {
      MetadataHelper.setConstructorParamsMetadata(classConstructor, []);
    }

    classConstructor[MetadataEnum.CLASS_METADATA][
      MetadataEnum.CONSTRUCTOR_PARAM_TYPES_METADATA
    ][index] = constructorParam;
  }
}
