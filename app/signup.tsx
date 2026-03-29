import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { signUp } from "@/services/auth";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await signUp(email.trim(), password, name.trim());
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err?.message || "";
      setError(
        msg.includes("email-already-in-use")
          ? "This email is already registered."
          : msg.includes("invalid-email")
          ? "Please enter a valid email."
          : "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#030014", "#0f0d23", "#1a1040"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: "rgba(171,139,255,0.15)",
              borderWidth: 1, borderColor: "rgba(171,139,255,0.4)",
              justifyContent: "center", alignItems: "center", marginBottom: 20
            }}>
              <Ionicons name="person-add-outline" size={34} color="#AB8BFF" />
            </View>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 0.5, marginBottom: 6 }}>
              Create Account
            </Text>
            <Text style={{ color: "#A8B5DB", fontSize: 14, textAlign: "center" }}>
              Join to discover and save your favorite movies
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={{
              backgroundColor: "rgba(239,68,68,0.15)",
              borderWidth: 1, borderColor: "rgba(239,68,68,0.4)",
              borderRadius: 10, padding: 12, flexDirection: "row",
              alignItems: "center", marginBottom: 16, gap: 8
            }}>
              <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
              <Text style={{ color: "#f87171", flex: 1, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#A8B5DB", fontSize: 13, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 }}>
              FULL NAME
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1, borderColor: "rgba(171,139,255,0.25)",
              borderRadius: 12, paddingHorizontal: 14
            }}>
              <Ionicons name="person-outline" size={18} color="#A8B5DB" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#4a4a6a"
                style={{ flex: 1, color: "#fff", paddingVertical: 14, fontSize: 15 }}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#A8B5DB", fontSize: 13, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 }}>
              EMAIL ADDRESS
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1, borderColor: "rgba(171,139,255,0.25)",
              borderRadius: 12, paddingHorizontal: 14
            }}>
              <Ionicons name="mail-outline" size={18} color="#A8B5DB" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="your@email.com"
                placeholderTextColor="#4a4a6a"
                style={{ flex: 1, color: "#fff", paddingVertical: 14, fontSize: 15 }}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#A8B5DB", fontSize: 13, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 }}>
              PASSWORD
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1, borderColor: "rgba(171,139,255,0.25)",
              borderRadius: 12, paddingHorizontal: 14
            }}>
              <Ionicons name="lock-closed-outline" size={18} color="#A8B5DB" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Min. 6 characters"
                placeholderTextColor="#4a4a6a"
                secureTextEntry={!showPassword}
                style={{ flex: 1, color: "#fff", paddingVertical: 14, fontSize: 15 }}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A8B5DB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 26 }}>
            <Text style={{ color: "#A8B5DB", fontSize: 13, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 }}>
              CONFIRM PASSWORD
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1, borderColor: "rgba(171,139,255,0.25)",
              borderRadius: 12, paddingHorizontal: 14
            }}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#A8B5DB" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Repeat your password"
                placeholderTextColor="#4a4a6a"
                secureTextEntry={!showConfirm}
                style={{ flex: 1, color: "#fff", paddingVertical: 14, fontSize: 15 }}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#A8B5DB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16 }}
          >
            <LinearGradient
              colors={loading ? ["#5a4a8a", "#5a4a8a"] : ["#AB8BFF", "#7c5cbf"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="rocket-outline" size={20} color="#fff" />
              )}
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 }}>
                {loading ? "Creating account..." : "Create Account"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => router.push("/login" as any)}
            style={{ alignItems: "center", paddingVertical: 8 }}
          >
            <Text style={{ color: "#A8B5DB", fontSize: 14 }}>
              Already have an account?{" "}
              <Text style={{ color: "#AB8BFF", fontWeight: "700" }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Signup;
