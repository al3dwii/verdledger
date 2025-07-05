export interface Plan {
  resources: Array<{name: string}>;
}

export function calculateFootprint(plan: Plan) {
  return {
    resourceCount: plan.resources.length,
  };
}
