// ---------- Configuration ----------
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwK4agZ19jWwN4zUrWc9DStGl9ogLiYgrYImPKsxHyQab0CKDhLHBvTi1rZ1Nuelk0u/exec';

// Glass configuration for each carriage type (kept for reference, but we now use grid definitions)
const carriageGlassConfig = {
  'MC1': ['DLD','DL','W','DR','DRD','DPD','D1/R','D1/L','D2/R','D2/L','WL1E','WR1B','WR1T','WL2T','WL2B','WR2N','D3/R','D3/L','D4/R','D4/L','WL3N','WR3B','WR3T','WL4T','WL4B','WR4E','D5/R','D5/L','D6/R','D6/L','WL5S','WR5SB','WR5ST'],
  'T1': ['WL1ST','WL1SB','WR1S','D1/R','D1/L','D2/R','D2/L','WL2E','WR2B','WR2T','WL3T','WL3B','WR3N','D3/R','D3/L','D4/R','D4/L','WL4N','WR4B','WR4T','WL5T','WL5B','WR5E','D5/R','D5/L','D6/R','D6/L','WL6S','WR6SB','WR6ST'],
  'M1': ['WL1ST','WL1SB','WR1S','D1/R','D1/L','D2/R','D2/L','WL2E','WR2B','WR2T','WL3T','WL3B','WR3N','D3/R','D3/L','D4/R','D4/L','WL4N','WR4B','WR4T','WL5T','WL5B','WR5E','D5/R','D5/L','D6/R','D6/L','WL6S','WR6SB','WR6ST'],
  'M2': ['WL1ST','WL1SB','WR1S','D1/R','D1/L','D2/R','D2/L','WL2E','WR2B','WR2T','WL3T','WL3B','WR3N','D3/R','D3/L','D4/R','D4/L','WL4N','WR4B','WR4T','WL5T','WL5B','WR5E','D5/R','D5/L','D6/R','D6/L','WL6S','WR6SB','WR6ST'],
  'T2': ['WL1ST','WL1SB','WR1S','D1/R','D1/L','D2/R','D2/L','WL2E','WR2B','WR2T','WL3T','WL3B','WR3N','D3/R','D3/L','D4/R','D4/L','WL4N','WR4B','WR4T','WL5T','WL5B','WR5E','D5/R','D5/L','D6/R','D6/L','WL6S','WR6SB','WR6ST'],
  'MC2': ['DLD','DL','W','DR','DRD','DPD','D1/R','D1/L','D2/R','D2/L','WL1E','WR1B','WR1T','WL2T','WL2B','WR2N','D3/R','D3/L','D4/R','D4/L','WL3N','WR3B','WR3T','WL4T','WL4B','WR4E','D5/R','D5/L','D6/R','D6/L','WL5S','WR5SB','WR5ST']
};

const statusOptions = [
  { value: 'normal', label: 'Normal', color: 'green' },
  { value: 'damaged', label: 'Damaged', color: 'red' },
  { value: 'repaired', label: 'Repaired', color: 'orange' },
  { value: 'water', label: 'Water Issue', color: 'blue' }
];

// Grid definitions based on the physical form
const mcGrid = [
  ['DLD', 'DL', 'W', 'DR', 'DRD'],
  [null, 'D1/R', 'DPD', 'D2/L', null],
  [null, 'D1/L', null, 'D2/R', null],
  ['WL1E', null, null, 'WR1B', 'WR1T'],
  ['WL2T', 'WL2B', null, null, 'WR2N'],
  [null, 'D3/R', null, 'D4/L', null],
  [null, 'D3/L', null, 'D4/R', null],
  ['WL3N', null, null, 'WR3B', 'WR3T'],
  ['WL4T', 'WL4B', null, null, 'WR4E'],
  [null, 'D5/R', null, 'D6/L', null],
  [null, 'D5/L', null, 'D6/R', null],
  ['WL5S', null, null, 'WR5SB', 'WR5ST']
];

const tGrid = [
  ['WL1ST', 'WL1SB', null, null, 'WR1S'],
  [null, 'D1/R', null, 'D2/L', null],
  [null, 'D1/L', null, 'D2/R', null],
  ['WL2E', null, null, 'WR2B', 'WR2T'],
  ['WL3T', 'WL3B', null, null, 'WR3N'],
  [null, 'D3/R', null, 'D4/L', null],
  [null, 'D3/L', null, 'D4/R', null],
  ['WL4N', null, null, 'WR4B', 'WR4T'],
  ['WL5T', 'WL5B', null, null, 'WR5E'],
  [null, 'D5/R', null, 'D6/L', null],
  [null, 'D5/L', null, 'D6/R', null],
  ['WL6S', null, null, 'WR6SB', 'WR6ST']
];

