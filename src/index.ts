import { debug, getInput, setFailed } from "@actions/core";
import { generateGraphs } from "./graphs";
import { generateSite } from "./site";
import { generateSummary } from "./summary";
import { update } from "./update";

const token = getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;

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
