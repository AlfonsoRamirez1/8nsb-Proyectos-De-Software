/**
 * Ingresos/Egresos Module - Hospital HIS
 */

window.Modules.ingresos = {
  ingresos: [],
  egresos: [],
  historial: [],
  ocupacion: [],
  filteredIngresos: [],
  filteredEgresos: [],
  filteredHistorial: [],
  filteredOcupacion: [],
  medicos: [],
  hospitales: [],
  areas: [],
  habitaciones: [],
  activeTab: 'ingresos',
async init() {
  this.renderLayout();

  await Promise.all([
    this.loadMedicos(),
    this.loadHospitales()
  ]);

  await this.loadData();
},
  renderLayout() {
    const contentArea = document.getElementById("contentArea");
    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="tabs-container" style="display: flex; gap: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; overflow-x: auto;">
          <button id="tabIngresos" class="tab-btn active" style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid var(--primary); font-weight: 600;">Ingresos</button>
          <button id="tabEgresos" class="tab-btn" style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: var(--text-light);">Egresos</button>
          <button id="tabHistorial" class="tab-btn" style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: var(--text-light);">Historial</button>
          <button id="tabOcupacion" class="tab-btn" style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: var(--text-light);">Ocupación</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
          <div style="flex: 1; max-width: 400px;">
            <input type="text" id="ingresosSearch" class="form-group" style="margin-bottom: 0; width: 100%;" placeholder="🔍 Buscar por ID, habitación o médico...">
          </div>
          <button id="addIngresoBtn" class="btn btn-primary">
            <span>+</span> Nuevo Ingreso
          </button>
        </div>
      </div>
      
      <div id="ingresosTableContainer" class="table-container">
        <!-- Table will be rendered here -->
      </div>
    `;

    document.getElementById("tabIngresos").addEventListener("click", () => this.switchTab('ingresos'));
    document.getElementById("tabEgresos").addEventListener("click", () => this.switchTab('egresos'));
    document.getElementById("tabHistorial").addEventListener("click", () => this.switchTab('historial'));
    document.getElementById("tabOcupacion").addEventListener("click", () => this.switchTab('ocupacion'));
    document.getElementById("ingresosSearch").addEventListener("input", (e) => this.filter(e.target.value));
    document.getElementById("addIngresoBtn").addEventListener("click", () => this.showIngresoModal());
  },

  switchTab(tab) {
    this.activeTab = tab;
    const tabs = ['Ingresos', 'Egresos', 'Historial', 'Ocupacion'];
    
    tabs.forEach(t => {
      const btn = document.getElementById(`tab${t}`);
      if (t.toLowerCase() === tab) {
        btn.style.borderBottomColor = 'var(--primary)';
        btn.style.color = 'var(--text)';
        btn.style.fontWeight = '600';
      } else {
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = 'var(--text-light)';
        btn.style.fontWeight = 'normal';
      }
    });

    const addBtn = document.getElementById("addIngresoBtn");
    addBtn.style.display = (tab === 'ingresos') ? 'block' : 'none';

    const searchInput = document.getElementById("ingresosSearch");
    searchInput.style.display = (tab === 'ocupacion') ? 'none' : 'block';

    if (tab === 'ocupacion') {
      this.renderOcupacion();
    } else if (tab === 'historial') {
      this.renderHistorialTable();
    } else {
      this.renderTable();
    }
  },

  async loadMedicos() {
    try {
      const response = await fetch("../api/medicos/listar_medicos.php", { credentials: "include" });
      const res = await response.json();
      if (res.ok) this.medicos = res.data;
    } catch (error) {
      console.error("Error al cargar médicos:", error);
    }
  },

async loadHospitales() {
  try {
    const response = await fetch("../api/hospital/listar_hospital.php", {
      credentials: "include"
    });

    const res = await response.json();

    console.log("Hospitales recibidos:", res);

    if (res.ok) {
      this.hospitales = res.data;
    } else {
      this.hospitales = [];
      UI.toast.show(res.message || "No se pudieron cargar los hospitales", "error");
    }
  } catch (error) {
    console.error("Error al cargar hospitales:", error);
    this.hospitales = [];
  }
},

  async loadAreas(hospitalId) {
    try {
      const response = await fetch(`../api/areas/listar_areas_por_hospital.php?hospital_id=${hospitalId}`, { credentials: "include" });
      const res = await response.json();
      return res.ok ? res.data : [];
    } catch (error) {
      console.error("Error al cargar áreas:", error);
      return [];
    }
  },

async loadHabitacionesPorArea(areaId) {
  try {
    const response = await fetch(`../api/habitaciones/listar_habitaciones.php?area_id=${areaId}`, { 
      credentials: "include" 
    });

    const res = await response.json();
    return res.ok ? res.data : [];
  } catch (error) {
    console.error("Error al cargar habitaciones:", error);
    return [];
  }
},

async loadHabitaciones() {
  try {
    const response = await fetch("../api/habitaciones/listar_habitaciones.php", { credentials: "include" });
    const res = await response.json();
    if (res.ok) this.habitaciones = res.data;
  } catch (error) {
    console.error("Error al cargar habitaciones:", error);
  }
},

  async loadData() {
    try {
      UI.showSkeleton("#ingresosTableContainer");
      
      const [ingRes, egRes, histRes, ocupRes] = await Promise.all([
        fetch("../api/ingresos/listar.php", { credentials: "include" }).then(r => r.json()),
        fetch("../api/egresos/listar_egresos.php", { credentials: "include" }).then(r => r.json()),
        fetch("../api/ingresos/historial.php", { credentials: "include" }).then(r => r.json()),
        fetch("../api/habitaciones/ocupacion.php", { credentials: "include" }).then(r => r.json())
      ]);

      if (ingRes.ok) {
        this.ingresos = ingRes.data;
        this.filteredIngresos = [...this.ingresos];
      }
      if (egRes.ok) {
        this.egresos = egRes.data;
        this.filteredEgresos = [...this.egresos];
      }
      if (histRes.ok) {
        this.historial = histRes.data;
        this.filteredHistorial = [...this.historial];
      }
      if (ocupRes.ok) {
        this.ocupacion = ocupRes.data;
        this.filteredOcupacion = [...this.ocupacion];
      }

      this.switchTab(this.activeTab);
    } catch (error) {
      UI.toast.show("Error al cargar datos", "error");
    }
  },

  renderTable() {
    const container = document.getElementById("ingresosTableContainer");
    const data = this.activeTab === 'ingresos' ? this.filteredIngresos : this.filteredEgresos;
    
    if (data.length === 0) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-light);">No hay registros encontrados.</div>`;
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Habitación</th>
            <th>${this.activeTab === 'ingresos' ? 'Médico' : 'Ingreso ID'}</th>
            <th>Fecha</th>
            <th>Observaciones</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {
      const fecha = this.activeTab === 'ingresos' ? item.FECHAINGRESO : item.FECHAEGRESO;
      const subInfo = this.activeTab === 'ingresos' 
        ? `${item.NOMBRE} ${item.APELLIDOPATERNO}` 
        : `Ingreso #${item.INGRESOS_ID}`;

      html += `
        <tr>
          <td><span style="font-weight: 600; color: var(--primary);">#${item.ID}</span></td>
          <td>
            <div style="font-weight: 600;">${item.NOMBREHABITACION}</div>
            <div style="font-size: 0.75rem; color: var(--text-light);">${item.HOSPITAL_UNI_ORG} - Area ID: ${item.AREAS_ID}</div>
          </td>
          <td>${subInfo}</td>
          <td style="font-size: 0.85rem;">${new Date(fecha).toLocaleString()}</td>
          <td title="${item.OBSERVACIONES || ''}">${(item.OBSERVACIONES || '').substring(0, 30)}${(item.OBSERVACIONES || '').length > 30 ? '...' : ''}</td>
          <td style="text-align: right;">
            ${this.activeTab === 'ingresos' ? `
              <button class="btn btn-secondary btn-sm" title="Registrar Egreso" onclick="Modules.ingresos.showEgresoModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">🚪</button>
              <button class="btn btn-secondary btn-sm" onclick="Modules.ingresos.showIngresoModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">✏️</button>
              <button class="btn btn-secondary btn-sm" onclick="Modules.ingresos.confirmDeleteIngreso(${item.ID}, ${item.HABITACIONES_ID})">🗑️</button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="Modules.ingresos.showEgresoModal(${JSON.stringify(item).replace(/"/g, '&quot;')}, true)">✏️</button>
              <button class="btn btn-secondary btn-sm" onclick="Modules.ingresos.confirmDeleteEgreso(${item.ID}, ${item.HABITACIONES_ID})">🗑️</button>
            `}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  renderHistorialTable() {
    const container = document.getElementById("ingresosTableContainer");
    const data = this.filteredHistorial;
    
    if (data.length === 0) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-light);">No hay registros en el historial.</div>`;
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Ingreso ID</th>
            <th>Habitación / Área</th>
            <th>Médico</th>
            <th>Fecha Ingreso</th>
            <th>Fecha Egreso</th>
            <th>Estancia</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {
      const isAlta = item.ESTADO === 'Alta';
      const badgeStyle = isAlta 
        ? "background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;" 
        : "background: #fef9c3; color: #854d0e; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;";
      
      const estanciaTexto = item.DIAS_ESTANCIA == 0 ? "Menos de 1 día" : `${item.DIAS_ESTANCIA} día(s)`;

      html += `
        <tr>
          <td><span style="font-weight: 600;">#${item.INGRESO_ID}</span></td>
          <td>
            <div style="font-weight: 600;">${item.NOMBREHABITACION}</div>
            <div style="font-size: 0.75rem; color: var(--text-light);">${item.HOSPITAL} - ${item.NOMBREAREA}</div>
          </td>
          <td>Dr. ${item.MEDICO_NOMBRE} ${item.MEDICO_PATERNO}</td>
          <td style="font-size: 0.85rem;">${new Date(item.FECHAINGRESO).toLocaleString()}</td>
          <td style="font-size: 0.85rem;">${item.FECHAEGRESO ? new Date(item.FECHAEGRESO).toLocaleString() : '-'}</td>
          <td>${estanciaTexto}</td>
          <td><span style="${badgeStyle}">${item.ESTADO}</span></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  renderOcupacion() {
    const container = document.getElementById("ingresosTableContainer");
    const data = this.filteredOcupacion;

    if (data.length === 0) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-light);">No se encontraron habitaciones.</div>`;
      return;
    }

    // Agrupar por hospital y área
    const grouped = {};
    data.forEach(h => {
      if (!grouped[h.HOSPITAL]) grouped[h.HOSPITAL] = {};
      if (!grouped[h.HOSPITAL][h.NOMBREAREA]) grouped[h.HOSPITAL][h.NOMBREAREA] = [];
      grouped[h.HOSPITAL][h.NOMBREAREA].push(h);
    });

    let html = '';

    for (const hospital in grouped) {
      html += `<h2 style="margin: 1.5rem 0 1rem; color: var(--text); border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;">🏥 ${hospital}</h2>`;
      
      for (const area in grouped[hospital]) {
        html += `<h3 style="margin: 1rem 0; color: var(--text-light); font-size: 1.1rem;">${area}</h3>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">`;
        
        grouped[hospital][area].forEach(hab => {
          const isOccupied = hab.INGRESO_ACTIVO_ID !== null;
          const bgCard = isOccupied ? '#fef2f2' : '#f0fdf4';
          const borderLeft = isOccupied ? '4px solid var(--danger)' : '4px solid #10b981';
          const statusIcon = isOccupied ? '🛏️' : '✅';
          const statusText = isOccupied ? 'Ocupada' : 'Disponible';

          html += `
            <div class="card" style="background: ${bgCard}; border: none; border-left: ${borderLeft}; padding: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <h4 style="margin: 0; font-size: 1.1rem;">${hab.NOMBREHABITACION}</h4>
                <span title="${statusText}">${statusIcon}</span>
              </div>
              ${isOccupied ? `
                <div style="font-size: 0.85rem; margin-top: 0.5rem; color: #7f1d1d;">
                  <strong>Ingreso:</strong> #${hab.INGRESO_ACTIVO_ID}<br>
                  <strong>Médico:</strong> ${hab.MEDICO_NOMBRE} ${hab.MEDICO_PATERNO}<br>
                  <strong>Desde:</strong> ${new Date(hab.FECHAINGRESO).toLocaleDateString()}<br>
                  <div style="margin-top: 0.25rem;">
                    <span style="background: var(--danger); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">${hab.DIAS_OCUPADA} día(s) ocupada</span>
                  </div>
                </div>
              ` : `
                <div style="font-size: 0.85rem; margin-top: 0.5rem; color: #14532d;">
                  Lista para nuevo ingreso
                </div>
              `}
            </div>
          `;
        });
        
        html += `</div>`; // Close grid
      }
    }

    container.innerHTML = html;
  },

  filter(query) {
    const q = query.toLowerCase();
    if (this.activeTab === 'ingresos') {
      this.filteredIngresos = this.ingresos.filter(i => 
        i.ID.toString().includes(q) || 
        i.NOMBREHABITACION.toLowerCase().includes(q) ||
        `${i.NOMBRE} ${i.APELLIDOPATERNO}`.toLowerCase().includes(q)
      );
    } else if (this.activeTab === 'egresos') {
      this.filteredEgresos = this.egresos.filter(e => 
        e.ID.toString().includes(q) || 
        e.NOMBREHABITACION.toLowerCase().includes(q) ||
        e.INGRESOS_ID.toString().includes(q)
      );
    } else if (this.activeTab === 'historial') {
      this.filteredHistorial = this.historial.filter(h => 
        h.INGRESO_ID.toString().includes(q) || 
        h.NOMBREHABITACION.toLowerCase().includes(q) ||
        `${h.MEDICO_NOMBRE} ${h.MEDICO_PATERNO}`.toLowerCase().includes(q) ||
        h.ESTADO.toLowerCase().includes(q)
      );
    }
    this.switchTab(this.activeTab);
  },

  async showIngresoModal(item = null) {
    const isEdit = item !== null;
    const title = isEdit ? "Editar Ingreso" : "Registrar Nuevo Ingreso";
    
    let medicoOptions = this.medicos.map(m => 
      `<option value="${m.EXPEDIENTE}" ${isEdit && item.MEDICOS_EXPEDIENTE == m.EXPEDIENTE ? 'selected' : ''}>${m.NOMBRE} ${m.APELLIDOPATERNO} (${m.EXPEDIENTE})</option>`
    ).join('');

    let hospitalOptions = this.hospitales.map(h => 
      `<option value="${h.UNI_ORG}" ${isEdit && item.HOSPITAL_UNI_ORG == h.UNI_ORG ? 'selected' : ''}>${h.NOMUO}</option>`
    ).join('');

    const body = `
      <form id="ingresoForm">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label for="i_id">ID de Ingreso</label>
            <input type="number" id="i_id" value="${item ? item.ID : ''}" ${isEdit ? 'readonly' : ''} required>
          </div>
          <div class="form-group">
            <label for="i_tipo">Tipo (Numérico)</label>
            <input type="number" id="i_tipo" value="${item ? item.TIPO : ''}" placeholder="Ej: 1">
          </div>
        </div>

        <div class="form-group">
          <label for="i_hospital">Hospital</label>
          <select id="i_hospital" required ${isEdit ? 'disabled' : ''}>
            <option value="">Seleccione un hospital...</option>
            ${hospitalOptions}
          </select>
        </div>

        <div class="form-group">
          <label for="i_area">Área</label>
          <select id="i_area" required ${isEdit ? 'disabled' : ''}>
            <option value="">Seleccione un área...</option>
          </select>
        </div>

        <div class="form-group">
          <label for="i_habitacion">Habitación</label>
          <select id="i_habitacion" required ${isEdit ? 'disabled' : ''}>
            <option value="">Seleccione una habitación...</option>
          </select>
        </div>

        <div class="form-group">
          <label for="i_medico">Médico Responsable</label>
          <select id="i_medico" required>
            <option value="">Seleccione un médico...</option>
            ${medicoOptions}
          </select>
        </div>

        <div class="form-group">
          <label for="i_fecha">Fecha de Ingreso</label>
          <input type="datetime-local" id="i_fecha" value="${item ? item.FECHAINGRESO.replace(' ', 'T') : new Date().toISOString().slice(0, 16)}">
        </div>

        <div class="form-group">
          <label for="i_obs">Observaciones</label>
          <textarea id="i_obs" rows="3">${item ? item.OBSERVACIONES : ''}</textarea>
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="saveIngresoBtn">${isEdit ? 'Actualizar' : 'Guardar Ingreso'}</button>
    `;

    UI.modal.show(title, body, footer);

    const hSelect = document.getElementById("i_hospital");
    const aSelect = document.getElementById("i_area");
    const habSelect = document.getElementById("i_habitacion");

   hSelect.addEventListener("change", async () => {
  const hId = hSelect.value;

  console.log("Hospital seleccionado:", hId);

  aSelect.innerHTML = '<option value="">Cargando áreas...</option>';
  habSelect.innerHTML = '<option value="">Seleccione una habitación...</option>';

  if (hId) {
    const areas = await this.loadAreas(hId);

    console.log("Áreas recibidas:", areas);

    aSelect.innerHTML = '<option value="">Seleccione un área...</option>' +
      areas.map(a => `<option value="${a.ID}">${a.NOMBREAREA}</option>`).join('');
  } else {
    aSelect.innerHTML = '<option value="">Seleccione un área...</option>';
  }
});

aSelect.addEventListener("change", async () => {
  const aId = aSelect.value;

  console.log("Área seleccionada:", aId);

  habSelect.innerHTML = '<option value="">Cargando habitaciones...</option>';

  if (aId) {
    const habs = await this.loadHabitacionesPorArea(aId);

    console.log("Habitaciones recibidas:", habs);

    habSelect.innerHTML = '<option value="">Seleccione una habitación...</option>' +
      habs.map(h => `<option value="${h.ID}">${h.NOMBREHABITACION}</option>`).join('');
  } else {
    habSelect.innerHTML = '<option value="">Seleccione una habitación...</option>';
  }
});

    // Si es edición, cargar los datos en cascada
    if (isEdit) {
      // Cargar Áreas
      const areas = await this.loadAreas(item.HOSPITAL_UNI_ORG);
      aSelect.innerHTML = '<option value="">Seleccione un área...</option>' + 
        areas.map(a => `<option value="${a.ID}" ${item.AREAS_ID == a.ID ? 'selected' : ''}>${a.NOMBREAREA}</option>`).join('');
      
      // Cargar Habitaciones
      const habs = await this.loadHabitacionesPorArea(item.AREAS_ID);
      habSelect.innerHTML = '<option value="">Seleccione una habitación...</option>' + 
        habs.map(h => `<option value="${h.ID}" ${item.HABITACIONES_ID == h.ID ? 'selected' : ''}>${h.NOMBREHABITACION}</option>`).join('');
    }

    document.getElementById("saveIngresoBtn").addEventListener("click", () => this.saveIngreso(isEdit));
  },

  async saveIngreso(isEdit) {
    const data = {
      id: document.getElementById("i_id").value,
      tipo: document.getElementById("i_tipo").value,
      habitacionesId: document.getElementById("i_habitacion").value,
      medicosExpediente: document.getElementById("i_medico").value,
      fechaIngreso: document.getElementById("i_fecha").value.replace('T', ' '),
      observaciones: document.getElementById("i_obs").value
    };

    if (!data.id || !data.habitacionesId || !data.medicosExpediente) {
      UI.toast.show("ID, habitación y médico son obligatorios", "warning");
      return;
    }

    const endpoint = isEdit ? "editar.php" : "insertar.php";
    
    try {
      const response = await fetch(`../api/ingresos/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });

      const res = await response.json();
      if (res.ok) {
        UI.toast.show(res.message, "success");
        UI.modal.close();
        this.loadData();
      } else {
        UI.toast.show(res.message, "error");
      }
    } catch (error) {
      UI.toast.show("Error al guardar", "error");
    }
  },

showEgresoModal(item, isEditingEgres = false) {
  const title = isEditingEgres ? "Editar Egreso" : "Registrar Egreso";
  
  let habOptions = `
    <option value="${item.HABITACIONES_ID}" selected>
      ${item.NOMBREHABITACION || `Habitación #${item.HABITACIONES_ID}`}
    </option>
  `;

  const body = `
    <form id="egresoForm">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        ${isEditingEgres ? `
        <div class="form-group">
          <label for="e_id">ID de Egreso</label>
          <input type="number" id="e_id" value="${item.ID}" readonly>
        </div>` : ''}
        <div class="form-group" ${!isEditingEgres ? 'style="grid-column: span 2;"' : ''}>
          <label for="e_ingreso_id">ID de Ingreso</label>
          <input type="number" id="e_ingreso_id" value="${isEditingEgres ? item.INGRESOS_ID : item.ID}" readonly required>
        </div>
      </div>

      <div class="form-group">
        <label for="e_habitacion">Habitación</label>
        <select id="e_habitacion" required style="pointer-events: none; background: #f3f4f6;">
          ${habOptions}
        </select>
      </div>

      <div class="form-group">
        <label for="e_tipo">Tipo (Numérico)</label>
        <input type="number" id="e_tipo" value="${item ? item.TIPO : ''}">
      </div>

      <div class="form-group">
        <label for="e_fecha">Fecha de Egreso</label>
        <input type="datetime-local" id="e_fecha" value="${isEditingEgres ? item.FECHAEGRESO.replace(' ', 'T') : new Date().toISOString().slice(0, 16)}">
      </div>

      <div class="form-group">
        <label for="e_obs">Observaciones</label>
        <textarea id="e_obs" rows="3">${item ? item.OBSERVACIONES : ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="saveEgresoBtn">Guardar Egreso</button>
  `;

  UI.modal.show(title, body, footer);
  document.getElementById("saveEgresoBtn").addEventListener("click", () => this.saveEgreso(isEditingEgres));
},

  async saveEgreso(isEdit) {
    const data = {
      ingresosId: document.getElementById("e_ingreso_id").value,
      habitacionesId: document.getElementById("e_habitacion").value || document.querySelector("#e_habitacion option")?.value,
      tipo: document.getElementById("e_tipo").value,
      fechaEgreso: document.getElementById("e_fecha").value.replace('T', ' '),
      observaciones: document.getElementById("e_obs").value
    };

    if (isEdit) {
      data.id = document.getElementById("e_id").value;
    }

    if (!data.ingresosId || !data.habitacionesId) {
      UI.toast.show("Ingreso y habitación son obligatorios", "warning");
      return;
    }

    if (isEdit && !data.id) {
      UI.toast.show("ID de egreso es obligatorio para editar", "warning");
      return;
    }

    const endpoint = isEdit ? "editar_egresos.php" : "insertar_egresos.php";
    
    try {
      const response = await fetch(`../api/egresos/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });

      const res = await response.json();
      if (res.ok) {
        UI.toast.show(res.message, "success");
        UI.modal.close();
        this.loadData();
      } else {
        UI.toast.show(res.message, "error");
      }
    } catch (error) {
      UI.toast.show("Error al guardar egreso", "error");
    }
  },

  confirmDeleteIngreso(id, habId) {
    UI.modal.show(
      "Confirmar Eliminación",
      `<p>¿Estás seguro de eliminar el ingreso <strong>#${id}</strong> de la habitación <strong>#${habId}</strong>?</p>`,
      `
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" onclick="Modules.ingresos.deleteIngreso(${id}, ${habId})">Eliminar</button>
      `
    );
  },

