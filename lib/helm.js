import { spawn } from "node:child_process";

const WRITE = new Set([
  "install",
  "upgrade",
  "uninstall",
  "rollback",
  "create",
  "delete",
  "push",
  "pull",
  "registry",
  "plugin",
  "dependency",
  "package",
  "lint", // lint is ok actually - keep
]);

// Allow only read-ish helm verbs
const ALLOWED = new Set(["list", "status", "get", "history", "show", "search", "version", "env", "template"]);
// env is read-only metadata for status probes

export function assertHelmArgs(args) {
  const list = Array.isArray(args) ? args.map(String) : [];
  if (!list.length) throw new Error("helm args required");
  const verb = list[0];
  if (!ALLOWED.has(verb)) throw new Error(`helm verb not allowed: ${verb} (read-only plugin)`);
  if (verb === "get") {
    const sub = list[1] || "";
    const ok = new Set(["all", "hooks", "manifest", "notes", "values", "metadata"]);
    if (!ok.has(sub)) throw new Error(`helm get subcommand not allowed: ${sub}`);
  }
  if (verb === "show") {
    const sub = list[1] || "";
    const ok = new Set(["all", "chart", "readme", "values", "crds"]);
    if (!ok.has(sub)) throw new Error(`helm show subcommand not allowed: ${sub}`);
  }
  // template can render charts locally — allow but cap output
  return list;
}

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((r) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => r(c === 0 ? out.trim() : ""));
  });
}

export function runHelm(args, { timeoutMs = 30_000, maxOut = 60_000, kubeContext } = {}) {
  const final = [...args];
  if (kubeContext) final.push("--kube-context", String(kubeContext));
  return new Promise((resolvePromise, reject) => {
    const child = spawn("helm", final, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("helm timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > maxOut * 2) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({
        code,
        stdout: stdout.slice(0, maxOut),
        stderr: stderr.slice(0, 4000),
        truncated: stdout.length > maxOut,
      });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export function guardContext(context, allowedContexts = []) {
  const c = String(context || "").trim();
  if (!c) return undefined;
  if (allowedContexts.length && !allowedContexts.includes(c)) {
    throw new Error(`kube-context not in allowedContexts: ${c}`);
  }
  return c;
}

void WRITE;
