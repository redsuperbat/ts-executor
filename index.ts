import { ModuleKind, ScriptTarget, transpile } from "typescript";

import { exec } from "child_process";
import { randomUUID } from "crypto";
import init from "fastify";
import { rm, writeFile } from "fs/promises";
const fastify = init({ logger: true, requestTimeout: 60_000 });

function cmd(command: string) {
  let p = exec(command);
  return new Promise<string>((res) => {
    let stdout = "";
    const append = (data: any) => {
      data = data.toString() as string;
      if (data.includes(" npm i ")) return;
      stdout += data;
    };
    p.stdout?.on("data", append);
    p.stderr?.on("data", append);
    p.on("exit", () => {
      res(stdout.trim());
    });
  });
}

fastify.post("/", async (req, _) => {
  const tsCode = String(req.body);
  console.log(tsCode);

  const js = transpile(tsCode, {
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    module: ModuleKind.ES2015,
    target: ScriptTarget.ES2015,
  });

  console.log(js);
  const filename = randomUUID();
  await writeFile(filename, js);
  try {
    const output = await cmd(`zx --install --quiet ./${filename}`);
    console.log(output);
    return output;
  } finally {
    await rm(filename);
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
