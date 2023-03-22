import { ModuleKind, ScriptTarget, transpile } from "typescript";

import cors from "@fastify/cors";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import init from "fastify";
import { rm, writeFile } from "fs/promises";
const fastify = init({ logger: true });

function cmd(command: string) {
  let p = exec(command);
  console.log(`Started process ${p.pid}...`);
  return new Promise<string>((res) => {
    let stdout = "";
    const append = (data: any) => {
      data = data.toString() as string;
      if (data.includes(" npm i ")) return;
      stdout += data;
    };
    p.stdout?.on("data", append);
    p.stderr?.on("data", append);

    // Automatically kill long lasting processes
    const timer = setTimeout(() => {
      console.log(
        `Process ${p.pid} has been running for more than 20sec killing it.`
      );
      p.kill();
    }, 20_000);
    p.on("exit", () => {
      clearTimeout(timer);
      res(stdout.trim());
    });
  });
}

fastify.post("/", async (req, _) => {
  const tsCode = String(req.body);
  console.log(
    `
########################
#####  Typescript ######
########################`.trim()
  );
  console.log(tsCode);

  const js = transpile(tsCode, {
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    module: ModuleKind.ES2015,
    target: ScriptTarget.ES2015,
  });

  console.log(
    `
########################
##### Compiled JS ######
########################`.trim()
  );

  console.log(js);
  const filename = randomUUID();
  await writeFile(filename, js);
  try {
    const output = await cmd(`zx --install --quiet ./${filename}`);
    console.log(
      `
########################
######## OUTPUT ########
########################`.trim()
    );
    console.log(output);
    return output;
  } finally {
    await rm(filename);
  }
});

const start = async () => {
  try {
    await fastify.register(cors);
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
