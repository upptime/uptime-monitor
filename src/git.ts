import { exec } from "shelljs";

export const commit = (message: string) => {
  exec(`git add .`);
  exec(`git commit -m "${message.replace(/\"/g, "''")}"`);
};

export const push = (message: string) => {
  exec("git push");
};
