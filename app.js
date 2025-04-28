import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB8TBS-VzuXrEgFbnxwek9Dl9XMUE8gtGo",
    authDomain: "myreps-3a2e0.firebaseapp.com",
    projectId: "myreps-3a2e0",
    storageBucket: "myreps-3a2e0.firebasestorage.app",
    messagingSenderId: "600439507813",
    appId: "1:600439507813:web:a46b3684b871fd20acaf8c",
    measurementId: "G-3PY42KJSK3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos comunes
let currentUser = null;

// ====================
// Funciones para index.html
// ====================
if (document.getElementById('loginSection')) {
    // Elementos del DOM
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerBtn = document.getElementById('registerBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    // Manejo de vistas
    showRegister.addEventListener('click', () => {
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    });

    showLogin.addEventListener('click', () => {
        registerSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
    });

    // Login
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
            window.location.href = 'app.html';
        } catch (error) {
            document.getElementById('loginMessage').textContent = `❌ Error: ${error.message}`;
        }
    });

    // Registro
    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, registerEmail.value, registerPassword.value);
            window.location.href = 'app.html';
        } catch (error) {
            document.getElementById('registerMessage').textContent = `❌ Error: ${error.message}`;
        }
    });
}

// ====================
// Funciones para app.html
// ====================
if (document.getElementById('prForm')) {
    // Elementos del DOM
    const userEmail = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    const prForm = document.getElementById('prForm');
    const muscleGroup = document.getElementById('muscleGroup');
    const exercise = document.getElementById('exercise');
    const weight = document.getElementById('weight');
    const reps = document.getElementById('reps');
    const prDate = document.getElementById('prDate');
    const prList = document.getElementById('prList');

    const exercises = {
        PECHO: ["Press de Banca", "Press Inclinado", "Press de Banca Unilateral", "Press Inclinado Unilateral", "Cruces entre Poleas"],
        ESPALDA: ["Remo T", "Jalones", "Remo", "Lumbar"],
        PIERNAS: ["Prensa de piernas", "Hip thrust", "Peso muerto", "Sentadilla Hack", "Isquiotibiales"]
        BICEPS: ["Curl predicador", "Curl Martillo", "Unilateral Mancuernas", "Biserie", "Barra Z"]
        TRICEPS: ["Polea alta con barra (rodamiento)", "Polea alta con cuerda", "Katana", "Cboom Cruce polea"]
    };

    // Cargar ejercicios
    muscleGroup.addEventListener('change', () => {
        exercise.innerHTML = '';
        exercises[muscleGroup.value].forEach(ex => {
            exercise.add(new Option(ex, ex));
        });
    });

    // Cargar inicial
    muscleGroup.dispatchEvent(new Event('change'));

    // Logout
    logoutBtn.addEventListener('click', () => {
        signOut(auth);
        window.location.href = 'index.html';
    });

    // Guardar PR
    prForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const prData = {
                group: muscleGroup.value,
                exercise: exercise.value,
                weight: parseFloat(weight.value),
                reps: parseInt(reps.value),
                date: prDate.value,
                timestamp: new Date()
            };

            await addDoc(collection(db, `users/${currentUser.uid}/prs`), prData);
            prForm.reset();
            loadPRs();
        } catch (error) {
            console.error('Error al guardar PR:', error);
        }
    });

    // Cargar PRs
    async function loadPRs() {
        prList.innerHTML = '';
        const querySnapshot = await getDocs(collection(db, `users/${currentUser.uid}/prs`));
        querySnapshot.forEach(doc => {
            const pr = doc.data();
            const prElement = document.createElement('div');
            prElement.className = 'pr-item';
            prElement.innerHTML = `
                <div class="pr-group">${pr.group}</div>
                <div class="pr-exercise">${pr.exercise}</div>
                <div class="pr-weight">${pr.weight} kg</div>
                <div class="pr-reps">${pr.reps} reps</div>
                <div class="pr-date">${pr.date}</div>
                <button class="delete-btn" data-id="${doc.id}">🗑️</button>
            `;
            prList.appendChild(prElement);
        });
    }

    // Eliminar PR
    prList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const prId = e.target.dataset.id;
            await deleteDoc(doc(db, `users/${currentUser.uid}/prs`, prId));
            loadPRs();
        }
    });
}

// Manejo de autenticación global
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    
    if (window.location.pathname.endsWith('app.html')) {
        if (!user) window.location.href = 'index.html';
        else document.getElementById('userEmail').textContent = user.email;
    } else {
        if (user) window.location.href = 'app.html';
    }
});

  
  
