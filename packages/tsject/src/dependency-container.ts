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

import {
  AddDependencyCommandHandler,
  AddDependencyCommandInput,
} from "./commands/add-dependency";
import {
  ResolveDependencyCommandHandler,
  ResolveDependencyCommandInput,
  ResolveDependencyCommandOutput,
} from "./commands/resolve-dependency";
import { ResolveSingletonsCommandHandler } from "./commands/resolve-singletons";
import { DependencyResolver } from "./dependency";
import { DependencyStore } from "./dependency";
import { TokenStore, TokenTypeResolver, TokenNameResolver } from "./token";
import { LifecycleEnum } from "./enums";
import { TClassConstructor } from "./types";
import { ExceptionHandler } from "./exceptions";
import { BaseDependencyContainerException } from "./exceptions";

export class DependencyContainer {
  private dependencyTokenStore = new TokenStore();
  private dependencyStore = new DependencyStore();
  private dependencyResolver = new DependencyResolver();
  private dependencyTokenType = new TokenTypeResolver();
  private dependencyTokenName = new TokenNameResolver();
  private exceptionHandler = new ExceptionHandler(
    this.dependencyTokenStore,
    this.dependencyTokenType,
    this.dependencyTokenName,
  );

  private addDependencyCommandHandler = new AddDependencyCommandHandler(
    this.dependencyTokenStore,
    this.dependencyStore,
  );
  private resolveDependencyCommandHandler = new ResolveDependencyCommandHandler(
    this.dependencyTokenStore,
    this.dependencyStore,
    this.dependencyResolver,
  );
  private resolveSingletonsCommandHandler = new ResolveSingletonsCommandHandler(
    this.dependencyStore,
    this.dependencyResolver,
  );

  private isContainerBuilt = false;
  private isBuildRequired = true;
  private dependencyContainerToken: unknown = DependencyContainer;

  constructor(config?: {
    disableDefaultResolveLifecycleStrategies?: boolean;
    disableDefaultTokenTypeCheckers?: boolean;
    disableDefaultTokenNameStrategies?: boolean;
    disableBuildRequired?: boolean;
    customDependencyContainerToken?: unknown;
  }) {
    this.loadConfigs(config);
  }

