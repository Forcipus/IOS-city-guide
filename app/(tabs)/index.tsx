import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ATTRACTIONS_DATA = [
    {
        id: 1,
        title: 'Historic Town Square',
        desc: 'Historic Town Square',
        details: 'Historic Town Square',
        rating: '-1',
        open: '24/7',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 2,
        title: 'Riverside Park',
        desc: 'Riverside Park',
        details: 'Riverside Park',
        rating: '10/10',
        open: '06:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop'
    },
];

const NEWS_DATA = [
    {
        id: 1,
        title: 'New Community Center',
        date: '2 hours ago',
        category: 'Community',
        content: 'New Community Center',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 2,
        title: 'Local High School Wins',
        date: '5 hours ago',
        category: 'Sports',
        content: 'Local High School Wins',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop'
    },
];

export default function App() {
    const [selectedAttraction, setSelectedAttraction] = useState<number | null>(null);
    const [selectedNews, setSelectedNews] = useState<number | null>(null);
    const [comment, setComment] = useState('');

    // --- MEKAN DETAY SAYFASI ---
    if (selectedAttraction) {
        const item = ATTRACTIONS_DATA.find(a => a.id === selectedAttraction);
        return (
            <SafeAreaProvider>
                <ScrollView style={styles.detailContainer}>
                    <View style={styles.heroSection}>
                        <Image source={{ uri: item?.image }} style={styles.heroImageFull} />
                        <SafeAreaView style={styles.backButtonOverlay}>
                            <TouchableOpacity style={styles.circleBack} onPress={() => setSelectedAttraction(null)}>
                                <Text style={styles.backText}>✕</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                    <View style={styles.contentCard}>
                        <Text style={styles.detailTitle}>{item?.title}</Text>
                        <View style={styles.infoRow}>
                            <View style={styles.badge}><Text style={styles.badgeText}>⭐ {item?.rating}</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>🕒 {item?.open}</Text></View>
                        </View>
                        <Text style={styles.descriptionText}>{item?.details}</Text>

                        <View style={styles.commentSection}>
                            <Text style={styles.sectionTitleSmall}>Reviews</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Yorumunuzu yazın..."
                                value={comment}
                                onChangeText={setComment}
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={() => { alert('Yorum kaydedildi!'); setComment(''); }}>
                                <Text style={styles.sendButtonText}>Gönder</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaProvider>
        );
    }

    // --- HABER DETAY SAYFASI ---
    if (selectedNews) {
        const news = NEWS_DATA.find(n => n.id === selectedNews);
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView>
                        <View style={styles.newsDetailHeader}>
                            <TouchableOpacity onPress={() => setSelectedNews(null)}>
                                <Text style={styles.backButton}>← Haberler</Text>
                            </TouchableOpacity>
                            <Text style={styles.categoryTag}>{news?.category}</Text>
                        </View>
                        <Image source={{ uri: news?.image }} style={styles.newsImage} />
                        <View style={styles.padding20}>
                            <Text style={styles.detailTitle}>{news?.title}</Text>
                            <Text style={styles.dateText}>{news?.date}</Text>
                            <Text style={styles.contentText}>{news?.content}</Text>

                            <View style={styles.commentSection}>
                                <TextInput style={styles.input} placeholder="Habere yorum yap..." />
                                <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#2563eb' }]}>
                                    <Text style={styles.sendButtonText}>Yorumla</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    // --- ANA DASHBOARD ---
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>City</Text>
                        <Text style={styles.subTitle}>Your local guide</Text>
                    </View>

                    {/* Hava Durumu */}
                    <View style={[styles.card, styles.weatherCard]}>
                        <Text style={styles.cardText}>My Location</Text>
                        <Text style={styles.weatherTemp}>25°</Text>
                        <Text style={styles.weatherStatus}>Partly Cloudy</Text>
                    </View>

                    {/* Mekanlar Listesi */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Explore</Text>
                        {ATTRACTIONS_DATA.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.card, styles.attractionCard]}
                                onPress={() => setSelectedAttraction(item.id)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardText}>{item.title}</Text>
                                    <Text style={styles.arrow}>➔</Text>
                                </View>
                                <Text style={styles.cardDetail}>{item.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Haberler Listesi */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Latest News</Text>
                        {NEWS_DATA.map(news => (
                            <TouchableOpacity
                                key={news.id}
                                style={[styles.card, styles.newsCard]}
                                onPress={() => setSelectedNews(news.id)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardText}>{news.title}</Text>
                                    <Text style={styles.arrow}>➔</Text>
                                </View>
                                <Text style={styles.cardDetail}>{news.date} • {news.category}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#ffffff' },
    container: { flex: 1, paddingHorizontal: 20 },
    padding20: { padding: 20 },
    header: { marginTop: 10, marginBottom: 20 },
    title: { fontSize: 40, fontWeight: 'bold', color: '#030213' },
    subTitle: { fontSize: 16, color: '#717182' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    sectionTitleSmall: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },

    card: { borderRadius: 24, padding: 20, minHeight: 120, justifyContent: 'center', marginBottom: 12 },
    weatherCard: { backgroundColor: '#3b82f6' },
    attractionCard: { backgroundColor: '#f97316' },
    newsCard: { backgroundColor: '#2563eb' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, 
    cardText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
    cardDetail: { color: '#fff', opacity: 0.85, marginTop: 4 },
    weatherTemp: { fontSize: 64, color: '#fff', fontWeight: 'bold', textAlign: 'right' },
    weatherStatus: { color: '#fff', fontSize: 18 },
    arrow: { color: '#fff', fontSize: 20 },

    // Detay Sayfası Stilleri
    detailContainer: { flex: 1, backgroundColor: '#fff' },
    heroSection: { height: width * 0.8, width: '100%' },
    heroImageFull: { width: '100%', height: '100%' },
    backButtonOverlay: { position: 'absolute', top: 0, left: 20 },
    circleBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    backText: { color: '#fff', fontSize: 18 },
    contentCard: { backgroundColor: '#fff', marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25 },
    detailTitle: { fontSize: 26, fontWeight: 'bold', color: '#030213', marginBottom: 10 },
    infoRow: { flexDirection: 'row', marginBottom: 15 },
    badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginRight: 8 },
    badgeText: { color: '#4b5563', fontWeight: '600' },
    descriptionText: { fontSize: 16, lineHeight: 24, color: '#374151', marginBottom: 20 },

    commentSection: { marginTop: 20, padding: 15, backgroundColor: '#f9fafb', borderRadius: 20 },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10 },
    sendButton: { backgroundColor: '#f97316', padding: 12, borderRadius: 12, alignItems: 'center' },
    sendButtonText: { color: '#fff', fontWeight: 'bold' },

    newsImage: { width: '100%', height: 200 },
    newsDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    backButton: { fontSize: 16, color: '#3b82f6', fontWeight: 'bold' },
    categoryTag: { backgroundColor: '#eff6ff', color: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: 'bold' },
    dateText: { color: '#9ca3af', marginBottom: 10 },
    contentText: { fontSize: 17, lineHeight: 26, color: '#1f2937', marginBottom: 20 }
});