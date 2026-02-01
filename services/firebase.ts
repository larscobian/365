import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// --- INSTRUCCIONES DE CONFIGURACIÓN ---
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto.
// 3. En "General" > "Tus apps", haz clic en el icono web (</>).
// 4. Copia los valores que te aparecen en `firebaseConfig` y pégalos abajo.

const firebaseConfig = {
  // Reemplaza los textos entre comillas con tus datos reales de Firebase
  apiKey: "AIzaSyAnlTfWKUQ_WXrckp21AL0N32QajETYcII",
  authDomain: "arsmate-datos.firebaseapp.com",
  projectId: "arsmate-datos",
  storageBucket: "arsmate-datos.firebasestorage.app",
  messagingSenderId: "138079103620",
  appId: "1:138079103620:web:cc2060b62ccee2da4530d1"
};

// Inicialización
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
