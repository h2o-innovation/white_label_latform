import { defineConfig, loadEnv, type Plugin, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

const formPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "steps"],
  properties: {
    name: { type: "string", minLength: 1 },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "fields"],
        properties: {
          name: { type: "string", minLength: 1 },
          fields: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["type", "label", "placeholder", "required", "options"],
              properties: {
                type: {
                  type: "string",
                  enum: ["text", "number", "email", "phone", "date", "select", "multiselect", "image", "button"],
                },
                label: { type: "string", minLength: 1 },
                placeholder: { type: "string" },
                required: { type: "boolean" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["label", "value"],
                    properties: {
                      label: { type: "string", minLength: 1 },
                      value: { type: "string", minLength: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const dashboardAssistantJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["answer", "insights", "actions"],
  properties: {
    answer: { type: "string", minLength: 1 },
    insights: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "value", "detail"],
        properties: {
          title: { type: "string", minLength: 1 },
          value: { type: "string", minLength: 1 },
          detail: { type: "string" },
        },
      },
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "action", "targetId"],
        properties: {
          label: { type: "string", minLength: 1 },
          action: { type: "string", enum: ["none", "open_form", "open_category", "open_users", "open_clients", "open_forms", "open_categories"] },
          targetId: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;

function extractAssistantText(payload: {
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  choices?: Array<{ message?: { content?: string | null } }>;
}) {
  return payload.choices?.[0]?.message?.content
    ?? payload.output?.flatMap((item) => item.content ?? []).find((part) => part.type === "output_text")?.text;
}

function formAssistantApi(apiKey: string, model: string, baseUrl: string): Plugin {
  return {
    name: "form-assistant-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestInfo = request as typeof request & {
          url?: string;
          method?: string;
          on: (event: "data" | "end" | "error", listener: (...args: unknown[]) => void) => void;
        };
        if (requestInfo.url !== "/api/form-assistant" || requestInfo.method !== "POST") {
          next();
          return;
        }

        try {
          const body = await new Promise<string>((resolve, reject) => {
            let value = "";
            requestInfo.on("data", (chunk) => { value += String(chunk); });
            requestInfo.on("end", () => resolve(value));
            requestInfo.on("error", (error) => reject(error));
          });
          const input = JSON.parse(body) as {
            prompt?: string;
            currentSteps?: unknown;
            templates?: unknown;
          };
          if (!input.prompt?.trim()) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: "Informe o que deseja criar no formulário." }));
            return;
          }

          const serverFetch = (globalThis as unknown as {
            fetch: (url: string, options: { method: string; headers: Record<string, string>; body: string }) => Promise<{
              ok: boolean;
              status: number;
              text: () => Promise<string>;
            }>;
          }).fetch;
          const instructions = `Você é o assistente do construtor de formulários desta aplicação.

Você cria planos de formulário usando SOMENTE estes tipos: text, number, email, phone, date, select, multiselect, image, button.
Divida os campos em passos com no máximo 6 campos por passo.
Para select e multiselect, sempre crie opções locais explícitas. Nunca use links, IDs de outros formulários ou fontes externas.
Não invente propriedades fora do schema. Retorne apenas o JSON do plano.
Use os templates e o rascunho atual como contexto. Se o usuário pedir uma alteração, preserve o que não foi pedido e retorne o plano completo resultante.

Templates disponíveis:
${JSON.stringify(input.templates ?? [])}

Rascunho atual:
${JSON.stringify(input.currentSteps ?? [])}`;
          const requestBody = {
            model,
            store: false,
            instructions,
            input: input.prompt,
            text: {
              format: {
                type: "json_schema",
                name: "form_plan",
                strict: true,
                schema: formPlanJsonSchema,
              },
            },
          };
          const endpoint = baseUrl.endsWith("/v1")
            ? `${baseUrl}/responses`
            : `${baseUrl}/v1/responses`;
          const openAIResponse = await serverFetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          const rawOpenAIPayload = await openAIResponse.text();
          let openAIPayload: {
            error?: { message?: string };
            output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
            choices?: Array<{ message?: { content?: string | null } }>;
          };
          try {
            openAIPayload = JSON.parse(rawOpenAIPayload) as typeof openAIPayload;
          } catch {
            throw new Error(`A API de IA retornou uma resposta vazia ou inválida (HTTP ${openAIResponse.status}).`);
          }
          if (!openAIResponse.ok) {
            response.statusCode = openAIResponse.status;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: openAIPayload.error?.message ?? "A API de IA retornou um erro." }));
            return;
          }

          const outputText = extractAssistantText(openAIPayload);
          if (!outputText) throw new Error("A IA não retornou um plano de formulário válido.");

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ plan: JSON.parse(outputText) }));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({
            error: error instanceof Error ? error.message : "Erro ao gerar o formulário.",
          }));
        }
      });
    },
  };
}

