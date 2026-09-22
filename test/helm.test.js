import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertHelmArgs } from "../lib/helm.js";

describe("helm", () => {
  it("allows list", () => assert.deepEqual(assertHelmArgs(["list"]), ["list"]));
  it("blocks install", () => assert.throws(() => assertHelmArgs(["install", "x"]), /not allowed/));
});
