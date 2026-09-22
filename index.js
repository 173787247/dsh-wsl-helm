import { assertHelmArgs, runHelm, guardContext, which } from "./lib/helm.js";

export const name = "dsh-wsl-helm";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-helm] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 30_000);
  const maxOutputChars = positive(config.maxOutputChars, 60_000);
  const allowedContexts = Array.isArray(config.allowedContexts) ? config.allowedContexts.map(String) : [];
  console.log(`[dsh-wsl-helm] read-only allowedContexts=${allowedContexts.length || "any"}`);

  ctx.systemPrompt.section({
    name: "tool:helm",
    order: 133,
    text: "dsh-wsl-helm is read-only (list/status/get/history/show/search/template). No install/upgrade/uninstall. Pair with dsh-wsl-k8s. Prefer helm_list then helm_status.",
  });

  ctx.tools.register({
    name: "helm_status_tool",
    description: "Whether helm is on PATH; helm version.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v) }] },
    timeoutMs: 10_000,
    isConcurrencySafe: () => true,
    async execute() {
      const bin = (await which("helm")) || null;
      if (!bin) return { ok: true, helm: null };
      try {
        const r = await runHelm(["version", "--short"], { timeoutMs: 10_000 });
        return { ok: true, helm: bin, version: r.stdout.trim(), allowedContexts };
      } catch (e) {
        return { ok: true, helm: bin, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "helm tool" }),
    presentResult: (_a, r) => ({ card: "generic", title: "helm tool", content: r.content }),
  });

  ctx.tools.register({
    name: "helm_list",
    description: "helm list (-A optional). Read-only.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        allNamespaces: { type: "boolean" },
        namespace: { type: "string" },
        context: { type: "string" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        const ctxName = guardContext(args?.context, allowedContexts);
        const a = ["list"];
        if (args?.allNamespaces) a.push("-A");
        else if (args?.namespace) a.push("-n", String(args.namespace));
        assertHelmArgs(a);
        const r = await runHelm(a, { timeoutMs, maxOut: maxOutputChars, kubeContext: ctxName });
        if (r.code !== 0) throw new Error(r.stderr || `exit ${r.code}`);
        return { ok: true, output: r.stdout, truncated: r.truncated };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "helm list" }),
    presentResult: (_a, r) => ({ card: "generic", title: "helm list", content: r.content }),
  });

  ctx.tools.register({
    name: "helm_release_status",
    description: "helm status <release> (read-only).",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["release"],
      properties: {
        release: { type: "string" },
        namespace: { type: "string" },
        context: { type: "string" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        const rel = String(args.release || "").trim();
        if (!/^[A-Za-z0-9._-]+$/.test(rel)) throw new Error("invalid release name");
        const ctxName = guardContext(args.context, allowedContexts);
        const a = ["status", rel];
        if (args.namespace) a.push("-n", String(args.namespace));
        assertHelmArgs(a);
        const r = await runHelm(a, { timeoutMs, maxOut: maxOutputChars, kubeContext: ctxName });
        if (r.code !== 0) throw new Error(r.stderr || `exit ${r.code}`);
        return { ok: true, output: r.stdout, truncated: r.truncated };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "helm status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "helm status", content: r.content }),
  });

  ctx.tools.register({
    name: "helm_history",
    description: "helm history <release> (read-only).",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["release"],
      properties: {
        release: { type: "string" },
        namespace: { type: "string" },
        context: { type: "string" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        const rel = String(args.release || "").trim();
        if (!/^[A-Za-z0-9._-]+$/.test(rel)) throw new Error("invalid release name");
        const ctxName = guardContext(args.context, allowedContexts);
        const a = ["history", rel];
        if (args.namespace) a.push("-n", String(args.namespace));
        assertHelmArgs(a);
        const r = await runHelm(a, { timeoutMs, maxOut: maxOutputChars, kubeContext: ctxName });
        if (r.code !== 0) throw new Error(r.stderr || `exit ${r.code}`);
        return { ok: true, output: r.stdout, truncated: r.truncated };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "helm history" }),
    presentResult: (_a, r) => ({ card: "generic", title: "helm history", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}
