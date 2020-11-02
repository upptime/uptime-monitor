import { exec } from "shelljs";

exec(`git config --global user.email "upptime@koj.co"`);
exec(`git config --global user.name "Upptime Bot"`);

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
