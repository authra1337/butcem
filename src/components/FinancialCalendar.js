import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Trash2, Calendar, HelpCircle, Utensils, ShoppingBag, Car, Film } from 'lucide-react-native';
import GlassCard from './GlassCard';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS = {
  gida: '#ff7b00',
  alisveris: '#00f2fe',
  ulasim: '#7f00ff',
  eglence: '#ff2a8d',
  diger: '#a0a0a0',
};

const CATEGORY_ICONS = {
  gida: Utensils,
  alisveris: ShoppingBag,
  ulasim: Car,
  eglence: Film,
  diger: HelpCircle,
};

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function FinancialCalendar({ transactions, currency, activeTheme, onDeleteTransaction }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Bugünü varsayılan seçili gün yapalım (Format: DD.MM.YYYY)
  const today = new Date();
  const formatTodayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  const [selectedDateStr, setSelectedDateStr] = useState(formatTodayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y, m) => {
    let day = new Date(y, m, 1).getDay();
    // Monday as 0, Sunday as 6
    return day === 0 ? 6 : day - 1;
  };

  const totalDays = getDaysInMonth(year, month);
  const startDayIndex = getFirstDayOfMonth(year, month);

  // Önceki aya geç
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Sonraki aya geç
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Seçili tarihteki işlemleri filtrele
  const selectedTransactions = transactions.filter(t => t.date === selectedDateStr);
  
  // Seçili tarihteki toplam gelir ve gider
  const dayIncome = selectedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const dayExpense = selectedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const dayNet = dayIncome - dayExpense;

  // Takvim günlerini oluştur
  const renderDays = () => {
    const cells = [];
    
    // Boş hücreler (Önceki aydan kalan)
    for (let i = 0; i < startDayIndex; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCellEmpty} />);
    }

    // Ayın günleri
    for (let d = 1; d <= totalDays; d++) {
      const dateString = `${String(d).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
      const isSelected = selectedDateStr === dateString;
      const isToday = formatTodayStr === dateString;
      
      // Bu güne ait işlemleri bul
      const dayTransactions = transactions.filter(t => t.date === dateString);
      const hasIncome = dayTransactions.some(t => t.type === 'income');
      const hasExpense = dayTransactions.some(t => t.type === 'expense');

      cells.push(
        <Pressable
          key={`day-${d}`}
          onPress={() => setSelectedDateStr(dateString)}
          style={[
            styles.dayCell,
            isSelected && { borderColor: activeTheme.primary, borderWidth: 1, backgroundColor: activeTheme.primary + '12' },
            isToday && !isSelected && { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 }
          ]}
        >
          <Text style={[
            styles.dayText,
            isSelected && { color: activeTheme.primary, fontWeight: '700' },
            isToday && !isSelected && { color: '#ffffff', fontWeight: '700' }
          ]}>
            {d}
          </Text>
          
          {/* İşlem Gösterge Noktaları */}
          <View style={styles.dotsRow}>
            {hasIncome && <View style={[styles.dot, { backgroundColor: '#00e676' }]} />}
            {hasExpense && <View style={[styles.dot, { backgroundColor: '#ff2a8d' }]} />}
          </View>
        </Pressable>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      {/* Ay Seçici */}
      <View style={styles.calendarHeader}>
        <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
          <ChevronLeft size={20} color="#ffffff" />
        </Pressable>
        <Text style={styles.calendarTitle}>{MONTHS[month]} {year}</Text>
        <Pressable onPress={handleNextMonth} style={styles.navBtn}>
          <ChevronRight size={20} color="#ffffff" />
        </Pressable>
      </View>

      {/* Haftanın Günleri Başlığı */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      {/* Takvim Grid */}
      <View style={styles.gridContainer}>
        {renderDays()}
      </View>

      {/* Seçili Gün Detay Kartı */}
      <GlassCard style={styles.detailsCard} intensity={35}>
        <View style={styles.detailsHeader}>
          <View>
            <Text style={styles.detailsDateLabel}>{selectedDateStr}</Text>
            <Text style={styles.detailsTitle}>Günlük Özet</Text>
          </View>
          <View style={[
            styles.netBadge,
            dayNet >= 0 ? styles.netBadgeGreen : styles.netBadgeRed
          ]}>
            <Text style={dayNet >= 0 ? styles.netTextGreen : styles.netTextRed}>
              {dayNet >= 0 ? '+' : ''}{dayNet.toLocaleString()} {currency}
            </Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gelir</Text>
            <Text style={styles.statValGreen}>+{dayIncome.toLocaleString()} {currency}</Text>
          </View>
          <View style={styles.verticalLine} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gider</Text>
            <Text style={styles.statValRed}>-{dayExpense.toLocaleString()} {currency}</Text>
          </View>
        </View>

        <View style={styles.horizontalDivider} />

        {/* Seçili Günün İşlemleri */}
        <Text style={styles.txListTitle}>İşlemler</Text>
        
        {selectedTransactions.length > 0 ? (
          <ScrollView style={styles.txScrollView} nestedScrollEnabled>
            {selectedTransactions.map((tx) => {
              const IconComp = tx.type === 'income' ? ArrowDownLeft : (CATEGORY_ICONS[tx.category] || HelpCircle);
              const iconColor = tx.type === 'income' ? '#00e676' : (CATEGORY_COLORS[tx.category] || '#ff2a8d');

              return (
                <View key={tx.id} style={styles.txItemRow}>
                  <View style={[styles.txIconWrapper, { backgroundColor: iconColor + '15' }]}>
                    <IconComp size={16} color={iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txItemTitle} numberOfLines={1}>{tx.title}</Text>
                    <Text style={styles.txItemCat}>
                      {tx.type === 'income' ? 'Gelir' : tx.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={tx.type === 'income' ? styles.txValGreen : styles.txValRed}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} {currency}
                  </Text>
                  {onDeleteTransaction && (
                    <Pressable
                      onPress={() => onDeleteTransaction(tx.id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={14} color="rgba(255,255,255,0.3)" />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noTransactionsText}>Bu tarihe ait herhangi bir kayıtlı işlem bulunmuyor.</Text>
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  calendarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 12,
    fontWeight: '600',
    width: (width - 72) / 7,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 20,
  },
  dayCell: {
    width: (width - 74) / 7,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCellEmpty: {
    width: (width - 74) / 7,
    height: 44,
    backgroundColor: 'transparent',
  },
  dayText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    bottom: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  detailsCard: {
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsDateLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  netBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  netBadgeGreen: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
  },
  netBadgeRed: {
    backgroundColor: 'rgba(255, 42, 141, 0.12)',
  },
  netTextGreen: {
    color: '#00e676',
    fontWeight: '700',
    fontSize: 13,
  },
  netTextRed: {
    color: '#ff2a8d',
    fontWeight: '700',
    fontSize: 13,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValGreen: {
    color: '#00e676',
    fontWeight: '600',
    fontSize: 14,
  },
  statValRed: {
    color: '#ff2a8d',
    fontWeight: '600',
    fontSize: 14,
  },
  verticalLine: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 14,
  },
  txListTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  txScrollView: {
    maxHeight: 180,
  },
  txItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
    gap: 10,
  },
  txIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txItemTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  txItemCat: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  txValGreen: {
    color: '#00e676',
    fontWeight: '700',
    fontSize: 13,
  },
  txValRed: {
    color: '#ff2a8d',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    padding: 6,
  },
  noTransactionsText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 14,
  },
});
