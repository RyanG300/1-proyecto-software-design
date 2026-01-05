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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../components/Alert';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('warning', 'Missing Fields', 'Please enter your credentials.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      showAlert('error', 'Login Failed', result.error || 'Invalid credentials. Please try again.');
    }
    // La navegación se maneja automáticamente por el AuthContext
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);

    if (!result.success) {
      showAlert('error', 'Google Sign-In Failed', result.error || 'Could not sign in with Google.');
    }
    // La navegación se maneja automáticamente por el AuthContext
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
          <View style={[styles.glow, styles.glowBottom, { backgroundColor: `${theme.colors.primary}14` }]} />
          <View style={[styles.glow, styles.glowCenter, { backgroundColor: `${theme.colors.primary}1A` }]} />
        </View>
        
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border }]}>
              <Ionicons name="game-controller" size={48} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>GAME_ON</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>LEVEL UP YOUR EXPERIENCE</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Gamertag or Email"
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

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotButton}
              onPress={() => showAlert(
                'info',
                'Forgot Password',
                'Password recovery feature coming soon.'
              )}
            >
              <Text style={[styles.forgotText, { color: theme.colors.textSecondary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, { shadowColor: theme.colors.primary, opacity: isLoading ? 0.6 : 1 }]} 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>{isLoading ? 'LOGGING IN...' : 'LOGIN'}</Text>
                {!isLoading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR CONNECT WITH</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
              activeOpacity={0.8}
              onPress={() => showAlert('info', 'Social Login', 'Feature coming soon.')}
              disabled={isLoading}
            >
              <Ionicons name="logo-facebook" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
              activeOpacity={0.8}
              onPress={() => showAlert('info', 'Social Login', 'Feature coming soon.')}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sign Up */}
          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signupLink, { color: theme.colors.text }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    width: 500,
    height: 500,
  },
  glowBottom: {
    bottom: '-10%',
    right: '-10%',
    width: 400,
    height: 400,
  },
  glowCenter: {
    top: '40%',
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 3,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
