import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle glow animation
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    return () => glowLoop.stop();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication with user data
    setTimeout(() => {
      setIsLoading(false);
      
      // Create user data object
      const userData = {
        id: `user_${Date.now()}`,
        email: email.trim(),
        name: email.split('@')[0], // Use email prefix as name
        authToken: `token_${Date.now()}`, // Simulated auth token
        loginTime: new Date().toISOString(),
      };
      
      // Navigate to main tabs with user data
      navigation.replace('MainTabs', { userData });
    }, 2000);
  };

  const handleOAuthLogin = (provider) => {
    console.log(`OAuth login with ${provider}`);
    // TODO: Implement OAuth authentication
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" translucent />
      
      {/* Background */}
      <LinearGradient
        colors={['#0a0a0a', '#111111', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated background elements */}
      <Animated.View 
        style={[
          styles.glowOrb1,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.25],
            }),
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.glowOrb2,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.3],
            }),
          }
        ]}
      />

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={['#2563eb', '#7c3aed', '#db2777']}
              style={styles.logoGradient}
            >
              <Ionicons name="newspaper" size={28} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.appTitle}>NewsPortal</Text>
            <Text style={styles.subtitle}>Stay informed. Stay connected.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputFocused
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedInput === 'email' ? '#2563eb' : '#666666'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email address"
                    placeholderTextColor="#666666"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </BlurView>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'password' ? '#2563eb' : '#666666'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="Password"
                    placeholderTextColor="#666666"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    autoComplete="password"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563eb', '#7c3aed']}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View 
                      style={[
                        styles.loadingDot,
                        { 
                          opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        }
                      ]} 
                    />
                    <Text style={styles.buttonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.line} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity 
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin('google')}
              activeOpacity={0.7}
            >
              <BlurView intensity={15} tint="dark" style={styles.oauthBlur}>
                <Ionicons name="logo-google" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin('apple')}
              activeOpacity={0.7}
            >
              <BlurView intensity={15} tint="dark" style={styles.oauthBlur}>
                <Ionicons name="logo-apple" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin('microsoft')}
              activeOpacity={0.7}
            >
              <BlurView intensity={15} tint="dark" style={styles.oauthBlur}>
                <Ionicons name="desktop-outline" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  glowOrb1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#2563eb',
    top: -100,
    right: -75,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 50,
  },
  glowOrb2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7c3aed',
    bottom: -50,
    left: -40,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '400',
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputBlur: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    minHeight: 54,
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
  },
  loginButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 8,
  },
  forgotPasswordText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#666666',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  oauthButton: {
    width: 54,
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  oauthBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#888888',
    fontSize: 15,
  },
  signupLink: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen;