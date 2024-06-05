import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyA-am3_ITO92PpZuIo7RLOSoId08WUjDLM',
  authDomain: 'easy-car-2c3cb.firebaseapp.com',
  projectId: 'easy-car-2c3cb',
  storageBucket: 'easy-car-2c3cb.appspot.com',
  messagingSenderId: '621279423544',
  appId: '1:621279423544:web:8e82f4edb2b49520df0acd',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore();