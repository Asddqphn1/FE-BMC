import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal
} from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import FormTambahPasien from "./FormTambahPasien";

// Komponen Card Pasien (statik)
const PasienCard = ({ pasien }) => {
  const getStatusStyle = (status) => {
    const safeStatus = status ? status.toLowerCase() : "non aktif";
    switch (safeStatus) {
      case "aktif":
        return {
          borderColor: "#29b6f6",
          badgeColor: "#29b6f6",
          badgeText: "Aktif"
        };
      case "selesai":
        return {
          borderColor: "#448AFF",
          badgeColor: "#448AFF",
          badgeText: "Selesai"
        };
      case "non aktif":
      default:
        return {
          borderColor: "#e0e0e0",
          badgeColor: "#bdbdbd",
          badgeText: "Non Aktif"
        };
    }
  };
  const { borderColor, badgeColor, badgeText } = getStatusStyle(pasien.status);

  return (
    <View style={[styles.card, { borderColor: borderColor }]}>
      <FontAwesome name="user-circle" size={50} color="#555" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardNama}>{pasien.nama}</Text>
        <Text style={styles.cardDetail}>Umur: {pasien.umur} tahun</Text>
        <Text style={styles.cardDetail}>
          No. Register: {pasien.no_register}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data sementara
  const pasienList = [
    {
      nama: "Contoh Megawati",
      umur: 27,
      no_register: "P-001",
      status: "aktif"
    },
    {
      nama: "Contoh Samsinar",
      umur: 33,
      no_register: "P-024",
      status: "non aktif"
    },
    { nama: "Contoh Burung", umur: 24, no_register: "P-018", status: "selesai" }
  ];

  const handleFormSuccess = () => {
    setModalVisible(false);
    // nanti bisa ditambahkan untuk refresh list
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <Image
            source={require("../../assets/Logo.png")}
            style={styles.logoStetoskop}
          />
          <View>
            <Text style={styles.headerTitle}>Ruang</Text>
            <Text style={[styles.headerTitle, { color: "#448AFF" }]}>
              Bunda
            </Text>
          </View>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput style={styles.searchInput} placeholder="Search..." />
      </View>

      {/* Konten (Daftar Pasien) */}
      <ScrollView style={styles.contentArea}>
        {pasienList.map((pasien, index) => (
          <PasienCard key={index} pasien={pasien} />
        ))}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Ionicons name="home" size={24} color="#448AFF" />
          <Text style={styles.navTextActive}>Home</Text>
        </View>

        <TouchableOpacity style={styles.chatButton}>
          <MaterialIcons name="chat-bubble" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={40} color="white" />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <FontAwesome name="user-o" size={24} color="#999" />
          <Text style={styles.navText}>Profil</Text>
        </View>
      </View>

      {/* Modal Form Tambah Pasien */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <FormTambahPasien
          onClose={() => setModalVisible(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </View>
  );
}

// Styles tetap sama seperti versi sebelumnya
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  headerLogo: { flexDirection: "row", alignItems: "center" },
  logoStetoskop: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 8
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#eee"
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40 },
  contentArea: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardNama: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4
  },
  cardDetail: { fontSize: 14, color: "#777", marginTop: 4 },
  badge: {
    position: "absolute",
    top: 10,
    right: 15,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#FFFFFF",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0"
  },
  navItem: { alignItems: "center", flex: 1 },
  navText: { fontSize: 12, color: "#999" },
  navTextActive: { fontSize: 12, color: "#448AFF", fontWeight: "bold" },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#448AFF",
    justifyContent: "center",
    alignItems: "center",
    bottom: 25,
    elevation: 5,
    shadowColor: "#448AFF",
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  chatButton: {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#448AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  }
});
