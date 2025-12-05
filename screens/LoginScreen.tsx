// ChatApp/screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native"; // <-- Komponen Standar
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { signInWithEmailAndPassword, auth } from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Email dan Password harus diisi.");
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        Alert.alert("Gagal Masuk", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Selamat Datang</Text>
      
      {/* Input Email */}
      <TextInput
        style={styles.input}
        placeholder="Alamat Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      
      {/* Input Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      
      {/* Tombol Masuk Custom */}
      <TouchableOpacity 
          onPress={handleLogin} 
          style={styles.loginButton} 
          disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.buttonText}>Masuk</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.linkContainer}>
          {/* Tombol Daftar */}
          <Button 
            title="Belum punya akun? Daftar Sekarang" 
            onPress={() => navigation.navigate("Register")} 
            color="#007AFF"
          />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      justifyContent: "center", 
      padding: 30, 
      backgroundColor: '#f0f4f8' // Warna latar belakang terang
  },
  title: { 
      fontSize: 32, 
      textAlign: "center", 
      marginBottom: 50, 
      fontWeight: 'bold', 
      color: '#102A43' // Warna teks gelap
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1E8EE',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButton: { 
      borderRadius: 10, 
      paddingVertical: 15,
      backgroundColor: '#007AFF', // Warna Biru Khas
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
      marginTop: 20,
  }
});