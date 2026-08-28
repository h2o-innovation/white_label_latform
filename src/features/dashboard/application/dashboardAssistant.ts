import { z } from "zod";
import type { FormEntry } from "../../forms/infrastructure/formEntriesStore";
import type { FormCategory } from "../../forms/infrastructure/formsStore";
import type { FormGroup } from "../../categories/infrastructure/categoriesStore";
import type { User } from "../../users/infrastructure/usersStore";

const dashboardResultSchema = z.object({
  answer: z.string().min(1),
  insights: z.array(z.object({ title: z.string().min(1), value: z.string().min(1), detail: z.string() })),
  actions: z.array(z.object({
    label: z.string().min(1),
    action: z.enum(["none", "open_form", "open_category", "open_users", "open_clients", "open_forms", "open_categories"]),
    targetId: z.string().nullable(),
  })),
});

export type DashboardAssistantResult = z.infer<typeof dashboardResultSchema>;

export interface DashboardContext {
  forms: Pick<FormCategory, "id" | "name" | "steps">[];
  categories: Pick<FormGroup, "id" | "name" | "formIds">[];
  users: Pick<User, "id" | "nombre" | "apellido" | "createdAt">[];
  clients: { id: string; createdAt?: string }[];
  entries: Record<string, Pick<FormEntry, "id" | "createdAt">[]>;
}

export async function requestDashboardInsight(prompt: string, context: DashboardContext) {
  const response = await fetch("/api/dashboard-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context }),
  });
  const rawPayload = await response.text();
  let payload: { error?: string; result?: unknown };
  try {
    payload = JSON.parse(rawPayload) as { error?: string; result?: unknown };
  } catch {
    throw new Error(rawPayload.trim()
      ? `O servidor retornou uma resposta inválida (${response.status}).`
      : `O servidor não retornou uma resposta (${response.status}). Reinicie o servidor e tente novamente.`);
  }
  if (!response.ok) throw new Error(payload.error ?? "Não foi possível analisar o dashboard.");
  return dashboardResultSchema.parse(payload.result);
}
