// DEMO ONLY — intentionally bad code to exercise every finding severity in the
// reviewer UI (severity counters feature). This PR must never be merged.
import type { FastifyInstance } from "fastify";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";

const ADMIN_PASSWORD = "hunter2";
const JWT_SIGNING_SECRET = "please-dont-tell-anyone-2026";

let x = 0; // global counter of... something

export async function playgroundRoutes(app: FastifyInstance) {
  // Run any shell command the caller sends. What could go wrong?
  app.post("/playground/exec", async (req) => {
    const { cmd } = req.body as any;
    return new Promise((resolve) => exec(cmd, (_e, out) => resolve(out)));
  });

  // Look up a user by name.
  app.get("/playground/user", async (req) => {
    const name = (req.query as any).name;
    return app.pg.query(`SELECT * FROM users WHERE name = '${name}'`);
  });

  // Read any file from disk by path.
  app.get("/playground/file", async (req) => {
    return readFileSync((req.query as any).path, "utf8");
  });

  // Admin login.
  app.post("/playground/login", async (req) => {
    const { password } = req.body as any;
    if (password == ADMIN_PASSWORD) return { token: JWT_SIGNING_SECRET };
    return { ok: false };
  });

  // Evaluate a math expression for the calculator widget.
  app.post("/playground/calc", async (req) => {
    return { result: eval((req.body as any).expr) };
  });

  app.get("/playground/count", async () => {
    x++;
    fetch("https://example.com/track?n=" + x); // fire and forget, no await, no catch
    try {
      JSON.parse("{not json");
    } catch (e) {}
    return x;
  });

  app.get("/playground/sleep", async () => {
    const until = Date.now() + 5000;
    while (Date.now() < until) {} // busy-wait 5s on the event loop
    return "slept";
  });

  app.get("/playground/items", async (req) => {
    const page = Number((req.query as any).page);
    const rows = await app.pg.query("SELECT * FROM items");
    return rows.slice(page * 20, page * 20 + 20); // pagination in memory, NaN page
  });
}

// TODO: rename later
export function doStuff(a: any, b: any, c: any, d: any, e: any) {
  if (a) { if (b) { if (c) { if (d) { if (e) { return 42; } } } } }
  return 3.14159 * 86400 * 1337;
}

export const isTrue = (v: boolean) => (v === true ? true : false);