let pendingUpdates = {};
let currentTrain = null;
let trainData = {};

// DOM Elements
const trainSelect = document.getElementById('trainSelect');
const trainNotes = document.getElementById('trainNotes');
const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const summaryCards = document.getElementById('summaryCards');
const refreshBtn = document.getElementById('refreshBtn');
const trainCarriages = document.getElementById('trainCarriages');

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', function() {
  showLoading('Loading application...');
  setTimeout(() => {
    initApp();
    updateUserInfo();
    updateSummaryCards();
    setTimeout(hideLoading, 500);
  }, 100);
});

// Event Listeners
saveBtn.addEventListener('click', saveToDatabase);
refreshBtn.addEventListener('click', () => {
  if (currentTrain) loadFromDatabase(currentTrain);
  updateSummaryCards();
});
trainSelect.addEventListener('change', () => {
  if (trainSelect.value) {
    loadTrain(trainSelect.value);
  } else {
    currentTrain = null;
    trainCarriages.innerHTML = '<div class="no-data-message">Please select a train set to view window status</div>';
    trainNotes.value = '';
    updateSummaryCards();
  }
});
trainNotes.addEventListener('input', () => {
  if (trainData) trainData.notes = trainNotes.value;
});

// Delegate click events on glass items
trainCarriages.addEventListener('click', (e) => {
  const glassItem = e.target.closest('.glass-item');
  if (glassItem) {
    showStatusPopup(glassItem);
  }
});

// ---------- Core Functions ----------
function initApp() {
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select Train --';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  trainSelect.appendChild(defaultOption);

  for (let i = 1; i <= 38; i++) {
    const option = document.createElement('option');
    option.value = `T${String(i).padStart(2, '0')}`;
    option.textContent = option.value;
    trainSelect.appendChild(option);
  }

  currentTrain = null;
  trainCarriages.innerHTML = '<div class="no-data-message">Please select a train set to view window status</div>';
  trainNotes.value = '';
}

function loadTrain(trainId) {
  if (!trainId) return;

  currentTrain = trainId;
  localStorage.setItem('lastTrain', trainId);
  pendingUpdates[trainId] = pendingUpdates[trainId] || {};

  trainData = {
    trainId,
    notes: '',
    timestamp: '',
    carriages: {}
  };

  // Show empty grids initially
  renderAllCarriages(trainId);
  trainNotes.value = '';
  // Update summary to show all-normal for this train (since no data yet)
  updateSummaryCards();

  // Load data from database
  loadFromDatabase(trainId).catch(error => {
    console.log('No existing data found, starting fresh');
  });
}

function renderAllCarriages(trainId) {
  if (!trainId) return;
  const container = trainCarriages;
  container.innerHTML = '';

  const leftCol = ['MC1', 'T1', 'M1'];
  const rightCol = ['MC2', 'T2', 'M2'];

  const leftDiv = document.createElement('div');
  leftDiv.className = 'carriage-column';
  const rightDiv = document.createElement('div');
  rightDiv.className = 'carriage-column';

  leftCol.forEach(carriage => {
    const grid = (carriage === 'MC1' || carriage === 'MC2') ? mcGrid : tGrid;
    leftDiv.appendChild(createCarriageDiv(carriage, grid, trainId));
  });

  rightCol.forEach(carriage => {
    const grid = (carriage === 'MC1' || carriage === 'MC2') ? mcGrid : tGrid;
    rightDiv.appendChild(createCarriageDiv(carriage, grid, trainId));
  });

  container.appendChild(leftDiv);
  container.appendChild(rightDiv);
}

function createCarriageDiv(carriage, grid, trainId) {
  const div = document.createElement('div');
  div.className = 'carriage-block';
  div.innerHTML = `<h3>${carriage}${carriage.includes('MC') ? ' Driver cab & Saloon' : ' Saloon'}</h3>`;

  const gridDiv = document.createElement('div');
  gridDiv.className = 'carriage-glass-grid';

  grid.forEach((row, rowIdx) => {
    row.forEach((glassId, colIdx) => {
      if (glassId) {
        let status = 'normal';
        if (trainData.carriages?.[carriage]?.[glassId]) {
          status = trainData.carriages[carriage][glassId];
        }
        if (pendingUpdates[trainId]?.[carriage]?.[glassId]?.status) {
          status = pendingUpdates[trainId][carriage][glassId].status;
        }
        const cell = document.createElement('div');
        cell.className = `glass-item ${status}`;
        cell.textContent = glassId;
        cell.dataset.glass = glassId;
        cell.dataset.carriage = carriage;
        cell.dataset.train = trainId;
        cell.dataset.col = colIdx + 1;
        gridDiv.appendChild(cell);
      } else {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'empty-cell';
        emptyCell.dataset.col = colIdx + 1;
        gridDiv.appendChild(emptyCell);
      }
    });
  });

  div.appendChild(gridDiv);
  return div;
}

