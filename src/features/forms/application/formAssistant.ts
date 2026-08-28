import { z } from "zod";
import type { ComponentType, FormStep } from "../infrastructure/formBuilderStore";
import { formTemplates } from "./formTemplates";

const componentTypes: [ComponentType, ...ComponentType[]] = [
  "text",
  "number",
  "email",
  "phone",
  "date",
  "select",
  "multiselect",
  "image",
  "button",
];

export const formPlanSchema = z.object({
  name: z.string().min(1),
  steps: z.array(
    z.object({
      name: z.string().min(1),
      fields: z.array(
        z.object({
          type: z.enum(componentTypes),
          label: z.string().min(1),
          placeholder: z.string().default(""),
          required: z.boolean().default(false),
          options: z
            .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
            .default([]),
        }),
      ),
    }),
  ),
});

export type FormPlan = z.infer<typeof formPlanSchema>;

export async function requestFormPlan(
  prompt: string,
  currentSteps: FormStep[],
): Promise<FormPlan> {
  const response = await fetch("/api/form-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      currentSteps,
      templates: formTemplates.map(({ id, name, description }) => ({
        id,
        name,
        description,
      })),
    }),
  });

  const payload = (await response.json()) as { error?: string; plan?: unknown };
  if (!response.ok) throw new Error(payload.error ?? "Não foi possível gerar o formulário.");
  return formPlanSchema.parse(payload.plan);
}

export function formPlanToSteps(plan: FormPlan): FormStep[] {
  return plan.steps.map((planStep) => ({
    id: `assistant-${crypto.randomUUID()}`,
    name: planStep.name,
    rows: planStep.fields.map((component) => ({
      id: `assistant-${crypto.randomUUID()}`,
      columns: [{
        id: `assistant-${crypto.randomUUID()}`,
        component: {
          ...component,
          id: `assistant-${crypto.randomUUID()}`,
          options: component.options.map((option) => ({
            ...option,
            id: `assistant-${crypto.randomUUID()}`,
          })),
        },
      }],
    })),
  }));
}
