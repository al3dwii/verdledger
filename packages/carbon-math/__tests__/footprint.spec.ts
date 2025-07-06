import { describe, expect, it } from "vitest";
import { calculateFootprint } from "../src";
import plan from "../../../testdata/aws-small-plan.json";

describe("footprint maths", () => {
  it("matches golden snapshot", () => {
    const result = calculateFootprint(plan);
    expect(result).toMatchSnapshot();
  });
});
