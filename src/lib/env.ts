import Constants from 'expo-constants';

type AppEnv = 'development' | 'staging' | 'production';

interface Env {
  apiBaseUrl: string;
  appEnv: AppEnv;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Env>;

if (!extra.apiBaseUrl) {
  throw new Error('Missing apiBaseUrl in expo extra config');
}

export const env: Env = {
  apiBaseUrl: extra.apiBaseUrl,
  appEnv: (extra.appEnv as AppEnv) ?? 'development',
};

export const isProd = env.appEnv === 'production';