  private loadConfigs(config?: {
    disableDefaultResolveLifecycleStrategies?: boolean;
    disableDefaultTokenTypeCheckers?: boolean;
    disableDefaultTokenNameStrategies?: boolean;
    disableBuildRequired?: boolean;
    customDependencyContainerToken?: unknown;
  }) {
    if (!config?.disableDefaultResolveLifecycleStrategies) {
      this.dependencyResolver.setDefaultResolveLifecycleStrategies();
    }

    if (!config?.disableDefaultTokenTypeCheckers) {
      this.dependencyTokenType.setDefaultTokenTypeCheckers();
    }

    if (!config?.disableDefaultTokenNameStrategies) {
      this.dependencyTokenName.setDefaultTokenNameStrategies();
    }

    if (config?.disableBuildRequired) {
      this.isBuildRequired = !config?.disableBuildRequired;
    }

    if (config?.customDependencyContainerToken !== undefined) {
      this.dependencyContainerToken = config.customDependencyContainerToken;
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: this.dependencyContainerToken,
      instance: this,
    });
  }

  private exceptionHandlerWrapper<T>(callback: () => any): T {
    try {
      return callback();
    } catch (err) {
      if (err instanceof BaseDependencyContainerException) {
        throw this.exceptionHandler.handle(err);
      }

      throw err;
    }
  }

  public build() {
    this.exceptionHandlerWrapper(() =>
      this.resolveSingletonsCommandHandler.handle(),
    );

    this.isContainerBuilt = true;

    return this;
  }

  private addDependency<TToken, TInstance = TToken>(config: {
    lifecycle: string;
    dependencyToken?: TToken;
    qualifierToken?: unknown;
    classConstructor?: TClassConstructor;
    builder?: () => TInstance;
    instance?: TInstance;
  }) {
    const dependencyToken = config.dependencyToken || config.classConstructor;

    if (dependencyToken === undefined) {
      throw new Error("Invalid configuration, missing dependency token.");
    }

    const addDependencyCommandInput = new AddDependencyCommandInput(
      dependencyToken,
      config.qualifierToken,
      config.lifecycle,
      config.classConstructor,
      config.builder,
      config.instance,
    );

    this.exceptionHandlerWrapper(() =>
      this.addDependencyCommandHandler.handle(addDependencyCommandInput),
    );
  }

  private retrieveDependency(config: {
    dependencyToken?: unknown;
    qualifierToken?: unknown;
  }) {
    if (config?.dependencyToken === undefined) {
      throw new Error("Missing dependency token.");
    }

    if (this.isContainerBuilt === false && this.isBuildRequired === true) {
      throw new Error(
        "Dependency container not initialized. Please call the 'build()' method before attempting to retrieve dependencies.",
      );
    }

    const resolveDependencyCommandInput = new ResolveDependencyCommandInput(
      config.dependencyToken,
      config.qualifierToken,
    );

    const output = this.exceptionHandlerWrapper<ResolveDependencyCommandOutput>(
      () =>
        this.resolveDependencyCommandHandler.handle(
          resolveDependencyCommandInput,
        ),
    );

    return output.dependencyInstance;
  }

  public addSingletonBuilder<TToken, TInstance = TToken>(config: {
    builder: () => TToken;
  }): void;
  public addSingletonBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    builder: () => TToken;
  }): void;
  public addSingletonBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    builder: () => TToken;
  }) {
    if (config.builder === undefined) {
      throw new Error("Invalid configuration, missing builder function.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: config.dependencyToken,
      builder: config.builder,
    });
  }

  public addMappedSingletonBuilder<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    builder: () => TToken;
  }): void;
  public addMappedSingletonBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
    builder: () => TToken;
  }): void;
  public addMappedSingletonBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
    builder: () => TToken;
  }) {
    if (config.qualifierToken === undefined) {
      throw new Error("Invalid configuration, missing qualifier token.");
    }

    if (config.builder === undefined) {
      throw new Error("Invalid configuration, missing builder function.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: config.dependencyToken,
      qualifierToken: config.qualifierToken,
      builder: config.builder,
    });
  }

  public addSingletonInstance<TToken, TInstance = TToken>(config: {
    instance: TToken;
  }): void;
  public addSingletonInstance<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    instance: TToken;
  }): void;
  public addSingletonInstance<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    instance: TInstance;
  }) {
    if (config.instance === undefined) {
      throw new Error("Invalid configuration, missing instance.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: config.dependencyToken,
      instance: config.instance,
    });
  }

  public addMappedSingletonInstance<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    instance: TToken;
  }): void;
  public addMappedSingletonInstance<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
    instance: TToken;
  }): void;
  public addMappedSingletonInstance<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
    instance: TInstance;
  }) {
    if (config.qualifierToken === undefined) {
      throw new Error("Invalid configuration, missing qualifier token.");
    }

    if (config.instance === undefined) {
      throw new Error("Invalid configuration, missing instance.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: config.dependencyToken,
      qualifierToken: config.qualifierToken,
      instance: config.instance,
    });
  }

  public addSingleton<TToken, TInstance = TToken>(): void;
  public addSingleton<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }): void;
  public addSingleton<TToken, TInstance = TToken>(config?: {
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }) {
    if (config?.classConstructor === undefined) {
      throw new Error("Invalid configuration, missing class constructor.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: config.dependencyToken,
      classConstructor: config.classConstructor,
    });
  }

  public addMappedSingleton<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
  }): void;
  public addMappedSingleton<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }): void;
  public addMappedSingleton<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }) {
    if (config.qualifierToken === undefined) {
      throw new Error("Invalid configuration, missing qualifier token.");
    }

    if (config.classConstructor === undefined) {
      throw new Error("Invalid configuration, missing class constructor.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.SINGLETON,
      dependencyToken: config.dependencyToken,
      qualifierToken: config.qualifierToken,
      classConstructor: config.classConstructor,
    });
  }

  public addTransientBuilder<TToken, TInstance = TToken>(config: {
    builder: () => TToken;
  }): void;
  public addTransientBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    builder: () => TToken;
  }): void;
  public addTransientBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    builder: () => TToken;
  }) {
    if (config.builder === undefined) {
      throw new Error("Invalid configuration, missing builder function.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.TRANSIENT,
      dependencyToken: config.dependencyToken,
      builder: config.builder,
    });
  }

  public addMappedTransientBuilder<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    builder: () => TToken;
  }): void;
  public addMappedTransientBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
    builder: () => TToken;
  }): void;
  public addMappedTransientBuilder<TToken, TInstance = TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
    builder: () => TToken;
  }) {
    if (config.qualifierToken === undefined) {
      throw new Error("Invalid configuration, missing qualifier token.");
    }

    if (config.builder === undefined) {
      throw new Error("Invalid configuration, missing builder function.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.TRANSIENT,
      dependencyToken: config.dependencyToken,
      qualifierToken: config.qualifierToken,
      builder: config.builder,
    });
  }

  public addTransient<TToken, TInstance = TToken>(): void;
  public addTransient<TToken, TInstance = TToken>(config?: {
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }): void;
  public addTransient<TToken, TInstance = TToken>(config?: {
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }) {
    if (config?.classConstructor === undefined) {
      throw new Error("Invalid configuration, missing class constructor.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.TRANSIENT,
      dependencyToken: config.dependencyToken,
      classConstructor: config.classConstructor,
    });
  }

  public addMappedTransient<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
  }): void;
  public addMappedTransient<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }): void;
  public addMappedTransient<TToken, TInstance = TToken>(config: {
    qualifierToken: unknown;
    dependencyToken?: TToken extends TClassConstructor ? TToken : unknown;
    classConstructor?: TClassConstructor;
  }) {
    if (config.qualifierToken === undefined) {
      throw new Error("Invalid configuration, missing qualifier token.");
    }

    if (config.classConstructor === undefined) {
      throw new Error("Invalid configuration, missing class constructor.");
    }

    this.addDependency({
      lifecycle: LifecycleEnum.TRANSIENT,
      dependencyToken: config.dependencyToken,
      qualifierToken: config.qualifierToken,
      classConstructor: config.classConstructor,
    });
  }

  public getDependency<TToken>(): TToken extends new (
    ...args: Array<any>
  ) => infer TReturn
    ? TReturn
    : TToken extends symbol
      ? any
      : TToken;
  public getDependency<TToken>(config?: {
    dependencyToken?: TToken;
  }): TToken extends new (...args: Array<any>) => infer TReturn
    ? TReturn
    : TToken extends symbol
      ? any
      : TToken;
  public getDependency<TToken>(config?: {
    dependencyToken?: TToken;
  }): TToken extends new (...args: Array<any>) => infer TReturn
    ? TReturn
    : TToken extends symbol
      ? any
      : TToken {
    return this.retrieveDependency({
      dependencyToken: config?.dependencyToken,
    });
  }

  public getMappedDependency<TToken>(config: {
    qualifierToken: unknown;
  }): TToken extends new (...args: Array<any>) => infer TReturn
    ? TReturn
    : TToken extends symbol
      ? any
      : TToken;
  public getMappedDependency<TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
  }): TToken extends new (...args: Array<any>) => infer TReturn
    ? TReturn
    : TToken extends symbol
      ? any
      : TToken;
  public getMappedDependency<TToken>(config: {
    dependencyToken?: TToken;
    qualifierToken: unknown;
  }): TToken extends new (...args: Array<any>) => infer TReturn
    ? TReturn
    : TToken extends symbol
      ? any
      : TToken {
    if (
      config.dependencyToken === undefined ||
      config.qualifierToken === undefined
    ) {
      throw new Error("Missing dependency or qualifier token.");
    }

    return this.retrieveDependency({
      dependencyToken: config.dependencyToken,
      qualifierToken: config.qualifierToken,
    });
  }
}
