const workers = [];
let selectedWorker = null;

class Worker {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.energy = 50;
    this.fullness = 50;
    this.happiness = 50;
    this.intervalId = null;
  }

  nap() {
    this.energy = Math.min(100, this.energy + 40);
    this.happiness = Math.max(0, this.happiness - 10);
    this.fullness = Math.max(0, this.fullness - 10);
    showAction(`${this.name} entered Sleep Mode`);
    addToHistory(`${this.name} entered Sleep Mode`);
    showStatusIcon("");
    updateVisual("nap");
    setTimeout(() => updateVisual("start"), 2500);
    updateStatsDisplay();
    saveWorkersToLocalStorage();
  }

  play() {
    this.happiness = Math.min(100, this.happiness + 30);
    this.fullness = Math.max(0, this.fullness - 10);
    this.energy = Math.max(0, this.energy - 10);
    showAction(`${this.name}'s shares in fun went up`);
    addToHistory(`${this.name}'s shares in fun went up`);
    showStatusIcon("");
    updateVisual("happiness");
    setTimeout(() => updateVisual("start"), 2000);
    updateStatsDisplay();
    saveWorkersToLocalStorage();
  }

  eat() {
    this.fullness = Math.min(100, this.fullness + 30);
    this.happiness = Math.min(100, this.happiness + 5);
    this.energy = Math.max(0, this.energy - 15);
    showAction(`${this.name} filed for a coffee break`);
    addToHistory(`${this.name} filed for a coffee break`);
    showStatusIcon("");
    updateVisual("fullness");
    setTimeout(() => updateVisual("start"), 2000);
    updateStatsDisplay();
    saveWorkersToLocalStorage();
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      this.energy = Math.max(0, this.energy - 15);
      this.fullness = Math.max(0, this.fullness - 15);
      this.happiness = Math.max(0, this.happiness - 15);

      if (this === selectedWorker) {
        updateVisual();
        updateStatsDisplay();
      }

      if (this.energy <= 0 || this.fullness <= 0 || this.happiness <= 0) {
        showAction(`${this.name} quit the job due to burnout!`);
        addToHistory(`${this.name} quit the job due to burnout!`);
        removeWorker(this);
      }

      saveWorkersToLocalStorage();
    }, 10000);
  }
}

// Spara workers till localStorage
function saveWorkersToLocalStorage() {
  const data = workers.map(w => ({
    name: w.name,
    type: w.type,
    energy: w.energy,
    fullness: w.fullness,
    happiness: w.happiness
  }));
  localStorage.setItem("workers", JSON.stringify(data));
}

// Visar worker's status i "speech-bubble"
function showAction(message) {
  const status = document.getElementById("action-msg");
  status.textContent = message;
}

// Lägger till aktiviteten i "history-list"-listan
function addToHistory(message) {
  const list = document.getElementById("history-list");
  const item = document.createElement("li");
  item.classList.add("li-marker");
  item.textContent = message;
  list.prepend(item);
}

// Visar "worker-status-icon"
function showStatusIcon(icon) {
  const statusDiv = document.getElementById("worker-status-icon");
  statusDiv.textContent = icon;
  statusDiv.style.animation = "none";
  void statusDiv.offsetWidth;
  statusDiv.style.animation = "fadeout 2s forwards";
}

// Visar aktive "worker's" health
function updateStatsDisplay() {
  if (!selectedWorker) return;
  const statsDiv = document.getElementById("worker-stats");
  statsDiv.innerHTML = `
    <p>Power Level: ${selectedWorker.energy}</p>
    <p>Coffee Break: ${selectedWorker.fullness}</p>
    <p>Market Mood: ${selectedWorker.happiness}</p>
  `;
}

// Visar namnet på aktiv "worker"
function updateWorkerNameDisplay() {
  const nameDiv = document.getElementById("selected-worker-name");
  nameDiv.textContent = selectedWorker ? ` ${selectedWorker.name}` : '';
}

