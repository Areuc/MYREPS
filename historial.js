import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Configuración Firebase
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

// DOM
const tableBody = document.getElementById("tableBody");
const filterGroup = document.getElementById("filterGroup");
const filterExercise = document.getElementById("filterExercise");
const filterDate = document.getElementById("filterDate");

let allData = [];
let currentUser = null;

const exercises = {
  PECHO: ["Press de Banca", "Press Inclinado", "Press de Banca Unilateral", "Press Inclinado Unilateral", "Cruces entre Poleas"],
  ESPALDA: ["Remo T", "Jalones", "Remo", "Lumbar"],
  BICEPS: ["Curl Predicador", "Curl Martillo", "Unilateral Mancuernas", "Biserie", "Barra Z"],
  TRICEPS: ["Polea alta con cuerda", "Polea alta con barra rodamiento", "Cruzado Cboom", "Katana"],
  PIERNAS: ["Prensa de piernas", "Hip thrust", "Peso Libre", "Sentadilla Hack", "Isquiotibiales", "Extensión de cuádriceps", "Abductor", "Aductor"]
};

// Filtros dinámicos
filterGroup.addEventListener("change", () => {
  const selectedGroup = filterGroup.value;
  filterExercise.innerHTML = '<option value="">Todos los ejercicios</option>';
  if (exercises[selectedGroup]) {
    exercises[selectedGroup].forEach(ex => {
      filterExercise.innerHTML += `<option value="${ex}">${ex}</option>`;
    });
  }
  renderTable();
});
filterExercise.addEventListener("change", renderTable);
filterDate.addEventListener("change", renderTable);

// Autenticación y carga de datos
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  const querySnapshot = await getDocs(collection(db, `users/${user.uid}/prs`));
  allData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderTable();
});

// Renderizar tabla con filtros aplicados
function renderTable() {
  const group = filterGroup.value;
  const exercise = filterExercise.value;
  const date = filterDate.value;

  const filtered = allData.filter(pr => {
    const matchGroup = group ? pr.group === group : true;
    const matchExercise = exercise ? pr.exercise === exercise : true;
    const matchDate = date ? pr.date === date : true;
    return matchGroup && matchExercise && matchDate;
  });

  tableBody.innerHTML = filtered.map(pr => `
    <tr>
      <td>${pr.group}</td>
      <td>${pr.exercise}</td>
      <td>${pr.weight} kg</td>
      <td>${pr.reps}</td>
      <td>${pr.date}</td>
      <td><button class="delete-btn" data-id="${pr.id}">🗑️</button></td>
    </tr>
  `).join('');
}

// Escuchar clic en eliminar
tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    const confirmar = confirm("¿Estás seguro que quieres eliminar esta repetición?");
    if (confirmar && id && currentUser) {
      try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/prs`, id));
        // Eliminar visualmente
        allData = allData.filter(pr => pr.id !== id);
        renderTable();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("❌ Ocurrió un error al eliminar.");
      }
    }
  }
});
