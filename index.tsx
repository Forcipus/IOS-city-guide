import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createClient } from '@supabase/supabase-js';

const { width } = Dimensions.get('window');

const supabaseUrl = 'https://amasuyuptvhcdvypllde.supabase.co';
const supabaseAnonKey = 'sb_publishable_9r7IJo8lyaJadUZ28Lp2SQ_lifVcBuX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ATTRACTIONS_DATA = [/*
    {
        id: 1,
        title: 'Historic Town Square',
        desc: 'Beautiful plaza with architecture.',
        details: 'Bu meydan 1800’lü yıllardan kalma binaları ve yerel kafeleriyle şehrin kalbidir.',
        rating: '4.8',
        open: '24/7',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 2,
        title: 'Riverside Park',
        desc: 'Scenic park with walking trails.',
        details: 'Nehir kenarında huzurlu bir yürüyüş yolu ve dinlenme alanları.',
        rating: '4.6',
        open: '06:00 - 22:00',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop'
    },*/
];

const NEWS_DATA = [/*
    {
        id: 1,
        title: 'New Community Center',
        date: '2 hours ago',
        category: 'Community',
        content: 'Şehrin yeni sosyal merkezi bugün kapılarını açtı. İçerisinde kütüphane ve modern çalışma alanları bulunuyor.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 2,
        title: 'Local High School Wins',
        date: '5 hours ago',
        category: 'Sports',
        content: 'Yerel basketbol takımı eyalet şampiyonasında kupayı evine getirdi!',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop'
    },*/
];

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Geçici olarak ana sayfaya geçmek için
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login'); // Giriş mi Kayıt mı modu?
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Sadece kayıt modunda görünecek
    const [activeUser, setActiveUser] = useState<any>(null);

    const [selectedAttraction, setSelectedAttraction] = useState<number | null>(null);
    const [selectedNews, setSelectedNews] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [weather, setWeather] = useState({ temp: '--', status: 'Yükleniyor...' });

    const [allComments, setAllComments] = useState<Record<string, any[]>>({
        'attraction_1': [{ id: 101, user: 'Gezgin', text: 'Geçen hafta sonu gittim, harikaydı!' }] 
    });

    const [attractions, setAttractions] = useState<any[]>([]);
    const [news, setNews] = useState<any[]>([]);

    // Verileri Supabase'den çekme fonksiyonu
    const fetchData = async () => {
        // Mekanları çek
        const { data: attrData } = await supabase.from('attractions').select('*');
        if (attrData) setAttractions(attrData);

        // Haberleri çek
        const { data: newsData } = await supabase.from('news').select('*');
        if (newsData) setNews(newsData);
    };

    const handleAddComment = async (type: 'attraction' | 'news', id: number) => {
        if (comment.trim() === '') return;

        // Giriş yapan kullanıcının metadata'sındaki display_name'i al, yoksa e-postasını kullan
        const currentUsername = activeUser?.user_metadata?.display_name || activeUser?.email || 'Anonim Kullanıcı';

        const { error } = await supabase
            .from('comments')
            .insert([
                {
                    entity_type: type,
                    entity_id: id,
                    username: currentUsername, //'Misafir Gezgin'
                    comment_text: comment
                }
            ]);

        if (!error) {
            setComment(''); 
            fetchComments(type, id); 
        } else {
            alert('Yorum kaydedilemedi!');
        }
    };

    const fetchWeather = async () => {
        try {
            const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Ankara&units=metric&appid=24f2f1dc7e38c10e06fa4858f67b1dca');
            const data = await response.json();
            setWeather({
                temp: Math.round(data.main.temp) + '°C',
                status: data.weather[0].main
            });
        } catch (error) {
            setWeather({ temp: '!', status: 'Hata' });
        }
    };

    const [currentComments, setCurrentComments] = useState<any[]>([]);
    const fetchComments = async (type: 'attraction' | 'news', id: number) => {
        const { data, error } = await supabase
            .from('comments')
            .select('*') 
            .eq('entity_type', type) 
            .eq('entity_id', id)    
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Yorum çekme hatası:", error);
        } else if (data) {
            setCurrentComments(data);
        }
    };

    useEffect(() => {
        if (selectedAttraction) {
            fetchComments('attraction', selectedAttraction);
        }
        if (selectedNews) {
            fetchComments('news', selectedNews);
        }
    }, [selectedAttraction, selectedNews])

    useEffect(() => {
        // Uygulama her açıldığında cihazda kayıtlı aktif bir oturum var mı kontrol et
        const checkActiveSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Eğer geçerli bir token/oturum varsa verileri yükle ve içeri al
                setActiveUser(session.user);
                setIsAuthenticated(true);
            }
        };
        checkActiveSession();
        fetchWeather();
        fetchData();
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (!error) {
            // Çıkış başarılıysa tüm kullanıcı state'lerini sıfırla ve giriş ekranına fırlat
            setActiveUser(null);
            setIsAuthenticated(false);
            // Temizlik için açık kalmış detay sayfalarını da kapat
            setSelectedAttraction(null);
            setSelectedNews(null);
        } 
    };

    const handleSignUp = async () => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Kullanıcı adını veritabanında 'metadata' olarak saklıyoruz
                data: { display_name: username }
            }
        });

        if (error) {
            alert(`Kayıt Hatası: ${error.message}`);
        } else if (data.user) {
            alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            setAuthMode('login'); // Kullanıcıyı otomatik giriş moduna fırlat
        }
    };

    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert(`Giriş Hatası: ${error.message}`);
        } else if (data.session) {
            // Supabase'den gelen kullanıcı verilerini hafızaya alıyoruz
            setActiveUser(data.session.user);
            // Supabase geçerli bir session (oturum) döndüyse kapıyı aç
            setIsAuthenticated(true);
        }
    };

    // --- YORUM EKLEME FONKSİYONU ---
    /*const handleAddComment = (type: 'attraction' | 'news', id: number) => {
        if (comment.trim() === '') return; // Boş yorum atılmasını engelle

        const key = `${type}_${id}`;
        const newCommentObj = {
            id: Date.now(), // Benzersiz bir ID (DB'deki Auto-Increment gibi)
            user: 'Misafir Kullanıcı', // İleride login olan kullanıcının adı gelecek
            text: comment
        };

        setAllComments(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newCommentObj]
        }));

        setComment(''); // Input'u temizle
    };*/

    // --- 1. EKRAN: GİRİŞ / KAYIT EKRANI (Arayüz) ---
    if (!isAuthenticated) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.authContainer}>
                    <StatusBar barStyle="dark-content" />
                    <View style={styles.authHeaderBox}>
                        <Text style={styles.authLogo}>CityGuide</Text>
                        <Text style={styles.authSubTitle}>
                            {authMode === 'login' ? 'Şehrini keşfetmeye hazır mısın?' : 'Yeni bir hesap oluştur ve katıl.'}
                        </Text>
                    </View>

                    <View style={styles.authFormBox}>
                        {authMode === 'signup' && (
                            <TextInput
                                style={styles.authInput}
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChangeText={setUsername}
                                placeholderTextColor="#9ca3af"
                            />
                        )}

                        <TextInput
                            style={styles.authInput}
                            placeholder="E-posta Adresi"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />

                        <TextInput
                            style={styles.authInput}
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry // Şifreyi yıldızlı göstermek için
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />

                        {/* KRİTİK DEĞİŞİKLİK: authMode durumuna göre doğru fonksiyona yönlendiriyoruz */}
                        <TouchableOpacity
                            style={styles.authButton}
                            onPress={authMode === 'login' ? handleSignIn : handleSignUp}
                        >
                            <Text style={styles.authButtonText}>
                                {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toggleAuthMode}
                            onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        >
                            <Text style={styles.toggleAuthText}>
                                {authMode === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    // --- MEKAN DETAY SAYFASI ---
    if (selectedAttraction) {
        const item = attractions.find(a => a.id === selectedAttraction);
        return (
            <SafeAreaProvider>
                <ScrollView style={styles.detailContainer}>
                    <View style={styles.heroSection}>
                        <Image source={{ uri: item?.image_url }} style={styles.heroImageFull} />
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
                            <Text style={styles.sectionTitleSmall}>Yorumlar ({currentComments.length})</Text>

                            {currentComments.map((c) => (
                                <View key={c.id} style={styles.commentBubble}>
                                    <Text style={styles.commentUser}>{c.username}</Text>
                                    <Text style={styles.commentText}>{c.comment_text}</Text>
                                </View>
                            ))}

                            {/* Yorum Yazma Alanı */}
                            <TextInput
                                style={styles.input}
                                placeholder="Yorumunuzu yazın..."
                                value={comment}
                                onChangeText={setComment}
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={() => handleAddComment('attraction', selectedAttraction)}>
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
        const item = news.find(n => n.id === selectedNews);
        return (
            <SafeAreaProvider>
                <ScrollView style={styles.detailContainer}>
                    <View style={styles.heroSection}>
                        <Image source={{ uri: item?.image_url }} style={styles.heroImageFull} />
                        <SafeAreaView style={styles.backButtonOverlay}>
                            <TouchableOpacity style={styles.circleBack} onPress={() => setSelectedNews(null)}>
                                <Text style={styles.backText}>✕</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                    <View style={styles.contentCard}>
                        <View style={styles.newsBadge}><Text style={styles.newsBadgeText}>{item?.category}</Text></View>
                        <Text style={styles.detailTitle}>{item?.title}</Text>
                        <Text style={styles.dateText}>{item?.publish_date}</Text>
                        <Text style={styles.descriptionText}>{item?.content}</Text>

                        {/* YORUM BÖLÜMÜ */}
                        <View style={styles.commentSection}>
                            <Text style={styles.sectionTitleSmall}>Yorumlar ({currentComments.length})</Text>

                            {currentComments.map((c) => (
                                <View key={c.id} style={styles.commentBubble}>
                                    <Text style={styles.commentUser}>{c.username}</Text>
                                    <Text style={styles.commentText}>{c.comment_text}</Text>
                                </View>
                            ))}

                            <TextInput
                                style={styles.input}
                                placeholder="Habere yorum yap..."
                                value={comment}
                                onChangeText={setComment}
                            />
                            <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#2563eb' }]} onPress={() => handleAddComment('news', selectedNews)}>
                                <Text style={styles.sendButtonText}>Yorumla</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaProvider>
        );
    }

    // --- ANA DASHBOARD ---
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                    {/* YENİ: Başlık Alanı ve Çıkış Yap Butonu Yan Yana Getirildi */}
                    <View style={styles.headerRow}>
                        <View style={styles.header}>
                            <Text style={styles.title}>City</Text>
                            <Text style={styles.subTitle}>Your local guide</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                            <Text style={styles.logoutText}>Çıkış Yap</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.card, styles.weatherCard]}>
                        <Text style={styles.cardText}>My Location</Text>
                        <Text style={styles.weatherTemp}>{weather.temp}</Text>
                        <Text style={styles.weatherStatus}>{weather.status}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Explore</Text>
                        {attractions.map(item => (
                            <TouchableOpacity key={item.id} style={[styles.card, styles.attractionCard]} onPress={() => setSelectedAttraction(item.id)}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardText}>{item.title}</Text>
                                    <Text style={styles.arrow}>➔</Text>
                                </View>
                                <Text style={styles.cardDetail}>{item.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Latest News</Text>
                        {news.map(item => (
                            <TouchableOpacity key={item.id} style={[styles.card, styles.newsCard]} onPress={() => setSelectedNews(item.id)}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardText}>{item.title}</Text>
                                    <Text style={styles.arrow}>➔</Text>
                                </View>
                                <Text style={styles.cardDetail}>{item.publish_date} • {item.category}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    authContainer: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', paddingHorizontal: 30 },
    authHeaderBox: { marginBottom: 40, alignItems: 'center' },
    authLogo: { fontSize: 36, fontWeight: 'bold', color: '#030213', letterSpacing: 1 },
    authSubTitle: { fontSize: 15, color: '#64748b', marginTop: 10, textAlign: 'center' },
    authFormBox: { backgroundColor: '#ffffff', padding: 25, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
    authInput: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 16, color: '#030213' },
    authButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    authButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    toggleAuthMode: { marginTop: 20, alignItems: 'center' },
    toggleAuthText: { color: '#64748b', fontSize: 14, fontWeight: '600' },

    safeArea: { flex: 1, backgroundColor: '#ffffff' },
    container: { flex: 1, paddingHorizontal: 20 },
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
    dateText: { color: '#9ca3af', marginBottom: 10 },

    newsBadge: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
    newsBadgeText: { color: '#2563eb', fontWeight: 'bold', fontSize: 12 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    logoutButton: { backgroundColor: '#fee2e2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },

    commentSection: { marginTop: 20, padding: 15, backgroundColor: '#f9fafb', borderRadius: 20 },
    commentBubble: { backgroundColor: '#ffffff', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    commentUser: { fontWeight: 'bold', color: '#3b82f6', marginBottom: 4, fontSize: 14 },
    commentText: { color: '#374151', fontSize: 15, lineHeight: 22 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10, fontSize: 16 },
    sendButton: { backgroundColor: '#f97316', padding: 15, borderRadius: 12, alignItems: 'center' },
    sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});