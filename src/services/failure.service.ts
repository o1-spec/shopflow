import { FailureRule } from "@/models/FailureRule";

export async function shouldFail(key: string): Promise<boolean> {
  const rule = await FailureRule.findOne({
    key,
    enabled: true,
  });

  if (!rule) {
    return false;
  }

  return Math.random() <= rule.probability;
}
