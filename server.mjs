import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = join(root, "dist");
const port = Number(process.env.PORT || 10000);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");

const formSchema = {
  type: "object", additionalProperties: false, required: ["name", "steps"],
  properties: { name: { type: "string", minLength: 1 }, steps: { type: "array", items: {
    type: "object", additionalProperties: false, required: ["name", "fields"],
    properties: { name: { type: "string", minLength: 1 }, fields: { type: "array", items: {
      type: "object", additionalProperties: false, required: ["type", "label", "placeholder", "required", "options"],
      properties: {
        type: { type: "string", enum: ["text", "number", "email", "phone", "date", "select", "multiselect", "image", "button"] },
        label: { type: "string", minLength: 1 }, placeholder: { type: "string" }, required: { type: "boolean" },
        options: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "value"], properties: { label: { type: "string", minLength: 1 }, value: { type: "string", minLength: 1 } } } },
      },
    } } },
  } } },
};

const dashboardSchema = {
  type: "object", additionalProperties: false, required: ["answer", "insights", "actions"],
  properties: {
    answer: { type: "string", minLength: 1 },
    insights: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "value", "detail"], properties: { title: { type: "string", minLength: 1 }, value: { type: "string", minLength: 1 }, detail: { type: "string" } } } },
    actions: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "action", "targetId"], properties: { label: { type: "string", minLength: 1 }, action: { type: "string", enum: ["none", "open_form", "open_category", "open_users", "open_clients", "open_forms", "open_categories"] }, targetId: { type: ["string", "null"] } } } },
  },
};

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}

function outputText(payload) {
  return payload.choices?.[0]?.message?.content
    ?? payload.output?.flatMap((item) => item.content || []).find((part) => part.type === "output_text")?.text;
}

async function assistant(request, response, kind) {
  try {
    if (!apiKey) return sendJson(response, 500, { error: "OPENAI_API_KEY não está configurada no servidor." });
    const input = await readBody(request);
    if (!input.prompt?.trim()) return sendJson(response, 400, { error: kind === "form" ? "Informe o que deseja criar no formulário." : "Informe o que deseja analisar." });
    const isForm = kind === "form";
    const instructions = isForm
      ? `Você é o assistente do construtor de formulários desta aplicação. Crie planos usando SOMENTE: text, number, email, phone, date, select, multiselect, image, button. Divida campos em passos com no máximo 6 campos. Para select e multiselect, sempre crie opções locais explícitas. Nunca use links, IDs de outros formulários ou fontes externas. Retorne somente JSON. Preserve o rascunho quando o usuário pedir alterações. Templates: ${JSON.stringify(input.templates ?? [])}. Rascunho: ${JSON.stringify(input.currentSteps ?? [])}`
      : `Você é o copiloto do dashboard de uma plataforma de formulários. Analise SOMENTE os dados do contexto. Responda em português, sem inventar números. Você é somente leitura: nunca delete, edite ou crie dados. Use apenas ações de navegação permitidas. Retorne somente JSON. Contexto: ${JSON.stringify(input.context ?? {})}`;
    const schema = isForm ? formSchema : dashboardSchema;
    const apiResponse = await fetch(`${baseUrl}/responses`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, store: false, instructions, input: input.prompt, text: { format: { type: "json_schema", name: isForm ? "form_plan" : "dashboard_answer", strict: true, schema } } }) });
    const raw = await apiResponse.text();
    let payload;
    try { payload = JSON.parse(raw); } catch { return sendJson(response, 502, { error: `A API de IA retornou uma resposta vazia ou inválida (HTTP ${apiResponse.status}).` }); }
    if (!apiResponse.ok) return sendJson(response, apiResponse.status, { error: payload.error?.message || "A API de IA retornou um erro." });
    const text = outputText(payload);
    if (!text) return sendJson(response, 502, { error: "A IA não retornou conteúdo." });
    let result;
    try { result = JSON.parse(text); } catch { return sendJson(response, 502, { error: "A IA retornou um plano inválido." }); }
    sendJson(response, 200, isForm ? { plan: result } : { result });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Erro ao processar a solicitação." });
  }
}

const mimeTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

createServer(async (request, response) => {
  const path = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`).pathname;
  if (request.method === "POST" && path === "/api/form-assistant") return assistant(request, response, "form");
  if (request.method === "POST" && path === "/api/dashboard-assistant") return assistant(request, response, "dashboard");
  if (request.method !== "GET") return sendJson(response, 405, { error: "Método não permitido." });
  const requested = normalize(join(dist, path === "/" ? "index.html" : path));
  const file = requested.startsWith(dist) ? requested : join(dist, "index.html");
  try { const content = await readFile(file); response.writeHead(200, { "Content-Type": mimeTypes[extname(file)] || "application/octet-stream" }); response.end(content); }
  catch { const content = await readFile(join(dist, "index.html")); response.writeHead(200, { "Content-Type": "text/html" }); response.end(content); }
}).listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
