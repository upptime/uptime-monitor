import { debug, getInput, setFailed } from "@actions/core";
import { updateDependencies } from "./dependencies";
import { generateGraphs } from "./graphs";
import { getSecret } from "./helpers/secrets";
import { generateSite } from "./site";
import { generateSummary } from "./summary";
import { update } from "./update";
import { updateTemplate } from "./update-template";

const token = getSecret("GH_PAT") || getInput("token") || getSecret("GITHUB_TOKEN");

export const run = async () => {
  if (!token) throw new Error("GitHub token not found");

  debug("Starting Upptime");

  switch (getInput("command")) {
    case "summary":
      debug("Starting summary");
    case "readme":
      debug("Starting readme");
      return generateSummary();
    case "site":
      debug("Starting site");
      return generateSite();
    case "graphs":
      debug("Starting site");
      return generateGraphs();
    case "response-time":
      debug("Starting response-time");
      return update(true);
    case "update-dependencies":
      debug("Starting update-dependencies");
      return updateDependencies();
    case "update-template":
      debug("Starting update-template");
      return updateTemplate();
    default:
      debug("Starting update");
      return update();
  }
};

run()
  .then(() => {})
  .catch((error) => {
    console.error("ERROR", error);
    setFailed(error.message);
  });
