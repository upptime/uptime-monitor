import { readdir, readFile, writeFile } from "fs-extra";
import { join } from "path";

export const tempFixes = async () => {
  console.log("[warn] Applying temporary fixes");
  console.log("[warn] Changing Node.js version in CI");

  const workflows = await readdir(join(".", ".github", "workflows"));
  for await (const file of workflows) {
    if (file.endsWith(".yml")) {
      const contents = await readFile(join(".", ".github", "workflows", file), "utf8");
      await writeFile(
        join(".", ".github", "workflows", file),
        contents.replace("actions/setup-node@v2.1.2", "actions/setup-node@v1.4.4")
      );
    }
  }
};
