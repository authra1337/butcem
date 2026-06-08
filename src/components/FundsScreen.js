import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  DollarSign, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  X, 
  Briefcase,
  ArrowUpRight,
  Percent,
  RefreshCw,
  Search
} from 'lucide-react-native';
import { getFunds, addFund, updateFundCurrentPrice, deleteFund, addTransaction } from '../database/db';
import GlassCard from './GlassCard';

const { width } = Dimensions.get('window');

const POPULAR_ASSETS = [
  // BIST Hisse Senetleri
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları A.Ş.', category: 'BIST Hisse' },
  { symbol: 'TUPRS.IS', name: 'Tüpraş Türkiye Petrol Rafinerileri A.Ş.', category: 'BIST Hisse' },
  { symbol: 'EREGL.IS', name: 'Ereğli Demir ve Çelik Fabrikaları T.A.Ş.', category: 'BIST Hisse' },
  { symbol: 'ASELS.IS', name: 'Aselsan Elektronik Sanayi ve Ticaret A.Ş.', category: 'BIST Hisse' },
  { symbol: 'YKBNK.IS', name: 'Yapı ve Kredi Bankası A.Ş.', category: 'BIST Hisse' },
  { symbol: 'AKBNK.IS', name: 'Akbank T.A.Ş.', category: 'BIST Hisse' },
  { symbol: 'GARAN.IS', name: 'Türkiye Garanti Bankası A.Ş.', category: 'BIST Hisse' },
  { symbol: 'SAHOL.IS', name: 'Hacı Ömer Sabancı Holding A.Ş.', category: 'BIST Hisse' },
  { symbol: 'KCHOL.IS', name: 'Koç Holding A.Ş.', category: 'BIST Hisse' },
  { symbol: 'BIMAS.IS', name: 'BİM Birleşik Mağazalar A.Ş.', category: 'BIST Hisse' },
  { symbol: 'SASA.IS', name: 'Sasa Polyester Sanayi A.Ş.', category: 'BIST Hisse' },
  { symbol: 'SISE.IS', name: 'Türkiye Şişe ve Cam Fabrikaları A.Ş.', category: 'BIST Hisse' },
  { symbol: 'PGSUS.IS', name: 'Pegasus Hava Taşımacılığı A.Ş.', category: 'BIST Hisse' },
  { symbol: 'FROTO.IS', name: 'Ford Otomotiv Sanayi A.Ş.', category: 'BIST Hisse' },
  { symbol: 'TOASO.IS', name: 'Tofaş Türk Otomobil Fabrikası A.Ş.', category: 'BIST Hisse' },
  { symbol: 'KOZAL.IS', name: 'Koza Altın İşletmeleri A.Ş.', category: 'BIST Hisse' },
  { symbol: 'KARDMD.IS', name: 'Kardemir Karabük Demir Çelik Sanayi ve Ticaret A.Ş. (D)', category: 'BIST Hisse' },
  { symbol: 'TCELL.IS', name: 'Turkcell İletişim Hizmetleri A.Ş.', category: 'BIST Hisse' },
  { symbol: 'TTKOM.IS', name: 'Türk Telekomünikasyon A.Ş.', category: 'BIST Hisse' },
  { symbol: 'ARCLK.IS', name: 'Arçelik A.Ş.', category: 'BIST Hisse' },
  { symbol: 'MAVI.IS', name: 'Mavi Giyim Sanayi ve Ticaret A.Ş.', category: 'BIST Hisse' },
  { symbol: 'ASTOR.IS', name: 'Astor Enerji A.Ş.', category: 'BIST Hisse' },
  { symbol: 'ALARK.IS', name: 'Alarko Holding A.Ş.', category: 'BIST Hisse' },

  // ABD Hisse Senetleri
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'ABD Hisse' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'ABD Hisse' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', category: 'ABD Hisse' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'ABD Hisse' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', category: 'ABD Hisse' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', category: 'ABD Hisse' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', category: 'ABD Hisse' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', category: 'ABD Hisse' },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', category: 'ABD Hisse' },

  // Kripto Paralar
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'Kripto' },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'Kripto' },
  { symbol: 'SOL-USD', name: 'Solana', category: 'Kripto' },
  { symbol: 'XRP-USD', name: 'Ripple', category: 'Kripto' },
  { symbol: 'BNB-USD', name: 'BNB', category: 'Kripto' },

  // Emtialar & Döviz
  { symbol: 'GC=F', name: 'Altın Ons (Gold Futures)', category: 'Emtia & Döviz' },
  { symbol: 'GLDGR.IS', name: 'Gram Altın (İstanbul Altın Rafinerisi)', category: 'Emtia & Döviz' },
  { symbol: 'USDTRY=X', name: 'Dolar / TL (USD/TRY)', category: 'Emtia & Döviz' },
  { symbol: 'EURTRY=X', name: 'Euro / TL (EUR/TRY)', category: 'Emtia & Döviz' },
  { symbol: 'SLV', name: 'Gümüş ETF (iShares Silver Trust)', category: 'Emtia & Döviz' },
];

