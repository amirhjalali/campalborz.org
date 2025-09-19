import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from '../../../App';

interface TabIconProps {
  name: keyof MainTabParamList;
  focused: boolean;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color, size }) => {
  const getIconName = (tabName: keyof MainTabParamList, isFocused: boolean) => {
    switch (tabName) {
      case 'Home':
        return isFocused ? 'home' : 'home-outline';
      case 'Events':
        return isFocused ? 'calendar' : 'calendar-outline';
      case 'Members':
        return isFocused ? 'people' : 'people-outline';
      case 'Notifications':
        return isFocused ? 'notifications' : 'notifications-outline';
      case 'Profile':
        return isFocused ? 'person' : 'person-outline';
      default:
        return 'help-outline';
    }
  };

  return (
    <Ionicons 
      name={getIconName(name, focused) as any} 
      size={size} 
      color={color} 
    />
  );
};

export default TabIcon;