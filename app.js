const exercises = {
  PECHO: [
    "Press de Banca",
    "Press Inclinado",
    "Press de Banca Unilateral",
    "Press Inclinado Unilateral",
    "Cruces entre Poleas"
  ],
  ESPALDA: [
    "Remo T",
    "Jalones",
    "Remo",
    "Lumbar"
  ],
  BICEPS: [
    "Curl Predicador",
    "Curl tumbado en banco",
    "Curl Martillo"
  ],
  TRICEPS: [
    "Extensión de tríceps en polea con cuerda",
    "Cruzado Cboom",
    "Katana"
  ],
  PIERNAS: [
    "Prensa de piernas",
    "Hip thrust",
    "Peso muerto",
    "Sentadilla Hack",
    "Isquiotibiales",
    "Extensión de cuádriceps",
    "Abductor y aductor"
  ]
};

let currentUser = localStorage.getItem("currentUser");
const prData = JSON.parse(localStorage.getItem("prData")) || {};
const userNameInput = document.getElementById("userName");
const userDisplay = document.getElementById("userDisplay");
const groupSelect = document.getElementById("groupSelect");
const exerciseSelect = document.getElementById("exerciseSelect");
const weightInput = document.getElementById("weightInput");
const repsInput = document.getElementById("repsInput");
const dateInput = document.getElementById("dateInput");
const prContainer = document.getElementById("prContainer");
const lastPRContainer = document.getElementById("lastPRContainer");
const userContainer = document.getElementById("userContainer");
const appContainer = document.getElementById("appContainer");

function setUser() {
  const userName = userNameInput.value.trim();
  if (userName) {
    currentUser = userName;
    localStorage.setItem("currentUser", currentUser);
    userContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
    userDisplay.textContent = currentUser;
    populateGroups();
    populateExercises("PECHO");
    renderPRs();
    renderLastPRs();
  }
}

function saveData() {
  localStorage.setItem("prData", JSON.stringify(prData));
}

function populateGroups() {
  groupSelect.innerHTML = '';
  for (let group in exercises) {
    const option = new Option(group, group);
    groupSelect.add(option);
  }
}

function populateExercises(group) {
  exerciseSelect.innerHTML = '';
  exercises[group].forEach(ex => {
    const option = new Option(ex, ex);
    exerciseSelect.add(option);
  });
}

function renderPRs() {
  prContainer.innerHTML = '';
  if (!prData[currentUser]) prData[currentUser] = {};

  for (let group in prData[currentUser]) {
    const groupSection = document.createElement("section");
    groupSection.innerHTML = `<h3>${group}</h3>`;

    for (let exercise in prData[currentUser][group]) {
      const table = document.createElement("table");
      table.innerHTML = `<caption>${exercise}</caption>
        <tr><th>Fecha</th><th>Peso (kg)</th><th>Repeticiones</th><th>Acciones</th></tr>`;

      prData[currentUser][group][exercise].forEach((pr, index) => {
        table.innerHTML += `<tr>
          <td>${pr.date}</td>
          <td>${pr.weight}</td>
          <td>${pr.reps}</td>
          <td>
            <button onclick="editPR('${group}', '${exercise}', ${index})">Editar</button>
            <button onclick="deletePR('${group}', '${exercise}', ${index})">Eliminar</button>
          </td>
        </tr>`;
      });

      groupSection.appendChild(table);
    }

    prContainer.appendChild(groupSection);
  }
}

function renderLastPRs() {
  lastPRContainer.innerHTML = '';
  if (!prData[currentUser]) prData[currentUser] = {};

  for (let group in prData[currentUser]) {
    const groupDiv = document.createElement("div");
    groupDiv.innerHTML = `<strong>${group}:</strong>`;

    for (let exercise in prData[currentUser][group]) {
      const lastPR = prData[currentUser][group][exercise].slice(-1)[0];
      groupDiv.innerHTML += `<p><strong>${exercise}:</strong> ${lastPR.weight}kg x ${lastPR.reps} reps (${lastPR.date})</p>`;
    }

    lastPRContainer.appendChild(groupDiv);
  }
}

function editPR(group, exercise, index) {
  const pr = prData[currentUser][group][exercise][index];
  groupSelect.value = group;
  populateExercises(group);
  exerciseSelect.value = exercise;
  weightInput.value = pr.weight;
  repsInput.value = pr.reps;
  dateInput.value = pr.date;

  deletePR(group, exercise, index);
}

function deletePR(group, exercise, index) {
  prData[currentUser][group][exercise].splice(index, 1);
  if (prData[currentUser][group][exercise].length === 0) {
    delete prData[currentUser][group][exercise];
  }
  if (Object.keys(prData[currentUser][group]).length === 0) {
    delete prData[currentUser][group];
  }
  saveData();
  renderPRs();
  renderLastPRs();
}

document.getElementById("prForm").addEventListener("submit", e => {
  e.preventDefault();
  const group = groupSelect.value;
  const exercise = exerciseSelect.value;
  const weight = parseFloat(weightInput.value);
  const reps = parseInt(repsInput.value);
  const date = dateInput.value;

  if (!prData[currentUser][group]) prData[currentUser][group] = {};
  if (!prData[currentUser][group][exercise]) prData[currentUser][group][exercise] = [];

  prData[currentUser][group][exercise].push({ weight, reps, date });
  saveData();
  renderPRs();
  renderLastPRs();
  e.target.reset();
  populateExercises(group);
});

groupSelect.addEventListener("change", () => {
  populateExercises(groupSelect.value);
});

  
  