const getCleanSymbolDisplay = (symbol) => {
  return symbol.endsWith('.IS') ? symbol.slice(0, -3) : symbol;
};


// Yahoo Finance API üzerinden canlı fiyat çekme fonksiyonu
const fetchLivePrice = async (symbol) => {
  const cleanSymbol = symbol.trim().toUpperCase();
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}`,
    // Ticker sonu .IS değilse, BIST hisseleri için .IS uzantısı ile fallback yap
    ...(!cleanSymbol.includes('.') ? [`https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}.IS`] : [])
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && meta.regularMarketPrice) {
        return meta.regularMarketPrice;
      }
    } catch (e) {
      console.log(`Fiyat çekme hatası (${url}):`, e);
    }
  }
  return null;
};

export default function FundsScreen({ userId, currency, onTransactionAdded }) {
  const [funds, setFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  
  // Modaller
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  
  // Seçilen Fon (Düzenleme veya Gelir için)
  const [selectedFund, setSelectedFund] = useState(null);

  // Form State'leri
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingLivePrice, setIsFetchingLivePrice] = useState(false);
  const [fundShares, setFundShares] = useState('');
  const [fundPurchasePrice, setFundPurchasePrice] = useState('');
  const [fundCurrentPrice, setFundCurrentPrice] = useState('');
  
  const [newPrice, setNewPrice] = useState('');
  
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeTitle, setIncomeTitle] = useState('');

  useEffect(() => {
    fetchFunds();
  }, [userId]);

  const fetchFunds = async () => {
    setIsLoading(true);
    try {
      const list = await getFunds(userId);
      setFunds(list);
    } catch (e) {
      console.log('Fonlar getirilirken hata oluştu:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Canlı fiyatları güncelle
  const handleRefreshPrices = async () => {
    if (funds.length === 0) return;
    setIsRefreshingPrices(true);
    let successCount = 0;
    let failSymbols = [];

    for (const fund of funds) {
      const price = await fetchLivePrice(fund.symbol);
      if (price !== null) {
        try {
          await updateFundCurrentPrice(userId, fund.id, price);
          successCount++;
        } catch (dbErr) {
          console.log(`Database update error for ${fund.symbol}:`, dbErr);
          failSymbols.push(fund.symbol);
        }
      } else {
        failSymbols.push(fund.symbol);
      }
    }

    setIsRefreshingPrices(false);
    fetchFunds();

    if (failSymbols.length === 0) {
      Alert.alert('Başarılı', 'Tüm canlı fiyatlar başarıyla güncellendi.');
    } else {
      Alert.alert(
        'Güncelleme Tamamlandı',
        `${successCount} varlığın fiyatı güncellendi. Şu semboller için fiyat bulunamadı: ${failSymbols.join(', ')} (Sembolü kontrol edin veya manuel güncelleyin).`
      );
    }
  };

  // Varlık seçimi işlemi
  const handleSelectAsset = async (asset) => {
    setSelectedAsset(asset);
    setIsFetchingLivePrice(true);
    const livePrice = await fetchLivePrice(asset.symbol);
    setIsFetchingLivePrice(false);
    if (livePrice !== null) {
      setFundPurchasePrice(livePrice.toString());
      setFundCurrentPrice(livePrice.toString());
    } else {
      setFundPurchasePrice('');
      setFundCurrentPrice('');
    }
  };

  // Yeni Fon Ekle
  const handleAddFund = async () => {
    if (!selectedAsset) {
      Alert.alert('Hata', 'Lütfen listeden bir varlık seçin.');
      return;
    }

    if (!fundShares.trim() || !fundPurchasePrice.trim()) {
      Alert.alert('Hata', 'Lütfen adet ve alış fiyatı girin.');
      return;
    }

    const sharesNum = parseFloat(fundShares.replace(',', '.'));
    const purchasePriceNum = parseFloat(fundPurchasePrice.replace(',', '.'));
    const currentPriceNum = fundCurrentPrice ? parseFloat(fundCurrentPrice.replace(',', '.')) : purchasePriceNum;

    if (isNaN(sharesNum) || sharesNum <= 0 || isNaN(purchasePriceNum) || purchasePriceNum <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli adet ve fiyat bilgisi girin.');
      return;
    }

    try {
      await addFund(userId, {
        name: selectedAsset.name,
        symbol: selectedAsset.symbol,
        shares: sharesNum,
        purchasePrice: purchasePriceNum,
        currentPrice: currentPriceNum
      });
      
      Alert.alert('Başarılı', 'Yatırım varlığı başarıyla eklendi.');
      setIsAddModalOpen(false);
      resetAddForm();
      fetchFunds();
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (e) {
      Alert.alert('Hata', 'Varlık eklenirken bir hata oluştu.');
      console.log(e);
    }
  };


  // Güncel Fiyatı Düzenle
  const handleUpdatePrice = async () => {
    const priceNum = parseFloat(newPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir fiyat girin.');
      return;
    }

    try {
      await updateFundCurrentPrice(userId, selectedFund.id, priceNum);
      setIsPriceModalOpen(false);
      setNewPrice('');
      fetchFunds();
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (e) {
      Alert.alert('Hata', 'Fiyat güncellenirken hata oluştu.');
      console.log(e);
    }
  };

  // Temettü / Kar Payı Geliri Ekle
  const handleAddIncome = async () => {
    const amountNum = parseFloat(incomeAmount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }

    const title = incomeTitle.trim() || `${selectedFund.symbol} Yatırım Geliri`;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    try {
      // 1. İşlemi Veritabanına Ekle (type: income, category: yatirim)
      await addTransaction(userId, {
        id: Date.now().toString(),
        title: title,
        amount: amountNum,
        type: 'income',
        category: 'yatirim',
        date: formattedDate,
        fundId: selectedFund.id
      });

      Alert.alert('Başarılı', 'Yatırım geliri sisteme kaydedildi ve bakiyenize eklendi.');
      setIsIncomeModalOpen(false);
      setIncomeAmount('');
      setIncomeTitle('');
      
      // Ana uygulamadaki işlem geçmişini tetikle
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (e) {
      Alert.alert('Hata', 'Gelir eklenirken hata oluştu.');
      console.log(e);
    }
  };

  // Fon Sil
  const handleDeleteFund = (id, symbol) => {
    Alert.alert(
      'Yatırımı Sil',
      `"${symbol}" yatırımınızı portföyünüzden kaldırmak istediğinize emin misiniz? (Bu fona bağlı geçmiş gelirler silinmeyecektir)`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFund(userId, id);
              fetchFunds();
              if (onTransactionAdded) {
                onTransactionAdded();
              }
            } catch (e) {
              Alert.alert('Hata', 'Yatırım silinirken hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const resetAddForm = () => {
    setSelectedAsset(null);
    setSearchQuery('');
    setFundShares('');
    setFundPurchasePrice('');
    setFundCurrentPrice('');
  };

  // Portföy Hesaplamaları
  const totalCost = funds.reduce((sum, f) => sum + (f.shares * f.purchase_price), 0);
  const currentValue = funds.reduce((sum, f) => sum + (f.shares * f.current_price), 0);
  const totalProfitLoss = currentValue - totalCost;
  const profitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Portföy Değer Özeti Kartı */}
        <GlassCard style={styles.summaryCard} intensity={55}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryLabel}>Toplam Portföy Değeri</Text>
              <Text style={styles.summaryValue}>
                {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </Text>
            </View>
            <View style={styles.summaryIconWrapper}>
              <Briefcase size={22} color="#00f2fe" />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryStatsRow}>
            {/* Maliyet */}
            <View style={styles.summaryStatCol}>
              <Text style={styles.summaryStatLabel}>Toplam Maliyet</Text>
              <Text style={styles.summaryStatValue}>{totalCost.toLocaleString()} {currency}</Text>
            </View>
            
            <View style={styles.verticalDivider} />

            {/* Kar / Zarar */}
            <View style={styles.summaryStatCol}>
              <Text style={styles.summaryStatLabel}>Net Kâr / Zarar</Text>
              <View style={styles.profitLossRow}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp size={16} color="#00e676" style={{ marginRight: 4 }} />
                ) : (
                  <TrendingDown size={16} color="#ff2a8d" style={{ marginRight: 4 }} />
                )}
                <Text style={totalProfitLoss >= 0 ? styles.profitText : styles.lossText}>
                  {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency} ({profitLossPercentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Başlık ve Ekle Butonu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Varlıklarım</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {funds.length > 0 && (
              <Pressable
                onPress={handleRefreshPrices}
                disabled={isRefreshingPrices}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && { transform: [{ scale: 0.95 }] }
                ]}
              >
                {isRefreshingPrices ? (
                  <ActivityIndicator size="small" color="#00f2fe" style={{ paddingHorizontal: 20 }} />
                ) : (
                  <>
                    <RefreshCw size={14} color="#00f2fe" style={{ marginRight: 4 }} />
                    <Text style={styles.refreshButtonText}>Canlı Fiyat Çek</Text>
                  </>
                )}
              </Pressable>
            )}
            <Pressable
              onPress={() => setIsAddModalOpen(true)}
              style={({ pressed }) => [
                styles.addButton,
                pressed && { transform: [{ scale: 0.95 }] }
              ]}
            >
              <Plus size={16} color="#090514" style={{ marginRight: 4 }} />
              <Text style={styles.addButtonText}>Ekle</Text>
            </Pressable>
          </View>
        </View>

        {/* Fon Listesi */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#00f2fe" style={{ marginTop: 40 }} />
        ) : funds.length > 0 ? (
          funds.map((fund) => {
            const cost = fund.shares * fund.purchase_price;
            const val = fund.shares * fund.current_price;
            const pnl = val - cost;
            const pnlPerc = cost > 0 ? (pnl / cost) * 100 : 0;

            return (
              <GlassCard key={fund.id} style={styles.fundCard} intensity={35}>
                <View style={styles.fundHeader}>
                  <View style={styles.fundTitleWrapper}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getCleanSymbolDisplay(fund.symbol)[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.fundSymbol}>{getCleanSymbolDisplay(fund.symbol)}</Text>
                      <Text style={styles.fundName} numberOfLines={1}>{fund.name}</Text>
                    </View>
                  </View>
                  <View style={styles.fundActions}>
                    {/* Gelir Ekle Butonu */}
                    <Pressable
                      onPress={() => {
                        setSelectedFund(fund);
                        setIsIncomeModalOpen(true);
                      }}
                      style={styles.actionIconBtn}
                      title="Gelir Ekle"
                    >
                      <ArrowUpRight size={16} color="#00e676" />
                    </Pressable>
                    {/* Düzenle Butonu */}
                    <Pressable
                      onPress={() => {
                        setSelectedFund(fund);
                        setNewPrice(fund.current_price.toString());
                        setIsPriceModalOpen(true);
                      }}
                      style={styles.actionIconBtn}
                      title="Fiyat Güncelle"
                    >
                      <Edit2 size={16} color="#00f2fe" />
                    </Pressable>
                    {/* Sil Butonu */}
                    <Pressable
                      onPress={() => handleDeleteFund(fund.id, fund.symbol)}
                      style={styles.actionIconBtn}
                    >
                      <Trash2 size={16} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.fundDivider} />

                {/* Detay Bilgileri */}
                <View style={styles.fundDetailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Miktar</Text>
                    <Text style={styles.detailValue}>{fund.shares.toLocaleString()} Adet</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Ort. Alış</Text>
                    <Text style={styles.detailValue}>{fund.purchase_price.toLocaleString()} {currency}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Güncel Fiyat</Text>
                    <Text style={styles.detailValue}>{fund.current_price.toLocaleString()} {currency}</Text>
                  </View>
                </View>

                <View style={styles.fundDetailsRow2}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Toplam Değer</Text>
                    <Text style={styles.detailValueBig}>
                      {val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {currency}
                    </Text>
                  </View>
                  <View style={styles.detailItemRight}>
                    <Text style={styles.detailLabelRight}>Net Getiri</Text>
                    <View style={styles.pnlBadgeRow}>
                      <Text style={pnl >= 0 ? styles.profitBadge : styles.lossBadge}>
                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency} ({pnlPerc.toFixed(1)}%)
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard style={styles.emptyCard} intensity={25}>
            <Text style={styles.emptyText}>
              Henüz portföyünüzde yatırım fonu bulunmuyor. Yeni bir hisse senedi veya yatırım fonu eklemek için sağ üstteki "Ekle" butonuna basın.
            </Text>
          </GlassCard>
        )}
      </ScrollView>

      {/* MODAL 1: Yeni Varlık Ekle */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <GlassCard intensity={80} style={styles.modalGlassCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Yatırım Varlığı Ekle</Text>
                <Pressable onPress={() => setIsAddModalOpen(false)} style={styles.closeBtn}>
                  <X size={20} color="#ffffff" />
                </Pressable>
              </View>

              {/* Form Alanları */}
              {!selectedAsset ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Varlık Seçin</Text>
                    <View style={styles.searchContainer}>
                      <Search size={18} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Hisse senedi, kripto veya döviz ara..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>
                  </View>

                  <ScrollView style={styles.assetListContainer} keyboardShouldPersistTaps="handled">
                    {POPULAR_ASSETS.filter(asset => 
                      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((asset) => (
                      <Pressable
                        key={asset.symbol}
                        onPress={() => handleSelectAsset(asset)}
                        style={({ pressed }) => [
                          styles.assetListItem,
                          pressed && { backgroundColor: 'rgba(255,255,255,0.08)' }
                        ]}
                      >
                        <View style={styles.assetListLeft}>
                          <View style={styles.assetAvatar}>
                            <Text style={styles.assetAvatarText}>
                              {asset.category === 'Kripto' ? '₿' : asset.category === 'Emtia & Döviz' ? '💱' : '📈'}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.assetSymbolText}>{getCleanSymbolDisplay(asset.symbol)}</Text>
                            <Text style={styles.assetNameText} numberOfLines={1}>{asset.name}</Text>
                          </View>
                        </View>
                        <View style={styles.assetCategoryBadge}>
                          <Text style={styles.assetCategoryText}>{asset.category}</Text>
                        </View>
                      </Pressable>
                    ))}
                    {searchQuery.trim().length > 0 && !POPULAR_ASSETS.some(a => a.symbol.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                      <Pressable
                        onPress={() => handleSelectAsset({
                          symbol: searchQuery.trim().toUpperCase(),
                          name: `${searchQuery.trim().toUpperCase()} (Özel Varlık)`,
                          category: 'Özel Varlık'
                        })}
                        style={({ pressed }) => [
                          styles.assetListItem,
                          pressed && { backgroundColor: 'rgba(255,255,255,0.08)' },
                          { borderStyle: 'dashed', borderColor: 'rgba(0, 242, 254, 0.3)', borderWidth: 1 }
                        ]}
                      >
                        <View style={styles.assetListLeft}>
                          <View style={[styles.assetAvatar, { backgroundColor: 'rgba(0, 242, 254, 0.1)' }]}>
                            <Text style={[styles.assetAvatarText, { color: '#00f2fe' }]}>+</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.assetSymbolText, { color: '#00f2fe' }]}>"{searchQuery.toUpperCase()}" Ekle</Text>
                            <Text style={styles.assetNameText}>Listede olmayan özel sembol olarak ekle</Text>
                          </View>
                        </View>
                      </Pressable>
                    )}
                  </ScrollView>
                </>
              ) : (
                <>
                  <View style={styles.selectedAssetCard}>
                    <View style={styles.selectedAssetLeft}>
                      <View style={styles.selectedAssetAvatar}>
                        <Text style={styles.selectedAssetAvatarText}>
                          {selectedAsset.category === 'Kripto' ? '₿' : selectedAsset.category === 'Emtia & Döviz' ? '💱' : '📈'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedAssetSymbol}>{getCleanSymbolDisplay(selectedAsset.symbol)}</Text>
                        <Text style={styles.selectedAssetName} numberOfLines={1}>{selectedAsset.name}</Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => setSelectedAsset(null)}
                      style={styles.changeAssetBtn}
                    >
                      <Text style={styles.changeAssetBtnText}>Değiştir</Text>
                    </Pressable>
                  </View>

                  {isFetchingLivePrice ? (
                    <View style={styles.livePriceLoading}>
                      <ActivityIndicator size="small" color="#00f2fe" />
                      <Text style={styles.livePriceLoadingText}>Güncel canlı fiyat çekiliyor...</Text>
                    </View>
                  ) : fundPurchasePrice ? (
                    <View style={styles.livePriceBadge}>
                      <Text style={styles.livePriceBadgeText}>✓ Canlı Fiyat Alındı: {fundPurchasePrice} {currency}</Text>
                    </View>
                  ) : null}

                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                      <Text style={styles.inputLabel}>Adet</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={fundShares}
                        onChangeText={setFundShares}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Alış Fiyatı</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={fundPurchasePrice}
                        onChangeText={setFundPurchasePrice}
                      />
                    </View>
                  </View>

                  <Pressable
                    onPress={handleAddFund}
                    style={({ pressed }) => [
                      styles.saveBtn,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                    ]}
                  >
                    <Text style={styles.saveBtnText}>Portföye Ekle</Text>
                  </Pressable>
                </>
              )}
            </GlassCard>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Fiyat Güncelle */}
      <Modal visible={isPriceModalOpen} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <GlassCard intensity={85} style={styles.modalGlassCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedFund ? `${selectedFund.symbol} Fiyatı Güncelle` : 'Fiyat Güncelle'}
                </Text>
                <Pressable onPress={() => setIsPriceModalOpen(false)} style={styles.closeBtn}>
                  <X size={20} color="#ffffff" />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Yeni Güncel Fiyat ({currency})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={newPrice}
                  onChangeText={setNewPrice}
                  autoFocus
                />
              </View>

              <Pressable
                onPress={handleUpdatePrice}
                style={({ pressed }) => [
                  styles.saveBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
              >
                <Text style={styles.saveBtnText}>Fiyatı Güncelle</Text>
              </Pressable>
            </GlassCard>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Temettü / Yatırım Geliri Kaydet */}
      <Modal visible={isIncomeModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <GlassCard intensity={85} style={styles.modalGlassCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedFund ? `${selectedFund.symbol} Gelir / Temettü Ekle` : 'Yatırım Geliri Ekle'}
                </Text>
                <Pressable onPress={() => setIsIncomeModalOpen(false)} style={styles.closeBtn}>
                  <X size={20} color="#ffffff" />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gelir Tutarı ({currency})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={incomeAmount}
                  onChangeText={setIncomeAmount}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Açıklama (Boş kalırsa varsayılan atanır)</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Örn: ${selectedFund ? selectedFund.symbol : ''} Temettü Dağıtımı`}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={incomeTitle}
                  onChangeText={setIncomeTitle}
                />
              </View>

              <Pressable
                onPress={handleAddIncome}
                style={({ pressed }) => [
                  styles.saveBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
              >
                <Text style={styles.saveBtnText}>Geliri Kaydet (Cüzdana Ekle)</Text>
              </Pressable>
            </GlassCard>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120, // Alt navigasyon payı
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatCol: {
    flex: 1,
  },
  summaryStatLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryStatValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 15,
  },
  profitLossRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitText: {
    color: '#00e676',
    fontWeight: '700',
    fontSize: 15,
  },
  lossText: {
    color: '#ff2a8d',
    fontWeight: '700',
    fontSize: 15,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#090514',
    fontSize: 12,
    fontWeight: '700',
  },
  fundCard: {
    marginBottom: 12,
  },
  fundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#00f2fe',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fundSymbol: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  fundName: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 2,
    width: width * 0.4,
  },
  fundActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
  fundDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fundDetailsRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  detailItem: {
    flex: 1,
  },
  detailItemRight: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailLabelRight: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'right',
  },
  detailValue: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  detailValueBig: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pnlBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitBadge: {
    color: '#00e676',
    fontWeight: '700',
    fontSize: 13,
  },
  lossBadge: {
    color: '#ff2a8d',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
  // Modaller
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
  },
  smallModalContent: {
    width: '100%',
    paddingHorizontal: 10,
  },
  modalGlassCard: {
    padding: 24,
    borderRadius: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#090514',
    fontSize: 15,
    fontWeight: '800',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#00f2fe',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    height: '100%',
  },
  assetListContainer: {
    maxHeight: 240,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 6,
  },
  assetListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  assetListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  assetAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetAvatarText: {
    fontSize: 14,
    color: '#ffffff',
  },
  assetSymbolText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  assetNameText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  assetCategoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assetCategoryText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedAssetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 242, 254, 0.06)',
    borderColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  selectedAssetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  selectedAssetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAssetAvatarText: {
    fontSize: 18,
    color: '#00f2fe',
  },
  selectedAssetSymbol: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedAssetName: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  changeAssetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeAssetBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  livePriceLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  livePriceLoadingText: {
    color: '#00f2fe',
    fontSize: 13,
  },
  livePriceBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  livePriceBadgeText: {
    color: '#00e676',
    fontSize: 12,
    fontWeight: '600',
  },
});
