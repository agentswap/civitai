import { env } from '~/env/client.mjs';

/**
 * Get the model app url
 * @param name  The name of the model app
 * @returns    The model app url
 */
export const modelAppSrc = (name: string) => {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  return name && appUrl.includes('app.') ? appUrl.replace('app', name) : '';
};
