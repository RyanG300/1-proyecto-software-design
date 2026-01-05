import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export default function Alert({ visible, type = 'info', title, message, onClose }) {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', icon: '✓' };
      case 'error':
        return { backgroundColor: '#ef4444', icon: '✕' };
      case 'warning':
        return { backgroundColor: '#f59e0b', icon: '⚠' };
      default:
        return { backgroundColor: '#3b82f6', icon: 'ℹ' };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={[styles.iconContainer, { backgroundColor: alertStyle.backgroundColor }]}>
            <Text style={styles.icon}>{alertStyle.icon}</Text>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: alertStyle.backgroundColor }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
