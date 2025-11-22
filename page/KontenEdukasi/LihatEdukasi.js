import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocation, useNavigate } from "react-router-native";

const COLORS = {
  primary: "#009688",
  background: "#F5F7FA",
  white: "#FFFFFF",
  textMain: "#263238",
  textSec: "#546E7A",
  danger: "#EF5350",
  border: "#CFD8DC",
};

export default function LihatEdukasi() {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data dari state
  const { kontenData } = location.state || {};
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    Alert.alert(
      "Hapus Permanen?",
      "Materi ini akan hilang dari aplikasi pasien. Yakin?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const token = await AsyncStorage.getItem("userToken");
              const res = await fetch(
                `https://restful-api-bmc-production.up.railway.app/api/konten-edukasi/${kontenData.id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (res.ok) {
                Alert.alert("Terhapus", "Materi berhasil dihapus.", [
                  { text: "OK", onPress: () => navigate("/konten-edukasi") },
                ]);
              } else {
                Alert.alert("Gagal", "Gagal menghapus konten.");
              }
            } catch (err) {
              Alert.alert("Error", "Terjadi kesalahan server.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!kontenData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Data tidak ditemukan.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header Simple dengan Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Edukasi</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.labelId}>ID MATERI: {kontenData.id}</Text>
          <Text style={styles.judul}>{kontenData.judul_konten}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.bodyContainer}>
          <Text style={styles.isi}>{kontenData.isi_konten}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={{ marginRight: 8, fontSize: 18 }}>🗑️</Text>
              <Text style={styles.deleteText}>HAPUS MATERI INI</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  backText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },

  content: { padding: 20, paddingBottom: 100 },

  titleContainer: { marginBottom: 20 },
  labelId: {
    color: COLORS.textSec,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  judul: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
    lineHeight: 32,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginTop: 15, width: "30%" },

  bodyContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    minHeight: 300,
    elevation: 1,
  },
  isi: { fontSize: 16, color: COLORS.textMain, lineHeight: 26, textAlign: "justify" },

  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
