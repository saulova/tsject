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