function showStatusPopup(element) {
  if (!currentTrain) return;

  const carriage = element.dataset.carriage;
  const glass = element.dataset.glass;

  // Remove any existing modal
  const oldModal = document.getElementById('glassStatusModal');
  if (oldModal) document.body.removeChild(oldModal);

  const modal = document.createElement('div');
  modal.id = 'glassStatusModal';
  modal.className = 'modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.innerHTML = `
    <h3>Update Status for ${glass}</h3>
    <div class="form-group">
      <label for="statusSelect">Status:</label>
      <select id="statusSelect" class="status-select">
        ${statusOptions.map(opt => 
          `<option value="${opt.value}" ${element.classList.contains(opt.value) ? 'selected' : ''}>
            ${opt.label}
          </option>`
        ).join('')}
      </select>
    </div>
    <div class="form-group" id="repairDateGroup">
      <label for="repairDate">Repair Date:</label>
      <input type="date" id="repairDate" class="date-input">
    </div>
    <div class="modal-buttons">
      <button id="cancelBtn" class="btn btn-secondary">Cancel</button>
      <button id="saveModalBtn" class="btn btn-primary">Save</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');

  const statusSelect = modalContent.querySelector('#statusSelect');
  const repairDateGroup = modalContent.querySelector('#repairDateGroup');
  const repairDateInput = modalContent.querySelector('#repairDate');
  const today = new Date().toISOString().split('T')[0];
  repairDateInput.value = today;
  repairDateGroup.style.display = statusSelect.value === 'repaired' ? 'block' : 'none';

  statusSelect.addEventListener('change', () => {
    repairDateGroup.style.display = statusSelect.value === 'repaired' ? 'block' : 'none';
  });

  modalContent.querySelector('#saveModalBtn').addEventListener('click', () => {
    const status = statusSelect.value;
    const repairDate = status === 'repaired' ? repairDateInput.value : null;
    updateGlassStatus(element, carriage, glass, status, repairDate);
    document.body.classList.remove('modal-open');
    document.body.removeChild(modal);
  });

  modalContent.querySelector('#cancelBtn').addEventListener('click', () => {
    document.body.classList.remove('modal-open');
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.classList.remove('modal-open');
      document.body.removeChild(modal);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.body.classList.remove('modal-open');
      document.body.removeChild(modal);
    }
  });
}

function updateGlassStatus(element, carriage, glass, status, repairDate) {
  if (!pendingUpdates[currentTrain]) pendingUpdates[currentTrain] = {};
  if (!pendingUpdates[currentTrain][carriage]) pendingUpdates[currentTrain][carriage] = {};

  pendingUpdates[currentTrain][carriage][glass] = {
    status,
    repairDate: status === 'repaired' ? repairDate : null,
    timestamp: new Date().toISOString()
  };

  // Update UI element
  element.className = `glass-item ${status}`;
  element.innerHTML = glass;
  if (status === 'repaired' && repairDate) {
    const dateSpan = document.createElement('span');
    dateSpan.className = 'repair-date';
    dateSpan.textContent = repairDate;
    element.appendChild(dateSpan);
  }

  updateSummaryCards();
  localSave();
}

function calculateAllTrainStats() {
  const stats = { normal: 0, damaged: 0, repaired: 0, water: 0 };
  let totalWindows = 0;
  Object.values(carriageGlassConfig).forEach(glasses => totalWindows += glasses.length);

  for (let i = 1; i <= 38; i++) {
    const trainId = `T${String(i).padStart(2, '0')}`;
    const cached = localStorage.getItem(`train_${trainId}`);
    if (!cached) {
      stats.normal += totalWindows;
      continue;
    }
    try {
      const { trainData, pendingUpdates } = JSON.parse(cached);
      ['MC1','T1','M1','M2','T2','MC2'].forEach(carriage => {
        (carriageGlassConfig[carriage] || []).forEach(glass => {
          const status = pendingUpdates?.[trainId]?.[carriage]?.[glass]?.status || 
                         trainData?.carriages?.[carriage]?.[glass] || 'normal';
          stats[status]++;
        });
      });
    } catch (e) {
      stats.normal += totalWindows;
    }
  }
  return stats;
}

