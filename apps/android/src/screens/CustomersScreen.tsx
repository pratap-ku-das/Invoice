import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Linking } from 'react-native';
import { Card, Text, Searchbar, Avatar, IconButton } from 'react-native-paper';
import { apiClient } from '../api/client';

export default function CustomersScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/parties?type=customer').then((res) => {
      setCustomers(res.data?.data || res.data || []);
    }).catch(() => {});
  }, []);

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(name)}`);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Text size={42} label={item.name ? item.name.charAt(0).toUpperCase() : 'C'} style={styles.avatar} />
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.phone}>{item.phone || 'No Phone'}</Text>
        </View>
        <View style={styles.actions}>
          {item.phone && (
            <>
              <IconButton icon="phone" size={20} iconColor="#0284c7" onPress={() => handleCall(item.phone)} />
              <IconButton icon="whatsapp" size={20} iconColor="#10b981" onPress={() => handleWhatsApp(item.phone, item.name)} />
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search customers or phone..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />
      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  searchbar: { marginBottom: 12, backgroundColor: '#ffffff', borderRadius: 16 },
  listContent: { paddingBottom: 80 },
  card: { marginBottom: 10, borderRadius: 16, backgroundColor: '#ffffff' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: '#4f46e5' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '800', color: '#0f172a' },
  phone: { color: '#64748b' },
  actions: { flexDirection: 'row' },
});
