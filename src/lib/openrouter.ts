// Cliente mínimo de OpenRouter (directo desde el navegador).
// CORS verificado: https://openrouter.ai/api/v1 responde Access-Control-Allow-Origin: *.

export const MODELO_DEFECTO = 'deepseek/deepseek-v4.1-flash';
const BASE = 'https://openrouter.ai/api/v1';

export interface MensajeIA {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModeloOR {
  id: string;
  name: string;
  context: number;
  structured: boolean;
  json: boolean;
}

export async function listarModelos(): Promise<ModeloOR[]> {
  const res = await fetch(`${BASE}/models`);
  if (!res.ok) throw new Error(`No se pudieron listar los modelos (${res.status})`);
  const j = (await res.json()) as { data?: Record<string, unknown>[] };
  return (j.data || [])
    .map((m) => {
      const params = (m.supported_parameters as string[]) || [];
      return {
        id: String(m.id),
        name: String(m.name || m.id),
        context: Number(m.context_length || 0),
        structured: params.includes('structured_outputs'),
        json: params.includes('response_format'),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function probarClave(key: string): Promise<{ ok: boolean; saldo?: number; error?: string }> {
  try {
    const res = await fetch(`${BASE}/credits`, { headers: { Authorization: `Bearer ${key}` } });
    if (res.status === 401) return { ok: false, error: 'Clave inválida (401)' };
    if (!res.ok) return { ok: false, error: `Error ${res.status}` };
    const j = (await res.json()) as { data?: { total_balance?: number; balance?: number } };
    return { ok: true, saldo: j.data?.total_balance ?? j.data?.balance };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function parseJSONLoose(raw: string): unknown {
  const txt = String(raw || '').trim();
  try {
    return JSON.parse(txt);
  } catch {
    /* buscar bloque */
  }
  const fence = txt.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {
      /* continue */
    }
  }
  const i = txt.indexOf('{');
  const f = txt.lastIndexOf('}');
  if (i >= 0 && f > i) return JSON.parse(txt.slice(i, f + 1));
  throw new Error('La respuesta no es JSON válido');
}

interface ChatOpts {
  key: string;
  model: string;
  messages: MensajeIA[];
  responseFormat?: unknown;
  tools?: unknown[];
  temperature?: number;
  maxTokens?: number;
  onDelta?: (chunk: string) => void;
  onReason?: (chunk: string) => void;
  signal?: AbortSignal;
}

export async function chatStream(opts: ChatOpts): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    stream: true,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 4096,
  };
  if (opts.responseFormat) body.response_format = opts.responseFormat;
  if (opts.tools?.length) body.tools = opts.tools;

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': location.origin,
      'X-Title': 'Rumbo Libre',
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => '');
    let msg = `OpenRouter ${res.status}`;
    try {
      msg += ': ' + (JSON.parse(txt).error?.message || txt.slice(0, 200));
    } catch {
      msg += ': ' + txt.slice(0, 200);
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let content = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const data = t.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const j = JSON.parse(data) as {
          choices?: { delta?: { content?: string; reasoning?: string } }[];
        };
        const d = j.choices?.[0]?.delta;
        if (d?.reasoning) opts.onReason?.(d.reasoning);
        if (d?.content) {
          content += d.content;
          opts.onDelta?.(d.content);
        }
      } catch {
        /* fragmento incompleto */
      }
    }
  }

  if (!content.trim()) throw new Error('El modelo devolvió una respuesta vacía');
  return content;
}

export async function chatComplete(opts: Omit<ChatOpts, 'onDelta' | 'onReason'>): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    stream: false,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 4096,
  };
  if (opts.responseFormat) body.response_format = opts.responseFormat;
  if (opts.tools?.length) body.tools = opts.tools;

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': location.origin,
      'X-Title': 'Rumbo Libre',
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    let msg = `OpenRouter ${res.status}`;
    try {
      msg += ': ' + (JSON.parse(txt).error?.message || txt.slice(0, 200));
    } catch {
      msg += ': ' + txt.slice(0, 200);
    }
    throw new Error(msg);
  }
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = j.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error('El modelo devolvió una respuesta vacía');
  return content;
}

export async function chatJSON(opts: {
  key: string;
  model: string;
  messages: MensajeIA[];
  schema?: Record<string, unknown>;
  structured?: boolean;
  json?: boolean;
  tools?: unknown[];
  signal?: AbortSignal;
}): Promise<unknown> {
  const conFormato = opts.structured && opts.schema
    ? { type: 'json_schema', json_schema: { name: 'resultado', strict: true, schema: opts.schema } }
    : opts.json
      ? { type: 'json_object' }
      : undefined;

  const esErrorDuro = (e: unknown): boolean => {
    const msg = (e as Error)?.message || '';
    return /\b401\b|\b402\b|credit|insufficient|quota|invalid.*key/i.test(msg);
  };

  // 1) streaming con formato, 2) streaming sin formato, 3) sin streaming.
  const intentos: (unknown | undefined)[] = conFormato ? [conFormato, undefined] : [undefined];
  let ultimo: unknown;
  for (const rf of intentos) {
    try {
      const raw = await chatStream({
        key: opts.key,
        model: opts.model,
        messages: opts.messages,
        responseFormat: rf,
        tools: opts.tools,
        temperature: 0.4,
        maxTokens: 4096,
        signal: opts.signal,
      });
      return parseJSONLoose(raw);
    } catch (e) {
      ultimo = e;
      if (esErrorDuro(e)) throw e;
    }
  }

  // 3) último recurso: sin streaming.
  try {
    const raw = await chatComplete({
      key: opts.key,
      model: opts.model,
      messages: opts.messages,
      responseFormat: conFormato,
      tools: opts.tools,
      temperature: 0.4,
      maxTokens: 4096,
      signal: opts.signal,
    });
    return parseJSONLoose(raw);
  } catch (e) {
    ultimo = e;
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo));
}

// Herramienta de búsqueda web de OpenRouter (para fundamentar e imágenes).
export const TOOL_BUSQUEDA = { type: 'openrouter:web_search' };
