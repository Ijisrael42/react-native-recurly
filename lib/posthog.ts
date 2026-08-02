import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as
  | string
  | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;
const isConfigured = Boolean(projectToken && host);

if (__DEV__ && !isConfigured) {
  console.error(
    'POSTHOG_PROJECT_TOKEN or POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once the variables are configured',
  );
}

export const posthog = isConfigured
  ? new PostHog(projectToken!, {
      host,
      captureAppLifecycleEvents: true,
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
        },
      },
      preloadFeatureFlags: true,
    })
  : null;
