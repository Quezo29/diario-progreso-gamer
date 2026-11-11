// PostToolUse: formatea con Prettier el archivo que el agente acaba de editar.
// Si Prettier no está instalado, no bloquea el flujo.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, extname } from "node:path";

const EXTENSIONES = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".md", ".html"]);

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

if (!ruta || !EXTENSIONES.has(extname(nombre)) || nombre === ".env" || nombre.startsWith(".env.")) {
  process.exit(0);
}

const prettier = "node_modules/prettier/bin/prettier.cjs";
if (!existsSync(prettier)) {
  console.error("Prettier no está instalado en la raíz; se omite el formato (npm install).");
  process.exit(0);
}

try {
  execFileSync(process.execPath, [prettier, "--write", String(ruta)], { stdio: "inherit" });
} catch (error) {
  console.error(`No se pudo formatear ${ruta}: ${error instanceof Error ? error.message : String(error)}`);
}

process.exit(0);
