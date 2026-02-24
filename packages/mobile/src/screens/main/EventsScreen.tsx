import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const EventsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    scrollView: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    cardMetaText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 6,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginTop: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
    },
  });

  const mockEvents = [
    {
      id: '1',
      title: 'Weekly Planning Meeting',
      date: 'Today, 7:00 PM',
      location: 'Community Center',
      attendees: 12,
      description: 'Discussing upcoming camp activities and logistics.',
    },
    {
      id: '2',
      title: 'Art Build Workshop',
      date: 'Tomorrow, 2:00 PM',
      location: 'Workshop Space',
      attendees: 28,
      description: 'Collaborative art building session for the main installation.',
    },
    {
      id: '3',
      title: 'Fundraising Dinner',
      date: 'Saturday, 6:00 PM',
      location: 'Event Hall',
      attendees: 45,
      description: 'Community dinner to raise funds for camp infrastructure.',
    },
  ];

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>Upcoming camp events and activities</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {mockEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.card}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.cardMetaText}>{event.date}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.cardMetaText}>{event.location}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.cardMetaText}>{event.attendees} attending</Text>
              </View>
              <Text style={styles.cardDescription}>{event.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventsScreen;
