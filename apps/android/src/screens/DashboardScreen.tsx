import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, FAB, Surface, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { apiClient } from '../api/client';

export default function DashboardScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/stats');
      setStats(res.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Header */}
        <Surface style={styles.heroCard} elevation={3}>
          <Text variant="titleMedium" style={styles.heroSub}>Today's Revenue</Text>
          <Text variant="displaySmall" style={styles.heroAmount}>
            ₹{(stats?.todaySales ?? 0).toLocaleString('en-IN')}
          </Text>

          <View style={styles.heroRow}>
            <Text style={styles.heroText}>This Month: ₹{(stats?.monthlySales ?? 0).toLocaleString('en-IN')}</Text>
            <Chip icon="clock-outline" style={styles.heroChip}>Synced</Chip>
          </View>
        </Surface>

        {/* Vyapar/Khatabook Style Money In / Money Out */}
        <View style={styles.row}>
          <Card style={[styles.flexCard, styles.getCard]}>
            <Card.Content>
              <Text variant="labelSmall" style={styles.getLabel}>YOU'LL GET</Text>
              <Text variant="headlineSmall" style={styles.getAmount}>
                ₹{(stats?.pendingPayments ?? 0).toLocaleString('en-IN')}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.flexCard, styles.payCard]}>
            <Card.Content>
              <Text variant="labelSmall" style={styles.payLabel}>YOU'LL PAY</Text>
              <Text variant="headlineSmall" style={styles.payAmount}>
                ₹0.00
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Action Grid */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <Surface style={styles.actionBtn} elevation={1} onPress={() => navigation.navigate('Invoices')}>
            <IconButton icon="file-document-outline" size={28} iconColor="#4f46e5" />
            <Text variant="labelMedium" style={styles.actionLabel}>+ Invoice</Text>
          </Surface>

          <Surface style={styles.actionBtn} elevation={1} onPress={() => navigation.navigate('Customers')}>
            <IconButton icon="account-plus-outline" size={28} iconColor="#10b981" />
            <Text variant="labelMedium" style={styles.actionLabel}>+ Customer</Text>
          </Surface>

          <Surface style={styles.actionBtn} elevation={1} onPress={() => navigation.navigate('Inventory')}>
            <IconButton icon="package-variant-closed" size={28} iconColor="#8b5cf6" />
            <Text variant="labelMedium" style={styles.actionLabel}>+ Item</Text>
          </Surface>

          <Surface style={styles.actionBtn} elevation={1} onPress={() => navigation.navigate('Barcode')}>
            <IconButton icon="barcode-scan" size={28} iconColor="#f59e0b" />
            <Text variant="labelMedium" style={styles.actionLabel}>Scan</Text>
          </Surface>
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <FAB
        icon="plus"
        label="New Bill"
        style={styles.fab}
        onPress={() => navigation.navigate('Invoices')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 80 },
  heroCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroSub: { color: '#c7d2fe', fontWeight: '700' },
  heroAmount: { color: '#ffffff', fontWeight: '900', marginVertical: 6 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  heroText: { color: '#e0e7ff', fontWeight: '600' },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.2)' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  flexCard: { flex: 1, borderRadius: 20 },
  getCard: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1 },
  getLabel: { color: '#047857', fontWeight: '800' },
  getAmount: { color: '#065f46', fontWeight: '900', marginTop: 4 },
  payCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
  payLabel: { color: '#b91c1c', fontWeight: '800' },
  payAmount: { color: '#991b1b', fontWeight: '900', marginTop: 4 },
  sectionHeader: { fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 16, padding: 10, alignItems: 'center', backgroundColor: '#ffffff' },
  actionLabel: { fontWeight: '700', color: '#334155' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4f46e5' },
});
