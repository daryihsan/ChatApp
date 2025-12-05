import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { createUserWithEmailAndPassword, auth } from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert("Error", "Email dan Password harus diisi.");
    setLoading(true);
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        Alert.alert("Gagal Daftar", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Buat Akun Baru</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Alamat Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (Min. 6 Karakter)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      
      <TouchableOpacity 
          onPress={handleRegister} 
          style={styles.registerButton} 
          disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.buttonText}>Daftar</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.linkContainer}>
          <Button 
            title="Sudah punya akun? Masuk" 
            onPress={() => navigation.navigate("Login")} 
            color="#28a745"
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
      backgroundColor: '#f0f4f8' 
  },
  title: { 
      fontSize: 32, 
      textAlign: "center", 
      marginBottom: 50, 
      fontWeight: 'bold', 
      color: '#102A43' 
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
  registerButton: { 
      borderRadius: 10, 
      paddingVertical: 15,
      backgroundColor: '#28a745', 
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
