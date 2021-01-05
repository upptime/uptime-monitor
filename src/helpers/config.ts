import { readFile } from "fs-extra";
import { load } from "js-yaml";
import { join } from "path";
import { UpptimeConfig } from "../interfaces";

let __config: UpptimeConfig | undefined = undefined;
export const getConfig = async (): Promise<UpptimeConfig> => {
  if (__config) return __config;
  const config = load(await readFile(join(".", ".upptimerc.yml"), "utf8")) as UpptimeConfig;
  __config = config;
  return config;
};