function dashboardAssistantApi(apiKey: string, model: string, baseUrl: string): Plugin {
  return {
    name: "dashboard-assistant-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestInfo = request as typeof request & {
          url?: string;
          method?: string;
          on: (event: "data" | "end" | "error", listener: (...args: unknown[]) => void) => void;
        };
        if (requestInfo.url !== "/api/dashboard-assistant" || requestInfo.method !== "POST") {
          next();
          return;
        }

        try {
          const body = await new Promise<string>((resolve, reject) => {
            let value = "";
            requestInfo.on("data", (chunk) => { value += String(chunk); });
            requestInfo.on("end", () => resolve(value));
            requestInfo.on("error", (error) => reject(error));
          });
          const input = JSON.parse(body) as { prompt?: string; context?: unknown };
          if (!input.prompt?.trim()) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: "Informe o que deseja analisar." }));
            return;
          }

          const instructions = `Você é o copiloto do dashboard de uma plataforma de formulários.
Analise SOMENTE os dados fornecidos no contexto. Seja direto, útil e responda em português.
Você pode explicar métricas, comparar formulários, encontrar tendências e recomendar próximos passos.
Não invente números. Se não houver dados suficientes, diga isso claramente.
Você é somente leitura: nunca delete, edite ou crie dados. Para ações, use apenas navegação segura.
Retorne somente JSON no schema informado.
As ações permitidas são: open_form (exige targetId de um formulário existente), open_category (exige targetId de uma categoria existente), open_users, open_clients, open_forms, open_categories ou none.

Contexto atual do dashboard:
${JSON.stringify(input.context ?? {})}`;
          const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/responses` : `${baseUrl}/v1/responses`;
          const openAIResponse = await (globalThis as unknown as {
            fetch: (url: string, options: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;
          }).fetch(endpoint, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              store: false,
              instructions,
              input: input.prompt,
              text: { format: { type: "json_schema", name: "dashboard_answer", strict: true, schema: dashboardAssistantJsonSchema } },
            }),
          });
          const rawPayload = await openAIResponse.text();
          let payload: {
            error?: { message?: string };
            output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
            choices?: Array<{ message?: { content?: string | null } }>;
          };
          try {
            payload = JSON.parse(rawPayload) as typeof payload;
          } catch {
            throw new Error(`A API de IA retornou uma resposta vazia ou inválida (HTTP ${openAIResponse.status}).`);
          }
          if (!openAIResponse.ok) {
            response.statusCode = openAIResponse.status;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: payload.error?.message ?? "A API de IA retornou um erro." }));
            return;
          }
          const outputText = extractAssistantText(payload);
          if (!outputText) throw new Error("A IA não retornou uma análise válida.");
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ result: JSON.parse(outputText) }));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao analisar o dashboard." }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const plugins: PluginOption[] = [react()];
  const apiKey = env.OPENAI_API_KEY;
  const baseUrl = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = env.OPENAI_MODEL || "gpt-4o-mini";
  if (apiKey) {
    plugins.push(formAssistantApi(apiKey, model, baseUrl));
    plugins.push(dashboardAssistantApi(apiKey, model, baseUrl));
  }
  return { plugins };
});
