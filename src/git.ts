import { exec } from "shelljs";

export const commit = (message: string, name = "Upptime Bot", email = "upptime@koj.co") => {
  exec(`git config --global user.email "${email}"`);
  exec(`git config --global user.name "${name}"`);
  exec(`git add .`);
  exec(`git commit -m "${message.replace(/\"/g, "''")}"`);
};

export const push = () => {
  exec("git push");
};

export const lastCommit = () => {
  return exec(`git log --format="%H" -n 1`).stdout;
};
