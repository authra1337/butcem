import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { User, Lock, ArrowRight, UserPlus, LogIn, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { getUserList, authenticateUser, createUser } from '../database/db';
import LiquidBackground from './LiquidBackground';
import GlassCard from './GlassCard';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLoginSuccess }) {
  const [users, setUsers] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form alanları
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mevcut kullanıcı profillerini yükle
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const list = await getUserList();
      setUsers(list);
      // Eğer tek bir kullanıcı varsa, varsayılan olarak onu seç
      if (list.length === 1) {
        setSelectedProfile(list[0]);
      }
    } catch (e) {
      console.log('Profiller yüklenirken hata oluştu:', e);
    }
  };

  const handleLogin = async () => {
    const targetUsername = selectedProfile ? selectedProfile.username : username.trim();
    if (!targetUsername || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authenticateUser(targetUsername, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı.');
      }
    } catch (e) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Hata', 'Şifre en az 4 karakterden oluşmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await createUser(trimmedUser, password);
      Alert.alert('Başarılı', 'Profil başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.', [
        {
          text: 'Tamam',
          onPress: () => {
            setIsRegistering(false);
            loadProfiles();
            // Yeni oluşturulan profili doğrudan seç
            setSelectedProfile(user);
            setPassword('');
          }
        }
      ]);
    } catch (e) {
      Alert.alert('Hata', 'Bu kullanıcı adı zaten alınmış veya bir veritabanı hatası oluştu.');
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LiquidBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo ve Başlık */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <ShieldCheck size={32} color="#00f2fe" />
            </View>
            <Text style={styles.title}>Bütçem</Text>
            <Text style={styles.subtitle}>Gelişmiş Bütçe ve Portföy Takibi</Text>
          </View>

          {/* Profil Seçici (Giriş yapılıyorsa ve kayıtlı profil varsa) */}
          {!isRegistering && users.length > 0 && !selectedProfile && (
            <GlassCard style={styles.profileSection} intensity={40}>
              <Text style={styles.sectionTitle}>Profil Seçin</Text>
              <View style={styles.profileGrid}>
                {users.map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => setSelectedProfile(u)}
                    style={({ pressed }) => [
                      styles.profileItem,
                      pressed && { transform: [{ scale: 0.95 }] }
                    ]}
                  >
                    <View style={styles.profileAvatar}>
                      <Text style={styles.avatarText}>{u.username[0].toUpperCase()}</Text>
                    </View>
                    <Text style={styles.profileName} numberOfLines={1}>{u.username}</Text>
                  </Pressable>
                ))}

                {/* Yeni Profil Ekleme Butonu */}
                <Pressable
                  onPress={() => setIsRegistering(true)}
                  style={({ pressed }) => [
                    styles.profileItem,
                    pressed && { transform: [{ scale: 0.95 }] }
                  ]}
                >
                  <View style={[styles.profileAvatar, styles.addProfileAvatar]}>
                    <UserPlus size={24} color="#00f2fe" />
                  </View>
                  <Text style={styles.profileName}>Yeni Ekle</Text>
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Form Alanı */}
          {(isRegistering || selectedProfile || users.length === 0) && (
            <GlassCard style={styles.formCard} intensity={45}>
              {/* Geri Butonu (Profil Seçimine dönmek için) */}
              {!isRegistering && users.length > 0 && selectedProfile && (
                <Pressable
                  onPress={() => {
                    setSelectedProfile(null);
                    setPassword('');
                  }}
                  style={styles.backButton}
                >
                  <ChevronLeft size={18} color="rgba(255, 255, 255, 0.6)" />
                  <Text style={styles.backButtonText}>Profillere Dön</Text>
                </Pressable>
              )}

              <Text style={styles.formTitle}>
                {isRegistering
                  ? 'Yeni Profil Oluştur'
                  : selectedProfile
                  ? `${selectedProfile.username} Giriş Yap`
                  : 'Giriş Yap'}
              </Text>

              {/* Kullanıcı Adı Girişi (Sadece kayıt veya sıfır profil varsa gösterilir) */}
              {(isRegistering || !selectedProfile) && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Kullanıcı Adı</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Kullanıcı adınızı girin"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              )}

              {/* Şifre Girişi */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Şifrenizi girin"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Gönder Butonu */}
              <Pressable
                onPress={isRegistering ? handleRegister : handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#090514" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {isRegistering ? 'Profil Oluştur' : 'Giriş Yap'}
                    </Text>
                    {isRegistering ? (
                      <UserPlus size={18} color="#090514" />
                    ) : (
                      <LogIn size={18} color="#090514" />
                    )}
                  </>
                )}
              </Pressable>

              {/* Alt Toggle Seçeneği */}
              <View style={styles.toggleFooter}>
                <Text style={styles.footerText}>
                  {isRegistering ? 'Zaten bir profiliniz var mı?' : 'İlk defa mı kullanıyorsunuz?'}
                </Text>
                <Pressable
                  onPress={() => {
                    setIsRegistering(!isRegistering);
                    setSelectedProfile(null);
                    setPassword('');
                    setUsername('');
                  }}
                >
                  <Text style={styles.footerLink}>
                    {isRegistering ? 'Giriş Ekranına Dön' : 'Yeni Profil Oluştur'}
                  </Text>
                </Pressable>
              </View>
            </GlassCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090514',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
    fontWeight: '500',
  },
  profileSection: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  profileItem: {
    alignItems: 'center',
    width: 76,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addProfileAvatar: {
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    borderColor: 'rgba(0, 242, 254, 0.2)',
    borderStyle: 'dashed',
  },
  avatarText: {
    color: '#00f2fe',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  formCard: {
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#00f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitBtnText: {
    color: '#090514',
    fontSize: 15,
    fontWeight: '800',
  },
  toggleFooter: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  footerLink: {
    color: '#00f2fe',
    fontSize: 12,
    fontWeight: '700',
  },
});