function updateSummaryCards() {
  let stats, title;
  if (!currentTrain) {
    stats = calculateAllTrainStats();
    title = "All Train Sets";
  } else {
    stats = { normal: 0, damaged: 0, repaired: 0, water: 0 };
    title = `Train ${currentTrain}`;

    // Iterate over all carriages and all glasses from the grid definitions
    const allCarriages = ['MC1', 'T1', 'M1', 'M2', 'T2', 'MC2'];
    allCarriages.forEach(carriage => {
      const grid = (carriage === 'MC1' || carriage === 'MC2') ? mcGrid : tGrid;
      // Flatten the grid to get all glass IDs (ignore nulls)
      const glassIds = grid.flat().filter(id => id !== null);
      glassIds.forEach(glass => {
        // Determine effective status
        let status = 'normal';
        if (trainData.carriages?.[carriage]?.[glass]) {
          status = trainData.carriages[carriage][glass];
        }
        if (pendingUpdates[currentTrain]?.[carriage]?.[glass]?.status) {
          status = pendingUpdates[currentTrain][carriage][glass].status;
        }
        stats[status]++;
      });
    });
  }

  summaryCards.innerHTML = `
    <div class="summary-card-header"><h2>${title} - Window Status Summary</h2></div>
    <div class="summary-card normal"><h3>Normal Windows</h3><div class="value">${stats.normal}</div></div>
    <div class="summary-card damaged"><h3>Damaged Windows</h3><div class="value">${stats.damaged}</div></div>
    <div class="summary-card repaired"><h3>Repaired Windows</h3><div class="value">${stats.repaired}</div></div>
    <div class="summary-card water"><h3>Water Issues</h3><div class="value">${stats.water}</div></div>
  `;
}

// ---------- Data Management ----------
function localSave() {
  try {
    const payload = { trainData, pendingUpdates };
    localStorage.setItem(`train_${currentTrain}`, JSON.stringify(payload));
  } catch (e) {
    console.error('Local storage save failed', e);
  }
}

async function saveToDatabase() {
  if (!currentTrain) {
    showStatusMessage('No train selected', false);
    return;
  }

  showLoading('Saving to database...');
  try {
    trainData.notes = trainNotes.value || '';
    trainData.timestamp = new Date().toISOString();

    const updatesToSend = {
      trainId: currentTrain,
      notes: trainData.notes,
      updates: pendingUpdates[currentTrain] || {}
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ payload: JSON.stringify(updatesToSend) })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    if (result?.success) {
      Object.entries(pendingUpdates[currentTrain] || {}).forEach(([carriage, glasses]) => {
        if (!trainData.carriages[carriage]) trainData.carriages[carriage] = {};
        Object.entries(glasses).forEach(([glass, { status }]) => {
          trainData.carriages[carriage][glass] = status;
        });
      });
      pendingUpdates[currentTrain] = {};
      showStatusMessage('Data saved successfully', true, 3000);
      localSave();
      updateSummaryCards();
    } else {
      throw new Error(result?.message || 'Server error');
    }
  } catch (error) {
    console.error('Save error:', error);
    showStatusMessage(`Save failed: ${error.message}`, false, 5000);
  } finally {
    hideLoading();
  }
}

async function loadFromDatabase(trainId) {
  if (!trainId) {
    showStatusMessage('No train selected', false);
    return;
  }

  showLoading('Loading data...');
  try {
    const url = `${SCRIPT_URL}?action=load&trainId=${encodeURIComponent(trainId)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    if (result?.success) {
      if (result.data) {
        trainData = { ...trainData, ...result.data };
        trainNotes.value = trainData.notes || '';
        renderAllCarriages(trainId);
        localSave();
        showStatusMessage('Data loaded successfully', true, 3000);
      } else {
        trainData = { trainId, notes: '', timestamp: '', carriages: {} };
        trainNotes.value = '';
        renderAllCarriages(trainId);
        showStatusMessage('No data found for this train', false, 3000);
      }
      // Update summary after data is loaded
      updateSummaryCards();
    } else {
      throw new Error(result?.message || 'Server error');
    }
  } catch (error) {
    console.error('Load error:', error);
    showStatusMessage(`Load failed: ${error.message}`, false, 5000);
  } finally {
    hideLoading();
  }
}

// ---------- UI Utilities ----------
function showLoading(message) {
  loadingText.textContent = message || 'Processing...';
  loadingOverlay.classList.add('show');
}

function hideLoading() {
  loadingOverlay.classList.remove('show');
}

function showStatusMessage(message, isSuccess = true, timeout = 3000) {
  statusMessage.className = `status-message ${isSuccess ? 'status-success' : 'status-error'}`;
  statusMessage.innerHTML = `<i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
  statusMessage.style.display = 'block';
  if (timeout > 0) setTimeout(() => statusMessage.style.display = 'none', timeout);
}

// ---------- User Info ----------
function updateUserInfo() {
  const name = localStorage.getItem('userFullName') || getUrlParameter('name') || 'Maintenance Staff';
  const position = localStorage.getItem('userActualPosition') || getUrlParameter('position') || 'Technician';
  document.getElementById('loggedInName').textContent = name;
  document.getElementById('loggedInPosition').textContent = position;
}

function getUrlParameter(name) {
  name = name.replace(/[[]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}