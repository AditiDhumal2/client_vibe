import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-ZGbMv16ZjqZvKeysEsAjyW73_STPEmA",
  authDomain: "emotionvibe-a745c.firebaseapp.com",
  projectId: "emotionvibe-a745c",
  storageBucket: "emotionvibe-a745c.appspot.com",
  messagingSenderId: "828147675773",
  appId: "1:828147675773:web:7bef3d15193d4f2417b714",
  measurementId: "G-HDRTTY0V52"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
