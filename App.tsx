// ChatApp/App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen"; // Screen baru
import ChatScreen from "./screens/ChatScreen";

// Hapus signInAnonymously
import { auth, onAuthStateChanged, User } from "./firebase"; 

export type RootStackParamList = {
  Login: undefined;
  Register: undefined; // Tambah screen register
  Chat: { email: string }; // Ganti name jadi email
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener untuk perubahan status autentikasi (handle auto-login)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
          </View>
      );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Jika sudah login, langsung ke ChatScreen
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ title: `Chat - ${user.email}` }} 
            initialParams={{ email: user.email || '' }}
          />
        ) : (
          // Jika belum login
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Masuk' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar Akun' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}