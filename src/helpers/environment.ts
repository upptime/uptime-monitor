import {
  RANDOM_MAX_DEFAULT,
  RANDOM_MIN_DEFAULT,
  DYNAMIC_RANDOM_NUMBER,
  DYNAMIC_ALPHANUMERIC_STRING,
  DYNAMIC_STRING_LENGTH_DEFAULT
} from "./constants";

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

  str = substituteRandomNumbers(str);
  str = substituteDynamicAlphanumericString(str);

  return str;
};

const substituteRandomNumbers = (str: string) => {
  if (str.includes(DYNAMIC_RANDOM_NUMBER)) {
    const min = parseInt(process.env.RANDOM_MIN || RANDOM_MIN_DEFAULT);
    const max = parseInt(process.env.RANDOM_MAX || RANDOM_MAX_DEFAULT);
    str = str.replaceAll(DYNAMIC_RANDOM_NUMBER, () => getRandomNumber(min, max).toString());
  }
  return str;
}

const substituteDynamicAlphanumericString = (str: string) => {
  if (str.includes(DYNAMIC_ALPHANUMERIC_STRING)) {
    const length = parseInt(process.env.DYNAMIC_STRING_LENGTH || DYNAMIC_STRING_LENGTH_DEFAULT);
    str = str.replaceAll(DYNAMIC_ALPHANUMERIC_STRING, () => getRandomAlphanumericString(length));
  }
  return str;
};


/** Return a random integer N such that min <= N <= max */
const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;


/** Return a random alphanumeric string of given length */
const getRandomAlphanumericString = (length: number) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
};
