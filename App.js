import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { 
  Plus, 
  Home, 
  BarChart2, 
  Settings, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X,
  TrendingUp,
  Briefcase,
  LogOut,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react-native';

// Özel Bileşenler
import LiquidBackground from './src/components/LiquidBackground';
import GlassCard from './src/components/GlassCard';
import ExpenseChart from './src/components/ExpenseChart';
import LoginScreen from './src/components/LoginScreen';
import FundsScreen from './src/components/FundsScreen';
import FinancialCalendar from './src/components/FinancialCalendar';

// Veritabanı İşlemleri
import { 
  initDatabase, 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  getUserSettings, 
  updateUserSettings, 
  clearAllUserData,
  getFunds,
  updateUserTheme
} from './src/database/db';



const { width } = Dimensions.get('window');

const THEMES = {
  midnight: {
    name: 'Midnight Cyan',
    primary: '#00f2fe',
    secondary: '#00e676',
    accent: '#ff2a8d',
    background: '#090514',
    bgGradient: ['#090514', '#140c28', '#080312'],
    blobColors: ['#ff2a8d', '#00f2fe', '#7f00ff'],
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  neon: {
    name: 'Neon Purple',
    primary: '#bd00ff',
    secondary: '#ff007f',
    accent: '#00f2fe',
    background: '#0c051a',
    bgGradient: ['#0c051a', '#180736', '#090314'],
    blobColors: ['#bd00ff', '#ff007f', '#00f2fe'],
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  emerald: {
    name: 'Emerald Gold',
    primary: '#00e676',
    secondary: '#ffd700',
    accent: '#ff5b00',
    background: '#020f08',
    bgGradient: ['#020f08', '#062413', '#010a05'],
    blobColors: ['#00e676', '#ffd700', '#00ffc4'],
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  ocean: {
    name: 'Ocean Teal',
    primary: '#00e5ff',
    secondary: '#0099ff',
    accent: '#ffcc00',
    background: '#040d1a',
    bgGradient: ['#040d1a', '#0a1d3a', '#020710'],
    blobColors: ['#00e5ff', '#0099ff', '#ffcc00'],
    cardBg: 'rgba(255, 255, 255, 0.05)',
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('₺');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics' | 'investments' | 'settings'
  const [analyticsSubTab, setAnalyticsSubTab] = useState('chart'); // 'chart' | 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tema ve Yatırım Fonları State'i
  const [themeKey, setThemeKey] = useState('midnight');
  const [funds, setFunds] = useState([]);

  // Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('expense'); // 'expense' | 'income'
  const [txCategory, setTxCategory] = useState('gida'); // 'gida' | 'alisveris' | 'ulasim' | 'eglence' | 'diger'

  // Veritabanını Başlat
  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Veritabanı başarıyla başlatıldı.');
      })
      .catch((err) => {
        console.log('Veritabanı başlatma hatası:', err);
      });
  }, []);

  // Kullanıcı değiştikçe verileri yükle
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    }
  }, [currentUser]);

  // Eski AsyncStorage verilerini SQLite'a taşı (Migration)
  const migrateData = async (userId) => {
    try {
      const storedTx = await AsyncStorage.getItem('@transactions');
      const storedCur = await AsyncStorage.getItem('@currency');

      if (storedTx) {
        const localTransactions = JSON.parse(storedTx);
        const dbTx = await getTransactions(userId);
        // Eğer DB boşsa göç ettir
        if (dbTx.length === 0) {
          for (const tx of localTransactions) {
            await addTransaction(userId, tx);
          }
        }
        await AsyncStorage.removeItem('@transactions');
      }

      if (storedCur) {
        await updateUserSettings(userId, storedCur);
        await AsyncStorage.removeItem('@currency');
      }
    } catch (e) {
      console.log('Veri taşıma hatası:', e);
    }
  };

  const loadUserData = async (userId) => {
    try {
      // Önce varsa göç işlemini yap
      await migrateData(userId);

      // Verileri SQLite'tan çek
      const txList = await getTransactions(userId);
      const settings = await getUserSettings(userId);
      const fundsList = await getFunds(userId);
      
      setTransactions(txList);
      setCurrency(settings.currency);
      setThemeKey(settings.theme || 'midnight');
      setFunds(fundsList);
    } catch (e) {
      console.log('Kullanıcı verisi yükleme hatası:', e);
    }
  };

  // Yeni İşlem Ekle
  const handleAddTransaction = async () => {
    if (!txTitle.trim() || !txAmount.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const numericAmount = parseFloat(txAmount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    const newTransaction = {
      id: Date.now().toString(),
      title: txTitle.trim(),
      amount: numericAmount,
      type: txType,
      category: txType === 'income' ? 'diger' : txCategory,
      date: formattedDate,
    };

    try {
      await addTransaction(currentUser.id, newTransaction);
      await loadUserData(currentUser.id);

      // Formu temizle ve kapat
      setTxTitle('');
      setTxAmount('');
      setTxType('expense');
      setTxCategory('gida');
      setIsModalOpen(false);
    } catch (e) {
      Alert.alert('Hata', 'İşlem eklenirken hata oluştu.');
    }
  };

  // İşlem Sil
  const handleDeleteTransaction = (id) => {
    Alert.alert(
      'İşlemi Sil',
      'Bu işlemi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(currentUser.id, id);
              await loadUserData(currentUser.id);
            } catch (e) {
              Alert.alert('Hata', 'İşlem silinirken hata oluştu.');
            }
          }
        }
      ]
    );
  };

  // Tema Değiştir
  const handleThemeChange = async (newTheme) => {
    try {
      await updateUserTheme(currentUser.id, newTheme);
      setThemeKey(newTheme);
    } catch (e) {
      Alert.alert('Hata', 'Tema güncellenemedi.');
    }
  };

  // Akıllı Finansal Analiz ve Hatırlatıcı Üretici
  const getFinancialAnalysis = () => {
    const analysisList = [];

    // 1. Tasarruf Oranı Analizi (Net Bakiye / Gelir)
    if (totalIncome > 0) {
      const savingsRate = (netBalance / totalIncome) * 100;
      if (savingsRate > 20) {
        analysisList.push({
          id: 'savings_good',
          type: 'success',
          title: 'Tebrikler! Tasarruf Oranınız Yüksek',
          message: `Bu ay gelirinizin %${savingsRate.toFixed(0)}'ini biriktirmeyi başardınız. Finansal hedeflerinize emin adımlarla ilerliyorsunuz!`,
        });
      } else if (savingsRate < 0) {
        analysisList.push({
          id: 'savings_warning',
          type: 'warning',
          title: 'Bütçe Aşımı Uyarısı',
          message: `Harcamalarınız bu ayki gelirlerinizi aştı. Tasarruf oranınız negatiftir (%${savingsRate.toFixed(0)}). Borçlanmayı önlemek için harcamalarınızı gözden geçirebilirsiniz.`,
        });
      } else {
        analysisList.push({
          id: 'savings_info',
          type: 'info',
          title: 'Orta Seviye Tasarruf',
          message: `Bu ay gelirinizin %${savingsRate.toFixed(0)}'ini biriktirdiniz. Bu oranı %20 seviyesine çıkarmak finansal sağlığınızı güçlendirecektir.`,
        });
      }
    }

    // 2. Kategori Bazlı Aşırı Harcama Analizi
    if (totalExpense > 0) {
      const categoryTotals = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      let maxCategory = null;
      let maxAmount = 0;
      Object.keys(categoryTotals).forEach(cat => {
        if (categoryTotals[cat] > maxAmount) {
          maxAmount = categoryTotals[cat];
          maxCategory = cat;
        }
      });

      if (maxCategory && maxAmount > 0) {
        const percentage = (maxAmount / totalExpense) * 100;
        const catLabels = {
          gida: 'Gıda',
          alisveris: 'Alışveriş',
          ulasim: 'Ulaşım',
          eglence: 'Eğlence',
          diger: 'Diğer'
        };
        const catLabel = catLabels[maxCategory] || maxCategory;

        if (percentage > 40) {
          analysisList.push({
            id: 'category_alert',
            type: 'warning',
            title: `Yoğun Harcama: ${catLabel}`,
            message: `Bu ayki toplam giderlerinizin %${percentage.toFixed(0)} kadarı (${maxAmount.toLocaleString()} ${currency}) sadece "${catLabel}" kategorisinde yapıldı.`,
          });
        }
      }
    }

    // 3. Portföy Yatırım Analizi
    if (funds.length > 0) {
      const totalCost = funds.reduce((sum, f) => sum + (f.shares * f.purchase_price), 0);
      const currentValue = funds.reduce((sum, f) => sum + (f.shares * f.current_price), 0);
      const totalProfitLoss = currentValue - totalCost;
      const profitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

      if (totalProfitLoss > 0) {
        analysisList.push({
          id: 'portfolio_gain',
          type: 'success',
          title: 'Yatırım Portföyünüz Yükselişte',
          message: `Yatırımlarınız şu anda kârda! Toplam portföy getiriniz: +%${profitLossPercentage.toFixed(1)} (+${totalProfitLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}).`,
        });
      } else if (totalProfitLoss < -5) {
        analysisList.push({
          id: 'portfolio_loss',
          type: 'info',
          title: 'Yatırım Portföyü Analizi',
          message: `Portföyünüz şu an maliyetin gerisinde (-%${Math.abs(profitLossPercentage).toFixed(1)}). Uzun vadeli hedeflerinizi koruyarak piyasa düzeltmelerini değerlendirebilirsiniz.`,
        });
      }
    } else {
      analysisList.push({
        id: 'portfolio_prompt',
        type: 'info',
        title: '💡 Yatırıma Başlayın',
        message: 'Enflasyona karşı birikimlerinizi korumak için "Yatırımlar" sekmesinden hisse senedi veya fon takibi başlatabilirsiniz.',
      });
    }

    // 4. Genel Bildirim Hatırlatıcılar
    analysisList.push({
      id: 'reminder_weekly',
      type: 'info',
      title: '📅 Finansal İpucu',
      message: 'Haftalık harcama bütçesi belirlemek, ay sonundaki nakit akışınızı daha öngörülebilir hale getirir.',
    });

    return analysisList;
  };

  // Para Birimi Değiştir
  const handleCurrencyChange = async (newCur) => {
    try {
      await updateUserSettings(currentUser.id, newCur);
      setCurrency(newCur);
    } catch (e) {
      Alert.alert('Hata', 'Para birimi güncellenemedi.');
    }
  };

  // Tüm Verileri Sıfırla
  const handleResetData = () => {
    Alert.alert(
      'Profili Sıfırla',
      'Tüm harcama, gelir ve borsa yatırımlarınız kalıcı olarak silinecektir. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllUserData(currentUser.id);
              setTransactions([]);
              Alert.alert('Başarılı', 'Profil verileriniz sıfırlandı.');
            } catch (e) {
              Alert.alert('Hata', 'Profil sıfırlanırken hata oluştu.');
            }
          }
        }
      ]
    );
  };

  // Hesaplamalar
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const activeTheme = THEMES[themeKey] || THEMES.midnight;

  // Giriş yapılmamışsa LoginScreen göster
  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }} 
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <StatusBar barStyle="light-content" />
      <LiquidBackground theme={activeTheme} />

      <SafeAreaView style={styles.safeArea}>
        {/* Ekran Başlığı */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Kişisel Finans • @{currentUser.username}</Text>
            <Text style={styles.headerTitle}>Bütçem</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>

        {/* Ana İçerik Kaydırma Alanı */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'dashboard' && (
            <>
              {/* Toplam Bakiye Cam Kartı */}
              <GlassCard style={styles.balanceCard} intensity={50}>
                <Text style={styles.balanceLabel}>Toplam Bakiye</Text>
                <Text style={[styles.balanceValue, { color: netBalance >= 0 ? '#ffffff' : '#ff5555' }]}>
                  {netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                </Text>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                  {/* Gelir */}
                  <View style={styles.statCol}>
                    <View style={styles.statIconWrapperGreen}>
                      <ArrowDownLeft size={16} color="#00e676" />
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Gelir</Text>
                      <Text style={styles.statValueGreen}>+{totalIncome.toLocaleString()} {currency}</Text>
                    </View>
                  </View>

                  {/* Dikey Çizgi */}
                  <View style={styles.verticalDivider} />

                  {/* Gider */}
                  <View style={styles.statCol}>
                    <View style={styles.statIconWrapperRed}>
                      <ArrowUpRight size={16} color="#ff2a8d" />
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Gider</Text>
                      <Text style={styles.statValueRed}>-{totalExpense.toLocaleString()} {currency}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>

              {/* Akıllı Analizler & Hatırlatıcılar */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Akıllı Analizler & Öneriler</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 40}
                decelerationRate="fast"
                contentContainerStyle={styles.insightsScroll}
                style={{ marginBottom: 14 }}
              >
                {getFinancialAnalysis().map((item) => (
                  <GlassCard 
                    key={item.id} 
                    style={[
                      styles.insightCard, 
                      item.type === 'warning' && { borderColor: 'rgba(255, 123, 0, 0.3)' },
                      item.type === 'success' && { borderColor: 'rgba(0, 230, 118, 0.3)' },
                      item.type === 'info' && { borderColor: activeTheme.primary + '45' },
                    ]} 
                    intensity={30}
                  >
                    <View style={styles.insightContent}>
                      <View style={styles.insightHeaderRow}>
                        <View style={[
                          styles.insightIconWrapper,
                          item.type === 'warning' && { backgroundColor: 'rgba(255, 123, 0, 0.15)' },
                          item.type === 'success' && { backgroundColor: 'rgba(0, 230, 118, 0.15)' },
                          item.type === 'info' && { backgroundColor: activeTheme.primary + '25' },
                        ]}>
                          {item.type === 'warning' ? (
                            <AlertCircle size={18} color="#ff7b00" />
                          ) : item.type === 'success' ? (
                            <Sparkles size={18} color="#00e676" />
                          ) : (
                            <Info size={18} color={activeTheme.primary} />
                          )}
                        </View>
                        <Text style={styles.insightTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.insightMessage}>{item.message}</Text>
                    </View>
                  </GlassCard>
                ))}
              </ScrollView>

              {/* Son İşlemler Başlığı */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Son İşlemler</Text>
              </View>

              {/* İşlemler Listesi */}
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <GlassCard key={tx.id} style={styles.txItemCard} intensity={30}>
                    <View style={styles.txItemContainer}>
                      <View style={styles.txItemLeft}>
                        <View 
                          style={[
                            styles.txTypeIconWrapper, 
                            { backgroundColor: tx.type === 'income' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 42, 141, 0.15)' }
                          ]}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft size={18} color="#00e676" />
                          ) : (
                            <ArrowUpRight size={18} color="#ff2a8d" />
                          )}
                        </View>
                        <View>
                          <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                          <Text style={styles.txDate}>{tx.date}</Text>
                        </View>
                      </View>
                      <View style={styles.txItemRight}>
                        <Text style={tx.type === 'income' ? styles.txAmountIncome : styles.txAmountExpense}>
                          {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} {currency}
                        </Text>
                        <Pressable 
                          onPress={() => handleDeleteTransaction(tx.id)}
                          style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && { opacity: 0.6 }
                          ]}
                        >
                          <Trash2 size={16} color="rgba(255,255,255,0.4)" />
                        </Pressable>
                      </View>
                    </View>
                  </GlassCard>
                ))
              ) : (
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Henüz işlem kaydedilmedi. Başlamak için + butonuna basın.</Text>
                </GlassCard>
              )}
            </>
          )}

          {activeTab === 'analytics' && (
            <View style={{ width: '100%' }}>
              {/* Segmented Control */}
              <View style={styles.segmentedControl}>
                <Pressable
                  onPress={() => setAnalyticsSubTab('chart')}
                  style={[
                    styles.segmentBtn,
                    analyticsSubTab === 'chart' && { backgroundColor: activeTheme.primary }
                  ]}
                >
                  <Text style={[
                    styles.segmentBtnText,
                    analyticsSubTab === 'chart' && { color: activeTheme.background, fontWeight: '700' }
                  ]}>
                    Harcama Grafiği
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => setAnalyticsSubTab('calendar')}
                  style={[
                    styles.segmentBtn,
                    analyticsSubTab === 'calendar' && { backgroundColor: activeTheme.primary }
                  ]}
                >
                  <Text style={[
                    styles.segmentBtnText,
                    analyticsSubTab === 'calendar' && { color: activeTheme.background, fontWeight: '700' }
                  ]}>
                    Finansal Takvim
                  </Text>
                </Pressable>
              </View>

              {analyticsSubTab === 'chart' ? (
                <GlassCard style={styles.analyticsCard} intensity={45}>
                  <Text style={styles.cardHeaderTitle}>Harcama Analizi</Text>
                  <ExpenseChart 
                    transactions={transactions} 
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                    currency={currency} 
                  />
                </GlassCard>
              ) : (
                <FinancialCalendar 
                  transactions={transactions}
                  currency={currency}
                  activeTheme={activeTheme}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              )}
            </View>
          )}

          {activeTab === 'investments' && (
            <FundsScreen 
              userId={currentUser.id} 
              currency={currency} 
              onTransactionAdded={() => loadUserData(currentUser.id)}
            />
          )}

          {activeTab === 'settings' && (
            <>
              {/* Para Birimi Ayarı */}
              <GlassCard style={styles.settingsCard} intensity={45}>
                <Text style={styles.settingSectionTitle}>Para Birimi Seçimi</Text>
                <View style={styles.currencyOptionsRow}>
                  {['₺', '$', '€', '£'].map((cur) => (
                    <Pressable
                      key={cur}
                      onPress={() => handleCurrencyChange(cur)}
                      style={({ pressed }) => [
                        styles.currencyOption,
                        currency === cur && { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary },
                        pressed && { transform: [{ scale: 0.95 }] }
                      ]}
                    >
                      <Text style={[
                        styles.currencyOptionText,
                        currency === cur && { color: activeTheme.background, fontWeight: '800' }
                      ]}>
                        {cur}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </GlassCard>

              {/* Tema Seçimi */}
              <GlassCard style={styles.settingsCard} intensity={45}>
                <Text style={styles.settingSectionTitle}>Sistem Teması</Text>
                <View style={styles.themeOptionsRow}>
                  {Object.keys(THEMES).map((key) => {
                    const t = THEMES[key];
                    const isActive = themeKey === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => handleThemeChange(key)}
                        style={({ pressed }) => [
                          styles.themeOption,
                          isActive && { borderColor: t.primary },
                          pressed && { transform: [{ scale: 0.95 }] }
                        ]}
                      >
                        <View style={[styles.themeOptionColorBadge, { backgroundColor: t.primary }]} />
                        <Text style={[
                          styles.themeOptionText,
                          isActive && { color: t.primary, fontWeight: '800' }
                        ]}>
                          {t.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>

              {/* Oturum Kapatma ve Sıfırlama */}
              <GlassCard style={styles.settingsCard} intensity={45}>
                <Text style={styles.settingSectionTitle}>Profil ve Sistem Yönetimi</Text>
                <View style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => setCurrentUser(null)}
                    style={({ pressed }) => [
                      styles.logoutButton,
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <LogOut size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutButtonText}>Oturumu Kapat</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleResetData}
                    style={({ pressed }) => [
                      styles.resetButton,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                    ]}
                  >
                    <Trash2 size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.resetButtonText}>Profili Sıfırla</Text>
                  </Pressable>
                </View>
              </GlassCard>
            </>
          )}
        </ScrollView>

        {/* Ekleme FAB Butonu */}
        {activeTab === 'dashboard' && (
          <Pressable
            onPress={() => setIsModalOpen(true)}
            style={({ pressed }) => [
              styles.fabButton,
              { backgroundColor: activeTheme.primary, shadowColor: activeTheme.primary },
              pressed && { transform: [{ scale: 0.9 }] }
            ]}
          >
            <Plus size={28} color={activeTheme.background || '#090514'} />
          </Pressable>
        )}

        {/* Alt Navigasyon Barı */}
        <View style={styles.bottomNavContainer}>
          <BlurView intensity={70} tint="dark" style={styles.bottomNavBlur}>
            <View style={styles.navRow}>
              {/* Dashboard */}
              <Pressable
                onPress={() => setActiveTab('dashboard')}
                style={styles.navItem}
              >
                <Home size={22} color={activeTab === 'dashboard' ? activeTheme.primary : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.navText, activeTab === 'dashboard' && { color: activeTheme.primary, fontWeight: '600' }]}>Ana Sayfa</Text>
              </Pressable>

              {/* Analiz */}
              <Pressable
                onPress={() => setActiveTab('analytics')}
                style={styles.navItem}
              >
                <BarChart2 size={22} color={activeTab === 'analytics' ? activeTheme.primary : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.navText, activeTab === 'analytics' && { color: activeTheme.primary, fontWeight: '600' }]}>Analiz</Text>
              </Pressable>

              {/* Yatırımlar */}
              <Pressable
                onPress={() => setActiveTab('investments')}
                style={styles.navItem}
              >
                <Briefcase size={22} color={activeTab === 'investments' ? activeTheme.primary : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.navText, activeTab === 'investments' && { color: activeTheme.primary, fontWeight: '600' }]}>Yatırımlar</Text>
              </Pressable>

              {/* Ayarlar */}
              <Pressable
                onPress={() => setActiveTab('settings')}
                style={styles.navItem}
              >
                <Settings size={22} color={activeTab === 'settings' ? activeTheme.primary : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.navText, activeTab === 'settings' && { color: activeTheme.primary, fontWeight: '600' }]}>Ayarlar</Text>
              </Pressable>
            </View>
          </BlurView>
        </View>

        {/* Yeni İşlem Ekleme Modalı */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <GlassCard intensity={80} style={styles.modalGlassCard}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Yeni İşlem Ekle</Text>
                  <Pressable 
                    onPress={() => setIsModalOpen(false)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color="#ffffff" />
                  </Pressable>
                </View>

                {/* Gelir / Gider Segmented Toggle */}
                <View style={styles.typeToggleContainer}>
                  <Pressable
                    onPress={() => setTxType('expense')}
                    style={[
                      styles.toggleBtn,
                      txType === 'expense' && styles.toggleBtnExpenseActive
                    ]}
                  >
                    <MinusCircle size={16} color={txType === 'expense' ? '#ffffff' : 'rgba(255,255,255,0.5)'} />
                    <Text style={[styles.toggleBtnText, txType === 'expense' && styles.toggleBtnTextActive]}>Gider</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setTxType('income')}
                    style={[
                      styles.toggleBtn,
                      txType === 'income' && styles.toggleBtnIncomeActive
                    ]}
                  >
                    <PlusCircle size={16} color={txType === 'income' ? '#ffffff' : 'rgba(255,255,255,0.5)'} />
                    <Text style={[styles.toggleBtnText, txType === 'income' && styles.toggleBtnTextActive]}>Gelir</Text>
                  </Pressable>
                </View>

                {/* Form Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Açıklama</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Haftalık Market"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={txTitle}
                    onChangeText={setTxTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tutar ({currency})</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={txAmount}
                    onChangeText={setTxAmount}
                  />
                </View>

                {/* Gider ise Kategori Seçimi */}
                {txType === 'expense' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Kategori</Text>
                    <View style={styles.categoryGrid}>
                      {[
                        { key: 'gida', label: 'Gıda', color: '#ff7b00' },
                        { key: 'alisveris', label: 'Alışveriş', color: '#00f2fe' },
                        { key: 'ulasim', label: 'Ulaşım', color: '#7f00ff' },
                        { key: 'eglence', label: 'Eğlence', color: '#ff2a8d' },
                        { key: 'diger', label: 'Diğer', color: '#a0a0a0' },
                      ].map((cat) => (
                        <Pressable
                          key={cat.key}
                          onPress={() => setTxCategory(cat.key)}
                          style={[
                            styles.categoryBadge,
                            { borderColor: cat.color + '40' },
                            txCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color }
                          ]}
                        >
                          <Text style={[
                            styles.categoryBadgeText,
                            txCategory === cat.key && { color: '#ffffff', fontWeight: 'bold' }
                          ]}>
                            {cat.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Kaydet Butonu */}
                <Pressable
                  onPress={handleAddTransaction}
                  style={({ pressed }) => [
                    styles.saveButton,
                    { backgroundColor: activeTheme.primary, shadowColor: activeTheme.primary },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }
                  ]}
                >
                  <Text style={[styles.saveButtonText, { color: activeTheme.background || '#090514' }]}>İşlemi Kaydet</Text>
                </Pressable>
              </GlassCard>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090514',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 10,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 2,
  },
  dateBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Alt navigasyon barı için boşluk
    paddingTop: 10,
  },
  balanceCard: {
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verticalDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 15,
  },
  statIconWrapperGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconWrapperRed: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 42, 141, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  statValueGreen: {
    color: '#00e676',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  statValueRed: {
    color: '#ff2a8d',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  txItemCard: {
    marginBottom: 10,
  },
  txItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  txTypeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  txDate: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 3,
  },
  txItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txAmountIncome: {
    color: '#00e676',
    fontSize: 15,
    fontWeight: '700',
  },
  txAmountExpense: {
    color: '#ff2a8d',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  analyticsCard: {
    padding: 20,
  },
  cardHeaderTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  settingsCard: {
    marginBottom: 16,
    padding: 20,
  },
  settingSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  currencyOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyOption: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyOptionActive: {
    backgroundColor: '#00f2fe',
    borderColor: '#00f2fe',
  },
  currencyOptionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    fontWeight: '600',
  },
  currencyOptionTextActive: {
    color: '#090514',
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ff2a8d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 10, 30, 0.85)', // Yarı saydam koyu taban ile okunabilirliği artırır
    elevation: 10,
  },
  bottomNavBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  navTextActive: {
    color: '#00f2fe',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalGlassCard: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  typeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  toggleBtnExpenseActive: {
    backgroundColor: '#ff2a8d',
  },
  toggleBtnIncomeActive: {
    backgroundColor: '#00e676',
  },
  toggleBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  categoryBadgeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#00f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#090514',
    fontSize: 16,
    fontWeight: '700',
  },
  insightsScroll: {
    paddingRight: 20,
    gap: 12,
  },
  insightCard: {
    width: width - 40,
    borderWidth: 1,
    padding: 16,
  },
  insightContent: {
    paddingVertical: 4,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  insightMessage: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    lineHeight: 18,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    gap: 8,
  },
  themeOptionColorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeOptionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
});
