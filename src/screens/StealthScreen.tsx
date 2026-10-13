import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

interface Props {
  onExit: () => void;
}

/**
 * Layar Samaran (Stealth Screen / Panic Screen).
 * Ditampilkan saat tombol Tutup Cepat ditekan: antarmuka berubah menjadi aplikasi
 * catatan kuliah/kerja polos tanpa indikasi kesehatan mental sama sekali.
 */
export const StealthScreen: React.FC<Props> = ({ onExit }) => {
  const [note, setNote] = useState(
    'Catatan Rapat Mingguan:\n1. Evaluasi sprint berjalan lancar\n2. Pengumpulan materi sebelum Jumat pukul 17.00\n3. Koordinasi dengan tim desain untuk aset materi'
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Catatan</Text>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitLabel}>Kembali</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dateLabel}>Diperbarui hari ini, 14.30</Text>
        <TextInput
          style={styles.input}
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Tulis catatan di sini..."
          placeholderTextColor="#9CA3AF"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  exitBtn: { padding: 6 },
  exitLabel: { fontSize: 13, color: '#6B7280' },
  content: { padding: spacing.marginMobile },
  dateLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: spacing.sm },
  input: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
    minHeight: 300,
    textAlignVertical: 'top',
  },
});
