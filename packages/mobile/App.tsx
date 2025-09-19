import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './src/lib/trpc';
import * as SecureStore from 'expo-secure-store';
import superjson from 'superjson';
import { mobileRealtimeClient } from './src/lib/realtime';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from './src/screens/main/HomeScreen';
import EventsScreen from './src/screens/main/EventsScreen';
import MembersScreen from './src/screens/main/MembersScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import NotificationsScreen from './src/screens/main/NotificationsScreen';

// Components
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import LoadingScreen from './src/components/ui/LoadingScreen';
import TabIcon from './src/components/ui/TabIcon';

// Types
export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Members: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Create TRPC client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/trpc',
      async headers() {
        const token = await getAuthToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
          'x-platform': 'mobile',
        };
      },
    }),
  ],
});

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon name={route.name as keyof MainTabParamList} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <MainTab.Screen 
        name="Members" 
        component={MembersScreen}
        options={{ tabBarLabel: 'Members' }}
      />
      <MainTab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          tabBarLabel: 'Alerts',
          tabBarBadge: undefined, // Would show notification count
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Initialize realtime connection when user is authenticated
    if (user) {
      mobileRealtimeClient.initialize().catch(console.error);
    } else {
      mobileRealtimeClient.disconnect().catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    // Handle app state changes for realtime connection
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      mobileRealtimeClient.handleAppStateChange(nextAppState);
    });

    return () => subscription?.remove();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="MainStack" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize app (load fonts, check auth state, etc.)
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true); // Still show app even if init fails
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}