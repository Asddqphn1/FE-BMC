import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView, // ⬅️ Tambahkan
  Platform // ⬅️ Tambahkan
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// -------------------------------------------------------------------------
// ❗️ PENTING: SESUAIKAN FIELD DI BAWAH INI
// -------------------------------------------------------------------------
// Saya tidak tahu field apa saja yg dibutuhkan BE untuk 'register-pasien'.
// Saya tebak berdasarkan UI-mu (nama, umur) dan standar (username, password).
// SESUAIKAN ini dengan apa yang diminta oleh teman BE kamu.
// -------------------------------------------------------------------------

export default function TambahPasienForm({
  onClose,
  onSuccess,
  token,
  apiUrl
}) {
  // State untuk data form
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState("");
  const [noRegister, setNoRegister] = useState("");
  const [username, setUsername] = useState(""); // ⬅️ Mungkin perlu?
  const [password, setPassword] = useState(""); // ⬅️ Mungkin perlu?

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validasi sederhana
    // ❗️ Sesuaikan validasi ini
    if (!nama || !umur || !username || !password) {
      Alert.alert("Error", "Harap isi Nama, Umur, Username, dan Password.");
      return;
    }

    setIsLoading(true);

    try {
      // ❗️ Sesuaikan body ini dgn yg dibutuhkan BE
      // Key di sini (cth: 'nama_pasien') HARUS SAMA dgn yg diharapkan BE
      const body = JSON.stringify({
        nama_pasien: nama, // Saya tebak nama key-nya
        umur: umur,
        no_register: noRegister,
        username: username,
        password: password
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}` // ⬅️ Pakai token
        },
        body: body
      });

      const data = await response.json();

      if (!response.ok) {
        // Coba ambil pesan error dari validasi Laravel
        if (response.status === 422 && data.errors) {
          const firstError = Object.values(data.errors)[0][0];
          throw new Error(firstError || "Data tidak valid.");
        }
        throw new Error(data.message || "Gagal mendaftarkan pasien.");
      }

      // Jika sukses
      setIsLoading(false);
      Alert.alert("Sukses", "Pasien baru berhasil didaftarkan.");
      onSuccess(); // ⬅️ Panggil fungsi sukses dari HomeScreen
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Registrasi Gagal", error.message);
    }
  };

  return (
    // View ini bertindak sebagai "overlay" semi-transparan
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.modalOverlay}
    >
      {/* Ini adalah card form-nya */}
      <View style={styles.formContainer}>
        {/* Header Form */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Tambah Pasien Baru</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#e0e0e0" />
          </TouchableOpacity>
        </View>

        {/* ⬅️ ScrollView HANYA membungkus form, bukan header */}
        <ScrollView>
          {/* Form Inputs */}
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama lengkap pasien"
            value={nama}
            onChangeText={setNama}
          />

          <Text style={styles.label}>Umur</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan umur (angka)"
            value={umur}
            onChangeText={setUmur}
            keyboardType="numeric"
          />

          <Text style={styles.label}>No. Register (Opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: P-030"
            value={noRegister}
            onChangeText={setNoRegister}
          />

          <View style={styles.divider} />

          <Text style={styles.label}>Username (untuk login pasien)</Text>
          <TextInput
            style={styles.input}
            placeholder="Buat username untuk pasien"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password (untuk login pasien)</Text>
          <TextInput
            style={styles.input}
            placeholder="Buat password untuk pasien"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          {/* Tombol Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Daftarkan Pasien</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // ⬅️ Latar belakang gelap
    justifyContent: "flex-end" // ⬅️ Form muncul dari bawah
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "80%" // ⬅️ Batasi tinggi modal
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    marginTop: 10
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    height: 45,
    fontSize: 14
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20
  },
  submitButton: {
    backgroundColor: "#448AFF",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold"
  }
});
