import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ShoppingBag, Utensils, Car, Film, HelpCircle } from 'lucide-react-native';

const CATEGORY_ICONS = {
  gida: Utensils,
  alisveris: ShoppingBag,
  ulasim: Car,
  eglence: Film,
  diger: HelpCircle,
};

const CATEGORY_COLORS = {
  gida: '#ff7b00',
  alisveris: '#00f2fe',
  ulasim: '#7f00ff',
  eglence: '#ff2a8d',
  diger: '#a0a0a0',
};

export default function ExpenseChart({ transactions, totalIncome, totalExpense, currency }) {
  // Bütçe kullanım yüzdesi
  const utilization = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
  const percentage = Math.min(Math.round(utilization * 100), 100);
  
  // Daire ölçüleri
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (utilization * circumference);

  // Kategori bazlı harcamaları gruplama
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const categories = [
    { key: 'gida', label: 'Gıda' },
    { key: 'alisveris', label: 'Alışveriş' },
    { key: 'ulasim', label: 'Ulaşım' },
    { key: 'eglence', label: 'Eğlence' },
    { key: 'diger', label: 'Diğer' },
  ].map(cat => ({
    ...cat,
    total: categoryTotals[cat.key] || 0,
    color: CATEGORY_COLORS[cat.key],
    Icon: CATEGORY_ICONS[cat.key] || HelpCircle,
  })).filter(cat => cat.total > 0);

  // En yüksek harcama yapılan kategori
  const maxExpense = Math.max(...categories.map(c => c.total), 0);

  return (
    <View style={styles.container}>
      {/* Dairesel Grafik */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00f2fe" />
              <Stop offset="100%" stopColor="#ff2a8d" />
            </LinearGradient>
          </Defs>
          {/* Arka plan halkası */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Aktif halka */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.centerTextContainer}>
          <Text style={styles.percentageText}>%{percentage}</Text>
          <Text style={styles.subText}>Gider / Gelir</Text>
        </View>
      </View>

      {/* Kategori Bazlı İlerleme Çubukları */}
      {categories.length > 0 ? (
        <View style={styles.categoriesContainer}>
          {categories.map(cat => {
            const ratio = maxExpense > 0 ? cat.total / maxExpense : 0;
            const CatIcon = cat.Icon;
            return (
              <View key={cat.key} style={styles.categoryRow}>
                <View style={[styles.iconWrapper, { backgroundColor: cat.color + '20' }]}>
                  <CatIcon size={18} color={cat.color} />
                </View>
                <View style={styles.rowDetails}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={styles.categoryAmount}>{cat.total.toLocaleString()} {currency}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { backgroundColor: cat.color, width: `${ratio * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>Henüz gösterilecek gider bulunmuyor.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  chartWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  categoriesContainer: {
    width: '100%',
    gap: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowDetails: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryAmount: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
