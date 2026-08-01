import "@/global.css";

import { tokenCache } from "@/lib/tokenCache";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function Navigation() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuth = segments[0] === "(auth)";

    if (isSignedIn && inAuth) {
      router.replace("/(tabs)");
    }

    if (!isSignedIn && !inAuth) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn, router, segments]);

  useEffect(() => {
    if (!user || !posthog) return;

    posthog.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.fullName ? { name: user.fullName } : {}),
      },
    });
  }, [user]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey!}
      tokenCache={tokenCache}
    >
      {posthog ? (
        <PostHogProvider client={posthog}>
          <Navigation />
        </PostHogProvider>
      ) : (
        <Navigation />
      )}
    </ClerkProvider>
  );
}