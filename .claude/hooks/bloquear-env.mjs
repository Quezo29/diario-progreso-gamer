// PreToolUse: bloquea cualquier edición de un archivo .env.
// Claude Code envía el payload de la herramienta por stdin.
import { readFileSync } from "node:fs";
import { basename } from "node:path";

function leerPayload() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return null;
  }
}

const payload = leerPayload();
const ruta = payload?.tool_input?.file_path ?? payload?.tool_input?.path ?? "";
const nombre = basename(String(ruta).replace(/\\/g, "/"));

const esEnvReal = nombre === ".env" || (nombre.startsWith(".env.") && nombre !== ".env.example");

if (esEnvReal) {
  console.error(
    "Bloqueado por .claude/hooks/bloquear-env.mjs: no se puede leer ni modificar .env. " +
      "Edita .env.example y carga los valores reales en el panel del entorno."
  );
  process.exit(2);
}

process.exit(0);
