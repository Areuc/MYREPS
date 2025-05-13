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
        BICEPS: ["Curl Predicador", "Curl Martillo", "Unilateral Mancuernas", "Biserie", "Barra Z"],
        TRICEPS: ["Polea alta con cuerda", "Polea alta con barra rodamiento", "Cruzado Cboom", "Katana"],
        PIERNAS: ["Prensa de piernas", "Hip thrust", "Peso Libre", "Sentadilla Hack", "Isquiotibiales", "Extensión de cuádriceps", "Abductor", "Aductor"]
        
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
      
        try {
          const snapshot = await getDocs(collection(db, `users/${currentUser.uid}/prs`));
          const allPRs = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
      
          // Agrupar por grupo + ejercicio
          const maxByExercise = {};
          const latestByExercise = {};
      
          allPRs.forEach(pr => {
            const key = `${pr.group}_${pr.exercise}`;
      
            // Máximo peso
            if (!maxByExercise[key] || pr.weight > maxByExercise[key].weight) {
              maxByExercise[key] = pr;
            }
      
            // Última entrada
            if (!latestByExercise[key] || pr.date > latestByExercise[key].date) {
              latestByExercise[key] = pr;
            }
          });
      
          // Agrupar por grupo muscular
          const groupedMax = Object.values(maxByExercise).reduce((acc, pr) => {
            if (!acc[pr.group]) acc[pr.group] = [];
            acc[pr.group].push(pr);
            return acc;
          }, {});
      
          const groupedLatest = Object.values(latestByExercise).reduce((acc, pr) => {
            if (!acc[pr.group]) acc[pr.group] = [];
            acc[pr.group].push(pr);
            return acc;
          }, {});
      
          // Renderizar por grupo muscular
          for (const group of Object.keys(groupedMax)) {
            const groupBox = document.createElement('div');
            groupBox.className = 'pr-group';
            groupBox.innerHTML = `<div class="group-title">Grupo Muscular: ${group}</div>`;
      
            const repsGrid = document.createElement('div');
            repsGrid.className = 'reps-grid';
      
            const maxBox = document.createElement('div');
            maxBox.className = 'reps-box';
            maxBox.innerHTML = `<strong>💪 Máximos por ejercicio</strong><br/>`;
      
            groupedMax[group].forEach(pr => {
              maxBox.innerHTML += `
                <div style="margin-top: 10px;">
                  <strong>${pr.exercise}</strong><br/>
                  ${pr.weight} kg (${pr.reps} reps) - ${pr.date}
                </div>
              `;
            });
      
            const latestBox = document.createElement('div');
            latestBox.className = 'reps-box';
            latestBox.innerHTML = `<strong>📅 Últimas reps</strong><br/>`;
      
            if (groupedLatest[group]) {
              groupedLatest[group].forEach(pr => {
                latestBox.innerHTML += `
                  <div style="margin-top: 10px;">
                    <strong>${pr.exercise}</strong><br/>
                    ${pr.reps} reps con ${pr.weight} kg - ${pr.date}
                  </div>
                `;
              });
            }
      
            repsGrid.appendChild(maxBox);
            repsGrid.appendChild(latestBox);
            groupBox.appendChild(repsGrid);
            prList.appendChild(groupBox);
          }
      
        } catch (error) {
          console.error('Error al cargar PRs:', error);
          prList.innerHTML = `<p style="color: red;">Error al cargar los datos</p>`;
        }
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
