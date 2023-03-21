import { transpile } from "typescript";

import { exec } from "child_process";
import { randomUUID } from "crypto";
import init from "fastify";
import { rm, writeFile } from "fs/promises";
const fastify = init({ logger: true });

function cmd(command: string) {
  let p = exec(command);
  return new Promise<string>((res) => {
    let stdout = "";
    p.stdout?.on("data", (x) => {
      stdout += x.toString();
    });
    p.stderr?.on("data", (x) => {
      stdout += x.toString();
    });
    p.on("exit", () => {
      res(stdout);
    });
  });
}

fastify.post("/", async (req, _) => {
  const tsCode = String(req.body);
  console.log(tsCode);

  const js = transpile(tsCode);
  console.log(js);
  const filename = randomUUID();
  await writeFile(filename, js);
  try {
    const output = await cmd(`node ./${filename}`);
    console.log(output);
    return output;
  } finally {
    await rm(filename);
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
