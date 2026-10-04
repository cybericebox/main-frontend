// Test-runner resolver: maps the tsconfig `@/*` alias to ./src/* for `node --test`.
import { register } from "node:module"

register("./alias-hooks.mjs", import.meta.url)
