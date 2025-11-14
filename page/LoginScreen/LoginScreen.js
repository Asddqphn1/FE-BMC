import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // ⬅️ Tambahkan Alert
  ActivityIndicator // ⬅️ Tambahkan Loading
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. Fungsi untuk handle login ---
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Login Gagal", "Username dan Password tidak boleh kosong.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/login-bidan`, {
        method: "POST", // ⬅️ Tentukan method
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Username atau Password salah.");
      }

      setIsLoading(false);
      console.log("Respon sukses:", data);
      Alert.alert("Sukses", "Login berhasil!");
    } catch (error) {
      setIsLoading(false);
      console.error("Error saat login:", error.message);

      let errorMessage = error.message;

      // Error paling umum jika 'adb reverse' belum jalan
      if (error.message.includes("Network request failed")) {
        errorMessage =
          "Koneksi ke server gagal. Pastikan 'adb reverse tcp:8000 tcp:8000' sudah dijalankan.";
      }

      Alert.alert("Login Gagal", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Image source={require("../../assets/Logo.png")} style={styles.logo} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>Ruang</Text>
          <Text style={styles.subtitle}>Bunda</Text>
        </View>
      </View>

      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/Dokter.png")}
          style={styles.doctorImage}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Login</Text>

          <Text style={styles.label}>Username:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#ccc"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <FontAwesome
              name="user"
              size={20}
              color="#fff"
              style={styles.icon}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              value={password} // ⬅️ Hubungkan ke state
              onChangeText={setPassword} // ⬅️ Hubungkan ke state
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color="#fff"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Remember & Forgot */}
          <View style={styles.rememberRow}>
            <View style={styles.checkboxContainer}>
              <View style={styles.checkbox} />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Tombol Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin} // ⬅️ Panggil fungsi login
            disabled={isLoading} // ⬅️ Matikan tombol saat loading
          >
            {/* ⬅️ Tampilkan loading atau teks */}
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F2",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginLeft: 20,
    marginBottom: 10,
    alignSelf: "flex-start"
  },
  logo: {
    width: 55,
    height: 55,
    resizeMode: "contain",
    marginRight: 6
  },
  textBlock: {
    flexDirection: "column"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000"
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#448AFF"
  },
  imageWrapper: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center"
  },
  doctorImage: {
    width: "100%",
    height: 500,
    resizeMode: "contain"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    width: "100%"
  },
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    width: "100%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingVertical: 70,
    paddingHorizontal: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    marginTop: -30
  },
  label: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: -10,
    fontSize: 14,
    color: "#000"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#448AFF",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginTop: 20,
    width: "97%",
    height: 45
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14
  },
  icon: {
    marginLeft: 10
  },
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginTop: 10,
    alignItems: "center"
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkbox: {
    width: 14,
    height: 14,
    backgroundColor: "#448AFF",
    marginRight: 6
  },
  rememberText: {
    fontSize: 12,
    color: "#000"
  },
  forgotText: {
    fontSize: 12,
    color: "#000",
    textDecorationLine: "underline"
  },
  loginButton: {
    backgroundColor: "#448AFF",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 45,
    marginTop: 15,
    minHeight: 40,
    justifyContent: "center"
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