// Visar antal äggikoner beroende på antal aktiva "workers"
function updateEggSwitcher() {
  const switcher = document.getElementById("switcher-container");
  switcher.innerHTML = "";

  workers.forEach((worker) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("egg-icon");
    btn.title = `Switch to ${worker.name}`;
    btn.textContent = "";
    btn.addEventListener("click", () => {
      selectedWorker = worker;
      updateVisual();
      updateStatsDisplay();
      updateWorkerNameDisplay();
    });
    switcher.appendChild(btn);
  });
}

// Tar bort worker från listan och DOM vid utbrändhet
function removeWorker(worker) {
  const index = workers.indexOf(worker);
  if (index > -1) {
    clearInterval(worker.intervalId);

    const img = document.querySelector(".wrap-container");
    if (img) {
      img.classList.add("shake");
      setTimeout(() => {
        img.classList.remove("shake");

        workers.splice(index, 1);
        if (worker === selectedWorker) {
          selectedWorker = workers[0] || null;
        }
        updateVisual();
        updateStatsDisplay();
        updateEggSwitcher();
        updateWorkerNameDisplay();
        saveWorkersToLocalStorage();
      }, 400);
    } else {
      workers.splice(index, 1);
      if (worker === selectedWorker) {
        selectedWorker = workers[0] || null;
      }
      updateVisual();
      updateStatsDisplay();
      updateEggSwitcher();
      updateWorkerNameDisplay();
      saveWorkersToLocalStorage();
    }
  }
}

// Hämtar rätt bild beroende på typ och aktivitet
function getWorkerImage(type, activity = "start") {
  const number = type.split("-")[1];
  return `./images/worker-${number}-${activity}.webp`;
}

// Visar bilden för vald worker och aktivitet
function updateVisual(activity = "start") {
  const workerVisual = document.getElementById("worker-visual");
  if (!selectedWorker) {
    workerVisual.innerHTML = `<img src="./images/hatching-suitcase-white.png" class="bounce">`;
    return;
  }
  const imgPath = getWorkerImage(selectedWorker.type, activity);
  workerVisual.innerHTML = `<img src="${imgPath}" class="worker-image" alt="${selectedWorker.name} ${activity}">`;
}

// Skapar en ny "worker"
document.getElementById("worker-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("worker-name").value.trim();
  const type = document.getElementById("worker-type").value;

  if (!name || !type) {
    alert("Please enter a name and select a worker type!");
    return;
  }

  if (workers.length >= 4) {
    alert("Max 4 coworkers!");
    return;
  }

  const worker = new Worker(name, type);
  workers.push(worker);
  selectedWorker = worker;
  worker.startTimer();

  updateVisual();
  updateStatsDisplay();
  updateEggSwitcher();
  updateWorkerNameDisplay();

  // Rensa inputfält och återställ select
  document.getElementById("worker-name").value = "";
  document.getElementById("worker-type").selectedIndex = 0;

  saveWorkersToLocalStorage();
});

// Aktivitetsknappar
document.getElementById("btn-nap").addEventListener("click", () => {
  if (!selectedWorker) return alert("No worker selected!");
  selectedWorker.nap();
});
document.getElementById("btn-play").addEventListener("click", () => {
  if (!selectedWorker) return alert("No worker selected!");
  selectedWorker.play();
});
document.getElementById("btn-eat").addEventListener("click", () => {
  if (!selectedWorker) return alert("No worker selected!");
  selectedWorker.eat();
});

// Raderar vald "worker" manuellt
document.getElementById("delete-worker-btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (selectedWorker) {
    const confirmDelete = confirm(`Are you sure you want to remove ${selectedWorker.name}?`);
    if (confirmDelete) {
      removeWorker(selectedWorker);
    }
  }
});

// Ladda workers från localStorage vid sidstart
function loadWorkersFromLocalStorage() {
  const saved = JSON.parse(localStorage.getItem("workers"));
  if (!saved) return;

  saved.forEach(obj => {
    const worker = new Worker(obj.name, obj.type);
    worker.energy = obj.energy;
    worker.fullness = obj.fullness;
    worker.happiness = obj.happiness;
    workers.push(worker);
    worker.startTimer();
  });

  selectedWorker = workers[0] || null;
  updateVisual();
  updateStatsDisplay();
  updateEggSwitcher();
  updateWorkerNameDisplay();
}

loadWorkersFromLocalStorage();
