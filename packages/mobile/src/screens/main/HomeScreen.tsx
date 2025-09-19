import React from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { trpc } from '../../lib/trpc';

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Mock data queries - in real app these would use actual tRPC queries
  const [isRefreshing, setIsRefreshing] = React.useState(false);

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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    notificationButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    seeAllButton: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
    },
    statCard: {
      width: '50%',
      paddingHorizontal: 6,
      marginBottom: 12,
    },
    statCardInner: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
    },
    actionButton: {
      width: '25%',
      paddingHorizontal: 6,
      marginBottom: 12,
    },
    actionButtonInner: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: 11,
      color: colors.text,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
  });

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const mockStats = [
    { icon: 'people-outline', value: '247', label: 'Active Members', color: colors.primary },
    { icon: 'calendar-outline', value: '12', label: 'Upcoming Events', color: colors.success },
    { icon: 'notifications-outline', value: '3', label: 'New Updates', color: colors.warning },
    { icon: 'heart-outline', value: '$2.4K', label: 'Monthly Donations', color: colors.error },
  ];

  const mockEvents = [
    {
      id: '1',
      title: 'Weekly Planning Meeting',
      date: 'Today, 7:00 PM',
      attendees: 12,
      description: 'Discussing upcoming camp activities and logistics.',
    },
    {
      id: '2',
      title: 'Art Build Workshop',
      date: 'Tomorrow, 2:00 PM',
      attendees: 28,
      description: 'Collaborative art building session for the main installation.',
    },
    {
      id: '3',
      title: 'Fundraising Dinner',
      date: 'Sat, 6:00 PM',
      attendees: 45,
      description: 'Community dinner to raise funds for camp infrastructure.',
    },
  ];

  const quickActions = [
    { icon: 'add-circle-outline', label: 'New Event', color: colors.primary },
    { icon: 'people-outline', label: 'Members', color: colors.success },
    { icon: 'card-outline', label: 'Donate', color: colors.warning },
    { icon: 'chatbubble-outline', label: 'Messages', color: colors.info },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Camper'}!
            </Text>
            <Text style={styles.subtitle}>Welcome to Camp Alborz</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <View key={index} style={styles.actionButton}>
                <TouchableOpacity style={styles.actionButtonInner}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                  <Text style={styles.actionButtonText}>{action.label}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Camp Overview</Text>
          </View>
          <View style={styles.statsGrid}>
            {mockStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Ionicons 
                    name={stat.icon as any} 
                    size={32} 
                    color={stat.color}
                    style={styles.statIcon}
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.cardMeta}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.cardMetaText}>{event.date}</Text>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} style={{ marginLeft: 16 }} />
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

export default HomeScreen;