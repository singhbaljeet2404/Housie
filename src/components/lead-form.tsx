import type { ComponentProps } from "react";
import { getSettings } from "@/lib/settings";
import { LeadFormClient } from "./lead-form-client";

type Props = Omit<ComponentProps<typeof LeadFormClient>, "agentName" | "agentLine">;

export async function LeadForm(props: Props) {
  const { agent, brokerage } = await getSettings();
  return <LeadFormClient {...props} agentName={agent.name} agentLine={`${agent.name}, ${agent.title}, ${brokerage.name}`} />;
}
