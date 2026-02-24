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

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'event';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationsScreen: React.FC = () => {
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    markAllButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    markAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    scrollView: {
      paddingTop: 8,
    },
    notificationItem: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notificationUnread: {
      backgroundColor: colors.surface,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    notificationMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    notificationTime: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 6,
      marginLeft: 8,
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

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'event',
      title: 'New Event Added',
      message: 'Weekly Planning Meeting has been scheduled for tonight at 7 PM.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Registration Approved',
      message: 'Your camp membership has been approved. Welcome to Camp Alborz!',
      time: '1 day ago',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Art Build Update',
      message: 'New materials have arrived for the HOMA installation project.',
      time: '2 days ago',
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Dues Reminder',
      message: 'Camp dues for this season are due by the end of the month.',
      time: '3 days ago',
      read: true,
    },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return { name: 'calendar-outline' as const, color: colors.primary };
      case 'success':
        return { name: 'checkmark-circle-outline' as const, color: colors.success };
      case 'warning':
        return { name: 'warning-outline' as const, color: colors.warning };
      case 'info':
      default:
        return { name: 'information-circle-outline' as const, color: colors.info };
    }
  };

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {mockNotifications.length > 0 ? (
          mockNotifications.map((notification) => {
            const icon = getNotificationIcon(notification.type);
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read ? styles.notificationUnread : undefined,
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                  <Ionicons name={icon.name} size={22} color={icon.color} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
