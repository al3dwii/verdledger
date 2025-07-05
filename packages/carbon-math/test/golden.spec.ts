import { describe, expect, it } from "vitest";
import { calculateFootprint } from "../src";
import fs from "node:fs";
import path from "node:path";

const plan = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../testdata/aws-plan.json"), "utf8")
);

describe("footprint maths", () => {
  it("matches golden snapshot", () => {
    const result = calculateFootprint(plan);
    expect(result).toMatchSnapshot();
  });
});
