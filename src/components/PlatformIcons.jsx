import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Icono personalizado para Nintendo Switch 1
export const NintendoSwitchIcon = ({ size = 28, color = '#e60012' }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Ionicons name="game-controller" size={size * 0.8} color={color} />
    </View>
  );
};

// Icono personalizado para Nintendo Switch 2
export const NintendoSwitch2Icon = ({ size = 28, color = '#e60012' }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={styles.switch2Container}>
        <Ionicons name="game-controller" size={size * 0.7} color={color} />
        <View style={[styles.badge, { 
          width: size * 0.35, 
          height: size * 0.35,
          borderRadius: size * 0.175 
        }]}>
          <Ionicons name="add" size={size * 0.25} color="#fff" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  switch2Container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#e60012',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
});
