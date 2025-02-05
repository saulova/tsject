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

import { TokenTypeEnum } from "../enums/token-type.enum";
import { IStrategy } from "../seedwork";
import {
  ClassTokenNameStrategy,
  InterfaceSymbolTokenNameStrategy,
  StringTokenNameStrategy,
  SymbolTokenNameStrategy,
} from "./strategies";

export class TokenNameResolver {
  private strategies: Map<string, IStrategy<unknown, string>> = new Map();

  public setDefaultTokenNameStrategies(): void {
    this.strategies.set(
      TokenTypeEnum.CLASS_CONSTRUCTOR,
      new ClassTokenNameStrategy(),
    );
    this.strategies.set(
      TokenTypeEnum.INTERFACE_SYMBOL,
      new InterfaceSymbolTokenNameStrategy(),
    );
    this.strategies.set(TokenTypeEnum.STRING, new StringTokenNameStrategy());
    this.strategies.set(TokenTypeEnum.SYMBOL, new SymbolTokenNameStrategy());
  }

  public setTokenNameStrategy(
    tokenType: string,
    tokenNameStrategy: IStrategy<unknown, string>,
  ): void {
    this.strategies.set(tokenType, tokenNameStrategy);
  }

  public getTokenName(token: unknown, tokenType: string): string {
    const strategy = this.strategies.get(tokenType);

    if (strategy === undefined) {
      return "UNKNOWN";
    }

    return strategy.execute(token);
  }
}
