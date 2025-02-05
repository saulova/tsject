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
  ClassTokenTypeChecker,
  InterfaceSymbolTokenTypeChecker,
  StringTokenTypeChecker,
  SymbolTokenTypeChecker,
} from "./checkers";

export class TokenTypeResolver {
  private checkers: Map<string, IStrategy<unknown, boolean>> = new Map();

  public setDefaultTokenTypeCheckers(): void {
    this.checkers.set(
      TokenTypeEnum.CLASS_CONSTRUCTOR,
      new ClassTokenTypeChecker(),
    );
    this.checkers.set(
      TokenTypeEnum.INTERFACE_SYMBOL,
      new InterfaceSymbolTokenTypeChecker(),
    );
    this.checkers.set(TokenTypeEnum.STRING, new StringTokenTypeChecker());
    this.checkers.set(TokenTypeEnum.SYMBOL, new SymbolTokenTypeChecker());
  }

  public setTokenTypeChecker(
    tokenType: string,
    tokenTypeChecker: IStrategy<unknown, boolean>,
  ): void {
    this.checkers.set(tokenType, tokenTypeChecker);
  }

  public getTokenType(token: unknown): string {
    for (const [tokenType, tokenTypeChecker] of this.checkers.entries()) {
      if (tokenTypeChecker.execute(token)) {
        return tokenType;
      }
    }

    return "UNKNOWN";
  }
}
