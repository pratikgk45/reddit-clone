/**
 * Infrastructure configuration
 * Supports multiple environments (dev, staging, production)
 */

export interface StackConfig {
  environment: string;
  tableName: string;
  apiName: string;
  removalPolicy: 'DESTROY' | 'RETAIN';
  pointInTimeRecovery: boolean;
  logLevel: 'ALL' | 'ERROR' | 'NONE';
  enableXRay: boolean;
}

export function getConfig(env?: string): StackConfig {
  const environment = env || process.env.ENVIRONMENT || 'dev';

  const configs: Record<string, StackConfig> = {
    dev: {
      environment: 'dev',
      tableName: 'reddit-data-dev',
      apiName: 'reddit-api-dev',
      removalPolicy: 'DESTROY',
      pointInTimeRecovery: false,
      logLevel: 'ALL',
      enableXRay: false,
    },
    staging: {
      environment: 'staging',
      tableName: 'reddit-data-staging',
      apiName: 'reddit-api-staging',
      removalPolicy: 'RETAIN',
      pointInTimeRecovery: true,
      logLevel: 'ERROR',
      enableXRay: true,
    },
    production: {
      environment: 'production',
      tableName: 'reddit-data',
      apiName: 'reddit-api',
      removalPolicy: 'RETAIN',
      pointInTimeRecovery: true,
      logLevel: 'ERROR',
      enableXRay: true,
    },
  };

  return configs[environment] || configs.dev;
}
