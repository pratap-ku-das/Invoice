import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Searchbar, Chip, FAB, IconButton } from 'react-native-paper';
import { apiClient } from '../api/client';

export default function InvoicesScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/documents?type=invoice').then((res) => {
      setInvoices(res.data?.data || res.data || []);
    }).catch(() => {});
  }, []);

  const renderInvoiceItem = ({ item }: { item: any }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('InvoiceDetail', { id: item._id })}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleSmall" style={styles.invNumber}>#{item.number}</Text>
          <Chip style={styles.statusChip}>{item.status?.toUpperCase()}</Chip>
        </View>
        <Text variant="bodyMedium" style={styles.partyName}>{item.partyName || 'Cash Sale'}</Text>
        <View style={styles.cardFooter}>
          <Text variant="labelSmall" style={styles.date}>{item.date}</Text>
          <Text variant="titleMedium" style={styles.amount}>₹{(item.totalAmount || 0).toLocaleString('en-IN')}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search invoices or parties..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />
      <FlatList
        data={invoices}
        keyExtractor={(item) => item._id}
        renderItem={renderInvoiceItem}
        contentContainerStyle={styles.listContent}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  searchbar: { marginBottom: 12, backgroundColor: '#ffffff', borderRadius: 16 },
  listContent: { paddingBottom: 80 },
  card: { marginBottom: 10, borderRadius: 16, backgroundColor: '#ffffff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invNumber: { fontWeight: '800', color: '#1e293b' },
  statusChip: { height: 26 },
  partyName: { fontWeight: '700', color: '#475569', marginVertical: 6 },
  cardFooter: { flexDirection: 'row', justify: 'space-between', alignItems: 'center', marginTop: 4 },
  date: { color: '#94a3b8' },
  amount: { fontWeight: '900', color: '#0f172a' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4f46e5' },
});