async deleteIngreso(id, habId) {
  try {
    const response = await fetch("../api/ingresos/eliminar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: id, 
        habitacionesId: habId 
      }),
      credentials: "include"
    });

    const res = await response.json();

    if (res.ok) {
      UI.toast.show(res.message, "success");
      UI.modal.close();
      this.loadData();
    } else {
      UI.toast.show(res.message, "error");
    }
  } catch (error) {
    UI.toast.show("Error al eliminar", "error");
  }
},

  confirmDeleteEgreso(id, habId) {
    UI.modal.show(
      "Confirmar Eliminación",
      `<p>¿Estás seguro de eliminar el egreso <strong>#${id}</strong>?</p>`,
      `
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" onclick="Modules.ingresos.deleteEgreso(${id}, ${habId})">Eliminar</button>
      `
    );
  },

  async deleteEgreso(id, habId) {
    try {
      const response = await fetch("../api/egresos/eliminar_egresos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, habitacionesId: habId }),
        credentials: "include"
      });
      const res = await response.json();
      if (res.ok) {
        UI.toast.show(res.message, "success");
        UI.modal.close();
        this.loadData();
      } else {
        UI.toast.show(res.message, "error");
      }
    } catch (error) {
      UI.toast.show("Error al eliminar", "error");
    }
  }
};
