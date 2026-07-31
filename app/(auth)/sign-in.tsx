import { useSignIn } from "@clerk/expo/legacy";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Field validation and error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    }

    return valid;
  };

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!validate()) return;

    setLoading(true);
    setGeneralError("");

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Navigation guard in root layout will redirect to /(tabs)
      } else {
        console.warn("Sign in status not complete:", result.status);
        setGeneralError("Authentication incomplete. Please contact support.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors && Array.isArray(err.errors)) {
        const errorMsgs = err.errors.map((e: any) => e.longMessage || e.message).join("\n");
        setGeneralError(errorMsgs);
      } else {
        setGeneralError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="auth-scroll"
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content justify-center">
            {/* Logo and branding */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Subscriptions</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome Back</Text>
              <Text className="auth-subtitle">
                Log in to keep tracking your recurring expenses effortlessly
              </Text>
            </View>

            {/* Sign In Form */}
            <View className="auth-card">
              <View className="auth-form">

                {generalError ? (
                  <View className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                    <Text className="auth-error text-center">{generalError}</Text>
                  </View>
                ) : null}

                {/* Email Field */}
                <View className="auth-field">
                  <Text className="auth-label">Email Address</Text>
                  <TextInput
                    className={`auth-input ${emailError ? "auth-input-error" : ""}`}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (emailError) setEmailError("");
                    }}
                    editable={!loading}
                  />
                  {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                </View>

                {/* Password Field */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordError ? "auth-input-error" : ""}`}
                    placeholder="Enter password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (passwordError) setPasswordError("");
                    }}
                    editable={!loading}
                  />
                  {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className={`auth-button ${loading || !isLoaded ? "auth-button-disabled" : ""}`}
                  onPress={handleSignIn}
                  disabled={loading || !isLoaded}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff9e3" size="small" />
                  ) : (
                    <Text className="auth-button-text">Log In</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Don&apos;t have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="auth-link">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}