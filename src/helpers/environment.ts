import {RANDOM_MAX_DEFAULT, RANDOM_MIN_DEFAULT, DYNAMIC_RANDOM_NUMBER} from "./constants";

export const replaceEnvironmentVariables = (str: string) => {
  Object.keys(process.env).forEach((key) => {
    str = str.replace(`$${key}`, process.env[key] || `$${key}`);
  });
  const SECRETS_CONTEXT = process.env.SECRETS_CONTEXT || "{}";
  const allSecrets: Record<string, string> = JSON.parse(SECRETS_CONTEXT);
  const secrets: Record<string, any> = { ...JSON.parse(JSON.stringify(process.env)), allSecrets };
  Object.keys(secrets).forEach((key) => {
    str = str.replace(`$${key}`, secrets[key] || `$${key}`);
  });
  return substituteRandomNumbers(str);
};

const substituteRandomNumbers = (str: string) => {
  if (str.includes(DYNAMIC_RANDOM_NUMBER)) {
    const min = parseInt(process.env.RANDOM_MIN || RANDOM_MIN_DEFAULT);
    const max = parseInt(process.env.RANDOM_MAX || RANDOM_MAX_DEFAULT);
    str = str.replaceAll(DYNAMIC_RANDOM_NUMBER, () => getRandomNumber(min, max).toString());
  }
  return str;
}

/** Return a random integer N such that min <= N <= max */
const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
