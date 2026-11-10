# Evidencia del harness

Fecha: 2026-11-10

## Archivos

| Archivo | Para qué |
| --- | --- |
| `AGENTS.md` | Memoria del proyecto: stack, estructura, comandos, convenciones y reglas. |
| `CLAUDE.md` | Una sola línea: `@AGENTS.md`. |
| `.claude/skills/commit/SKILL.md` | Skill `/commit`; tiene efectos en el repositorio, por eso `disable-model-invocation: true`. |
| `.claude/skills/nueva-spec/SKILL.md` | Skill `/nueva-spec`; también con invocación manual. |
| `.claude/settings.json` | Engancha `PreToolUse` y `PostToolUse`. |
| `.claude/hooks/bloquear-env.mjs` | Bloquea la edición de `.env` y `.env.*` (excepto `.env.example`). |
| `.claude/hooks/formatear.mjs` | Formatea con Prettier el archivo editado en `PostToolUse`. |
| `DESIGN.md` | Tokens, componentes, tono, accesibilidad y “no hacemos”. |

## Verificación de los hooks

Se ejecutaron los scripts con el mismo payload que envía Claude Code por `stdin`.

### PreToolUse — archivo `.env`

```text
> echo '{"tool_input":{"file_path":"C:\\repo\\backend\\.env"}}' | node .claude/hooks/bloquear-env.mjs
Bloqueado por .claude/hooks/bloquear-env.mjs: no se puede leer ni modificar .env.
Edita .env.example y carga los valores reales en el panel del entorno.
exit=2
```

Un `exit=2` en `PreToolUse` impide que la herramienta se ejecute. El archivo `.env` no se abrió.

### PreToolUse — archivo permitido

```text
> ... file_path: "C:\\repo\\backend\\.env.example"
exit=0
```

`.env.example` sí se puede editar porque no contiene credenciales reales.

### PostToolUse — Prettier

```text
> ... file_path: "C:\\Users\\Ricardo\\AppData\\Local\\Temp\\opencode\\hook-demo.ts"
../../AppData/Local/Temp/opencode/hook-demo.ts 39ms
exit=0
```

El archivo de prueba pasó de `export const demo={a:1,b:2};` a:

```ts
export const demo = { a: 1, b: 2 };
```

## Nota de entorno

En esta máquina el gestor NVM tenía una versión `v22.23.3` incompleta y el shim de `node` la
buscaba al invocar herramientas. Para ejecutar los comandos se usó el Node real:

```powershell
$env:PATH = 'C:\Users\Ricardo\AppData\Local\Author Software\nvm\installs\v22.22.0;' + $env:PATH
node -v   # v22.22.0
```

Eso es un problema del entorno, no del repositorio. En Render se usa `NODE_VERSION=20`.
