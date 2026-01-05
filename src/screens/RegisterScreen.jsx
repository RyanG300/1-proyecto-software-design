import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../components/Alert';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (type, title, message) => {
    setAlert({ visible: true, type, title, message });
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username);
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert('warning', 'Incomplete Fields', 'Please fill in all fields to continue.');
      return;
    }

    if (!validateUsername(username)) {
      showAlert('error', 'Invalid Username', 'Username must be at least 3 characters and contain only letters, numbers, and underscores.');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showAlert('error', 'Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('error', 'Passwords Don\'t Match', 'The passwords you entered are not the same.');
      return;
    }

    setIsLoading(true);
    const result = await register(username.trim(), email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      showAlert('success', 'Account Created!', `Welcome ${username}! Please log in to continue.`);
      // Navegar al Login después de 1.5 segundos
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } else {
      showAlert('error', 'Registration Failed', result.error || 'Could not create account.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="dark" />
        
        {/* Ambient Background Glows */}
        <View style={styles.glowContainer}>
          <View style={[styles.glow, styles.glowTop, { backgroundColor: `${theme.colors.primary}26` }]} />
          <View style={[styles.glow, styles.glowBottom, { backgroundColor: `${theme.colors.primary}26` }]} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header / Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme.colors.surfaceLight }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.colors.text }]}>New Player</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Create your profile to join the squad.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Username"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Email Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Email Address"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="lock-open-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, { shadowColor: theme.colors.primary, opacity: isLoading ? 0.6 : 1 }]} 
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
                {!isLoading && <Ionicons name="chevron-forward" size={20} color="#ffffff" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer - Sign In */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Component */}
      <Alert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
  },
  glowTop: {
    top: '-10%',
    left: '-10%',
    width: '80%',
    height: 400,
  },
  glowBottom: {
    bottom: '-10%',
    right: '-10%',
    width: '60%',
    height: 300,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 512,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    height: 64,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    marginTop: 16,
    borderRadius: 32,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
