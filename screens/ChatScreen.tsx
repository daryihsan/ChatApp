import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  signOut,
  auth,
} from "../firebase";
import { messagesCollection } from "../firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
// ----------------------------------------------------
// Tipe untuk Pesan - Menambahkan imageBase64
// ----------------------------------------------------
type MessageType = {
  id: string;
  text: string | null; // Bisa null jika hanya mengirim gambar
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  // Tambahan untuk gambar:
  imageBase64?: string | null; 
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

const CHAT_STORAGE_KEY = 'chat_messages'; // Kunci AsyncStorage

export default function ChatScreen({ route, navigation }: Props) {
  const { email } = route.params; 
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth listener di App.tsx akan mendeteksi perubahan ini dan mengalihkan ke LoginScreen.
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Gagal melakukan Logout.");
    }
  };

  // useLayoutEffect untuk menambahkan tombol di Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button 
          onPress={handleLogout} 
          title="Logout" 
          color="#FF6347" 
        />
      ),
    });
  }, [navigation]);
  // Fungsi untuk memuat chat dari Local Storage (AsyncStorage)
  const loadLocalMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (e) {
      console.error("Failed to load local messages:", e);
    }
  };
  
  // Fungsi untuk menyimpan chat ke Local Storage
  const saveLocalMessages = async (data: MessageType[]) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save local messages:", e);
    }
  };


  // ----------------------------------------------------
  // FUNGSI MENGIRIM PESAN DAN GAMBAR (Gunakan email sebagai user)
  // ----------------------------------------------------
  const sendMessage = async () => {
    if (!message.trim()) return;
    await addDoc(messagesCollection, {
        text: message,
        user: email, // Menggunakan email sebagai nama/identifier
        createdAt: serverTimestamp(),
        imageBase64: null, 
    });
    setMessage("");
  };

  const pickImageAndSend = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });

    if (result.didCancel || !result.assets || result.assets.length === 0 || !result.assets[0].uri) {
      return;
    }
    const asset = result.assets[0];
    
    try {
        const base64 = await RNFS.readFile(asset.uri, 'base64');

        await addDoc(messagesCollection, {
            text: message || null, 
            user: email, // Menggunakan email sebagai nama/identifier
            createdAt: serverTimestamp(),
            imageBase64: base64,
        });
        setMessage(""); 
    } catch (error) {
        Alert.alert("Gagal Unggah", "Gagal mengonversi atau mengirim gambar.");
        console.error("Error sending image: ", error);
    }
  };


  // ----------------------------------------------------
  // USE EFFECT (Sinkronisasi dan Offline-first)
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Load data lokal dulu (Offline-first)
    loadLocalMessages(); 

    // 2. Setup Real-time Listener Firestore
    const q = query(messagesCollection, orderBy("createdAt", "asc")); 
    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });
      
      setMessages(list);
      // 3. Simpan data terbaru ke local storage
      saveLocalMessages(list); 

    }, (error) => {
        console.error("Firestore Listener Error: ", error);
        Alert.alert("Error Koneksi", "Gagal mengambil data chat (Menampilkan mode Offline).");
    });

    return () => unsub(); // Clean-up
  }, []);
  // ----------------------------------------------------
  // FUNGSI UNTUK MENAMPILKAN PESAN DI FLATLIST
  // ----------------------------------------------------
const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === email; // Cek berdasarkan email
    return (
      <View
        style={[
          styles.msgBox,
          isMyMessage ? styles.myMsg : styles.otherMsg,
        ]}
      >
        <Text style={styles.sender}>{item.user}</Text>
        {item.imageBase64 && (
            <Image 
                source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }} 
                style={styles.chatImage}
                resizeMode="cover"
            />
        )}
        {item.text && <Text>{item.text}</Text>}
      </View>
    );
  };
  
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
      
      {/* Input Row */}
      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickImageAndSend} style={styles.imageButton}>
            <Text style={{ fontSize: 24 }}>🖼️</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <Button 
            title="Kirim" 
            onPress={sendMessage} 
            disabled={!message.trim()} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  msgBox: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  myMsg: {
    backgroundColor: "#d1f0ff",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: 'center', 
  },
  input: {
    flex: 1,
    borderWidth: 1,
    marginRight: 10,
    padding: 8,
    borderRadius: 6,
    minHeight: 40,
  },
  imageButton: {
      paddingHorizontal: 10,
  },
  chatImage: {
      width: 200, 
      height: 200,
      borderRadius: 4,
      marginBottom: 5,
  }
});
