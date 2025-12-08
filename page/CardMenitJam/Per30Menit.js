import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Platform,
  Modal // Tambahkan import Modal
} from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons
} from "@expo/vector-icons";
import { useParams, useLocation, useNavigate } from "react-router-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  bg: "#F4F6F8",
  card: "#FFFFFF",
  primary: "#0277BD",
  accent: "#C2185B",
  success: "#2E7D32", // Warna untuk success
  textMain: "#263238",
  textSec: "#78909C",
  border: "#CFD8DC",
  inputBg: "#FAFAFA",
  disabled: "#ECEFF1"
};

const toLocalISOString = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - tzOffset);
  return localTime.toISOString().slice(0, -1);
};

export default function Per30Menit() {
  const { id } = useParams(); // ID Partograf Pasien
  const navigate = useNavigate();

  const [catatanPartografId, setCatatanPartografId] = useState(null);
  const [isDataTersimpan, setIsDataTersimpan] = useState(false);

  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [djj, setDjj] = useState("");
  const [nadi, setNadi] = useState("");
  const [waktuCatat, setWaktuCatat] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);

  // State Draft
  const [hasDraft, setHasDraft] = useState(false);

  // --- STATE BARU UNTUK NOTIFIKASI KUSTOM ---
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    type: "success", // success | error | info
    title: "",
    message: ""
  });

  // --- FUNGSI BARU UNTUK MENAMPILKAN NOTIFIKASI ---
  const showNotification = (type, title, message) => {
    setAlertMessage({ type, title, message });
    setShowCustomAlert(true);
  };

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("userToken");
      setUserToken(token);

      // Cek apakah ada Draft Kontraksi untuk pasien ini
      const draftKey = `kontraksi_draft_${id}`;
      const draftData = await AsyncStorage.getItem(draftKey);
      if (draftData && JSON.parse(draftData).length > 0) {
        setHasDraft(true);
      }
    };
    init();
  }, [id]);

  // --- FUNGSI PENTING: SYNC DRAFT KE SERVER ---
  const syncDraftKontraksi = async (newCatatanId, token) => {
    const draftKey = `kontraksi_draft_${id}`;
    try {
      const draftStr = await AsyncStorage.getItem(draftKey);
      if (!draftStr) return;

      const drafts = JSON.parse(draftStr);
      console.log(`Syncing ${drafts.length} drafts...`);

      // Loop upload satu per satu
      for (const item of drafts) {
        await fetch(
          `https://restful-api-bmc-production.up.railway.app/api/catatan-partograf/${newCatatanId}/kontraksi`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              waktu_mulai: item.waktu_mulai,
              waktu_selesai: item.waktu_selesai
            })
          }
        );
      }

      // Bersihkan Draft
      await AsyncStorage.removeItem(draftKey);
      setHasDraft(false);
      console.log("Sync Complete!");
    } catch (e) {
      console.error("Sync Error", e);
      // MENGGANTI ALERT STANDAR
      showNotification(
        "info",
        "Gagal Sync",
        "Gagal sinkronisasi kontraksi offline."
      );
    }
  };

  const submitVitals = async () => {
    // --- PENGECEKAN KOSONG ---
    if (!djj || !nadi)
      return showNotification(
        "error",
        "Form Kosong",
        "Isi DJJ, Nadi & Waktu Catat."
      );

    const djjNum = parseInt(djj);
    const nadiNum = parseInt(nadi);

    // --- PENGECEKAN TIPE DATA ---
    if (isNaN(djjNum) || djjNum.toString() !== djj) {
      return showNotification(
        "error",
        "Input Tidak Valid",
        "DJJ harus berupa angka."
      );
    }
    if (isNaN(nadiNum) || nadiNum.toString() !== nadi) {
      return showNotification(
        "error",
        "Input Tidak Valid",
        "Nadi harus berupa angka."
      );
    }

    // --- VALIDASI RENTANG DJJ (Contoh: 110-160 bpm) ---
    if (djjNum < 110 || djjNum > 160) {
      return showNotification(
        "error",
        "Nilai DJJ Tidak Wajar",
        "DJJ harus antara 110-160 bpm."
      );
    }

    // --- VALIDASI RENTANG NADI IBU (Contoh: 60-120 bpm) ---
    if (nadiNum < 60 || nadiNum > 120) {
      return showNotification(
        "error",
        "Nilai Nadi Ibu Tidak Wajar",
        "Nadi Ibu harus antara 60-120 bpm."
      );
    }

    setLoading(true);
    try {
      const waktuLokal = toLocalISOString(waktuCatat);
      const res = await fetch(
        `https://restful-api-bmc-production.up.railway.app/api/partograf/${id}/catatan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
          },
          body: JSON.stringify({
            partograf_id: id,
            djj: djjNum, // Kirim sebagai angka
            nadi_ibu: nadiNum, // Kirim sebagai angka
            waktu_catat: waktuLokal
          })
        }
      );
      const json = await res.json();

      if (res.ok && json.data?.id) {
        const newId = json.data.id;
        setCatatanPartografId(newId);
        setIsDataTersimpan(true);

        // === TRIGGER SYNC JIKA ADA DRAFT ===
        if (hasDraft) {
          await syncDraftKontraksi(newId, userToken);
        }

        // MENGGANTI ALERT STANDAR
        showNotification(
          "success",
          "Berhasil 🎉",
          "Data Vital & Kontraksi tersimpan."
        );
      } else {
        // MENGGANTI ALERT STANDAR
        showNotification("error", "Gagal 🛑", json.message);
      }
    } catch (e) {
      // MENGGANTI ALERT STANDAR
      showNotification(
        "error",
        "Error Jaringan",
        "Periksa koneksi internet Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigasi Cerdas
  const openMonitor = () => {
    if (catatanPartografId) {
      // Mode Online (Sudah ada ID)
      navigate(`/monitor-kontraksi/${catatanPartografId}/${id}`);
    } else {
      // Mode Draft (Belum ada ID)
      navigate(`/monitor-kontraksi-draft/${id}`);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar backgroundColor={THEME.bg} barStyle="dark-content" />

      {/* === MODAL NOTIFIKASI KUSTOM (Pop-up Berhasil/Gagal) === */}
      <Modal visible={showCustomAlert} transparent={true} animationType="fade">
        <View style={customModalStyles.centeredView}>
          <View
            style={[
              customModalStyles.modalView,
              {
                backgroundColor:
                  alertMessage.type === "success"
                    ? THEME.success
                    : alertMessage.type === "error"
                    ? THEME.accent
                    : THEME.primary // info/default color
              }
            ]}
          >
            <MaterialIcons
              name={alertMessage.type === "success" ? "check-circle" : "error"}
              size={36}
              color="white"
              style={{ marginBottom: 8 }}
            />
            <Text style={customModalStyles.modalTitle}>
              {alertMessage.title}
            </Text>
            <Text style={customModalStyles.modalText}>
              {alertMessage.message}
            </Text>

            <TouchableOpacity
              style={customModalStyles.closeButton}
              onPress={() => setShowCustomAlert(false)}
            >
              <Text style={customModalStyles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Observasi Rutin (30 Menit)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* === TOMBOL AKSES CEPAT (NEW) === */}
        <TouchableOpacity onPress={openMonitor} style={styles.quickAccessBtn}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="radar" size={24} color="#FFF" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.quickTitle}>Monitor Kontraksi</Text>
              <Text style={styles.quickSubtitle}>
                {isDataTersimpan ? "Tersambung (Online)" : "Mode Bebas (Draft)"}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Notifikasi Draft */}
        {!isDataTersimpan && hasDraft && (
          <View style={styles.draftBadge}>
            <MaterialCommunityIcons
              name="cloud-upload"
              size={16}
              color="#E65100"
            />
            <Text style={styles.draftText}>
              Ada data kontraksi offline. Simpan form di bawah untuk mengupload.
            </Text>
          </View>
        )}

        <View style={styles.medicalCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={22}
              color={THEME.accent}
            />
            <Text style={[styles.cardTitle, { color: THEME.accent }]}>
              TANDA VITAL
            </Text>
          </View>

          <View style={{ marginTop: 0 }}>
            <Text style={styles.label}>Waktu Catat</Text>
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              style={[styles.inputBox, { paddingVertical: 12 }]}
            >
              <Text style={{ color: THEME.textMain }}>
                {waktuCatat.toLocaleString()}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isPickerVisible}
              mode="datetime"
              date={waktuCatat}
              onConfirm={(date) => {
                setWaktuCatat(date);
                setPickerVisible(false);
              }}
              onCancel={() => setPickerVisible(false)}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DJJ (Fetal)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={djj}
                  onChangeText={setDjj}
                  keyboardType="numeric"
                  placeholder="140 (110-160)" // Info rentang
                  placeholderTextColor={THEME.textSec}
                />
                <Text style={styles.unit}>bpm</Text>
              </View>
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nadi (Ibu)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={nadi}
                  onChangeText={setNadi}
                  keyboardType="numeric"
                  placeholder="80 (60-120)" // Info rentang
                  placeholderTextColor={THEME.textSec}
                />
                <Text style={styles.unit}>bpm</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={submitVitals}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name={isDataTersimpan ? "check" : "save"}
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveBtnText}>
                  {isDataTersimpan ? "UPDATE DATA" : "SIMPAN & SYNC KONTRAKSI"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.bg },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  appBarTitle: { fontSize: 16, fontWeight: "700", color: THEME.textMain },
  backBtn: { padding: 4 },
  patientInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1F5FE",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#B3E5FC"
  },
  patientInfoText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0277BD",
    marginLeft: 8,
    letterSpacing: 0.5
  },
  medicalCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Ubah ke flex-start agar ikon dan judul berdekatan
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingBottom: 12
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMain,
    marginLeft: 8,
    letterSpacing: 0.5
  },
  formRow: { flexDirection: "row", marginTop: 10 },
  inputGroup: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textSec,
    marginBottom: 6,
    marginTop: 10
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 4,
    backgroundColor: THEME.inputBg,
    paddingHorizontal: 12
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: THEME.textMain,
    fontWeight: "600"
  },
  unit: { fontSize: 12, color: THEME.textSec },
  saveBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5
  },

  // NEW STYLES FOR QUICK ACCESS
  quickAccessBtn: {
    backgroundColor: "#37474F",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3
  },
  quickTitle: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  quickSubtitle: { color: "#CFD8DC", fontSize: 11, marginTop: 2 },
  draftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2"
  },
  draftText: { color: "#E65100", fontSize: 11, marginLeft: 8, flex: 1 }
});

// --- STYLES BARU UNTUK MODAL NOTIFIKASI KUSTOM ---
const customModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)" // Overlay semi-transparan
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%" // Sesuaikan lebar modal
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8
  },
  modalText: {
    color: "white",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 2,
    marginTop: 10
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  }
});
