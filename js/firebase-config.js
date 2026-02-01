// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyCMRj1R_Z_x6i_nVOFc4WnK3D2ksX_DBXI",
    authDomain: "plant-shop-39909.firebaseapp.com",
    projectId: "plant-shop-39909",
    storageBucket: "plant-shop-39909.firebasestorage.app",
    messagingSenderId: "487433587089",
    appId: "1:487433587089:web:165b502fb1d1ccb4feb230"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Collections references
const usersRef = db.collection('users');
const plantsRef = db.collection('plants');
const ordersRef = db.collection('orders');

console.log('Firebase initialized successfully!');
