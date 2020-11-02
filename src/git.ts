import { exec } from "shelljs";

export const commit = (message: string) => {
  exec(`git add .`);
  exec(`git commit -m "${message.replace(/\"/g, "''")}"`);
};

export const push = () => {
  exec("git push");
};

export const lastCommit = () => {
  return exec(`git log --format="%H" -n 1`).stdout;
};
