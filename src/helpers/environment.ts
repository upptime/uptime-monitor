export const replaceEnvironmentVariables = (str: string) => {
  Object.keys(process.env).forEach((key) => {
    str = str.replace(`$${key}`, process.env[key] || `$${key}`);
  });
  return str;
};
