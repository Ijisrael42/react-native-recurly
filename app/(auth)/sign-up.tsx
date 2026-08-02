import { useSignUp } from "@clerk/expo/legacy";
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
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUp() {
    const { signUp, setActive, isLoaded } = useSignUp();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

    // Error states
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [codeError, setCodeError] = useState("");
    const [generalError, setGeneralError] = useState("");

    const validateSignUpForm = () => {
        let valid = true;
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
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

        if (!confirmPassword) {
            setConfirmPasswordError("Please confirm your password");
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            valid = false;
        }

        return valid;
    };

    const handleSignUpSubmit = async () => {
        if (!isLoaded) return;
        if (!validateSignUpForm()) return;

        setLoading(true);
        setGeneralError("");

        try {
            // 1. Create Clerk user
            await signUp.create({
                emailAddress: email.trim(),
                password,
            });

            // 2. Prepare verification (sends verification email)
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            posthog?.capture("sign_up_started");
            setPendingVerification(true);
        } catch (err: any) {
            console.error(err);
            if (err.errors && Array.isArray(err.errors)) {
                const errorMsgs = err.errors.map((e: any) => e.longMessage || e.message).join("\n");
                setGeneralError(errorMsgs);
            } else {
                setGeneralError("An error occurred during sign up. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySubmit = async () => {
        if (!isLoaded) return;
        setCodeError("");
        setGeneralError("");

        if (!code) {
            setCodeError("Verification code is required");
            return;
        }

        setLoading(true);

        try {
            // 3. Attempt verification
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: code.trim(),
            });

            if (completeSignUp.status === "complete") {
                // 4. Set session active (sign in user)
                await setActive({ session: completeSignUp.createdSessionId });
                posthog?.capture("sign_up_completed");
                // Navigation guard in root layout will redirect to /(tabs)
            } else {
                console.warn("Sign up status not complete:", completeSignUp.status);
                setGeneralError("Sign up incomplete. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            if (err.errors && Array.isArray(err.errors)) {
                const errorMsgs = err.errors.map((e: any) => e.longMessage || e.message).join("\n");
                setCodeError(errorMsgs);
            } else {
                setCodeError("Invalid verification code. Please check your inbox.");
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
                        {/* Branding Header */}
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

                            <Text className="auth-title">
                                {pendingVerification ? "Verify Email" : "Create Account"}
                            </Text>
                            <Text className="auth-subtitle">
                                {pendingVerification
                                    ? `We sent a 6-digit code to ${email}`
                                    : "Sign up to track and optimize your recurring subscriptions"}
                            </Text>
                        </View>

                        {/* Form Box */}
                        <View className="auth-card">
                            {generalError ? (
                                <View className="mb-4 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                                    <Text className="auth-error text-center">{generalError}</Text>
                                </View>
                            ) : null}

                            {!pendingVerification ? (
                                // Step 1: Account details form
                                <View className="auth-form">
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
                                            placeholder="At least 8 characters"
                                            placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoComplete="password-new"
                                            value={password}
                                            onChangeText={(val) => {
                                                setPassword(val);
                                                if (passwordError) setPasswordError("");
                                            }}
                                            editable={!loading}
                                        />
                                        {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                                    </View>

                                    {/* Confirm Password Field */}
                                    <View className="auth-field">
                                        <Text className="auth-label">Confirm Password</Text>
                                        <TextInput
                                            className={`auth-input ${confirmPasswordError ? "auth-input-error" : ""}`}
                                            placeholder="Confirm password"
                                            placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoComplete="password-new"
                                            value={confirmPassword}
                                            onChangeText={(val) => {
                                                setConfirmPassword(val);
                                                if (confirmPasswordError) setConfirmPasswordError("");
                                            }}
                                            editable={!loading}
                                        />
                                        {confirmPasswordError ? (
                                            <Text className="auth-error">{confirmPasswordError}</Text>
                                        ) : null}
                                    </View>

                                    {/* Submit Button */}
                                    <TouchableOpacity
                                        className={`auth-button ${loading || !isLoaded ? "auth-button-disabled" : ""}`}
                                        onPress={handleSignUpSubmit}
                                        disabled={loading || !isLoaded}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff9e3" size="small" />
                                        ) : (
                                            <Text className="auth-button-text">Get Started</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                // Step 2: Verification OTP code form
                                <View className="auth-form">
                                    <View className="auth-field">
                                        <Text className="auth-label">Verification Code</Text>
                                        <TextInput
                                            className={`auth-input ${codeError ? "auth-input-error" : ""}`}
                                            placeholder="Enter 6-digit code"
                                            placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                            keyboardType="number-pad"
                                            autoCapitalize="none"
                                            autoComplete="one-time-code"
                                            value={code}
                                            onChangeText={(val) => {
                                                setCode(val);
                                                if (codeError) setCodeError("");
                                            }}
                                            editable={!loading}
                                        />
                                        {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                                    </View>

                                    {/* Verify button */}
                                    <TouchableOpacity
                                        className={`auth-button ${loading ? "auth-button-disabled" : ""}`}
                                        onPress={handleVerifySubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff9e3" size="small" />
                                        ) : (
                                            <Text className="auth-button-text">Verify & Sign In</Text>
                                        )}
                                    </TouchableOpacity>

                                    {/* Back to Edit email address */}
                                    <TouchableOpacity
                                        className="auth-secondary-button"
                                        onPress={() => setPendingVerification(false)}
                                        disabled={loading}
                                    >
                                        <Text className="auth-secondary-button-text">Change Email / Go Back</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Toggle Link */}
                        {!pendingVerification ? (
                            <View className="auth-link-row">
                                <Text className="auth-link-copy">Already have an account?</Text>
                                <Link href="/(auth)/sign-in" asChild>
                                    <TouchableOpacity>
                                        <Text className="auth-link">Log In</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}