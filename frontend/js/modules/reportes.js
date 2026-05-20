/**
 * Reportes Module - Hospital HIS
 * Centralized reporting module with sub-sections
 */

window.Modules.reportes = {
  currentView: 'menu', // 'menu', 'urgencias', 'estudios', 'procedimientos'
  hospitales: [],
  quirofanos: [],
  tiposProcedimiento: [],
  selectedHospital: '',
  selectedQuirofano: '',
  selectedTipoAtencion: '',
  selectedTipoProcedimiento: '',
  selectedFechaDesde: '',
  selectedFechaHasta: '',
  selectedEspecialidad: '',

  async init() {
    await this.loadHospitales();
    this.showMenu();
  },

  async loadHospitales() {
    try {
      const response = await fetch("../api/hospital/listar_hospital.php", { credentials: "include" });
      const res = await response.json();
      if (res.ok) this.hospitales = res.data;
    } catch (error) {
      console.error("Error al cargar hospitales:", error);
    }
  },

  showMenu() {
    this.currentView = 'menu';
    const contentArea = document.getElementById("contentArea");
    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 2rem;">
        <h2>📊 Panel de Reportes</h2>
        <p style="color: var(--text-light);">Selecciona el tipo de reporte que deseas visualizar.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <!-- Card Urgencias -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid var(--primary);" onclick="Modules.reportes.loadUrgenciasView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🚑</div>
          <h3>Reporte de Urgencias</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Estadísticas de ingresos, egresos y ocupación en tiempo real del área de urgencias.
          </p>
          <div style="margin-top: 1.5rem; color: var(--primary); font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>

        <!-- Card Estudios -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid #8b5cf6;" onclick="Modules.reportes.loadEstudiosView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🧪</div>
          <h3>Reporte de Estudios</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Resumen de estudios paraclínicos realizados por laboratorio y tipo (Rayos X, Sangre, etc).
          </p>
          <div style="margin-top: 1.5rem; color: #8b5cf6; font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>

        <!-- REPORTE 1: Medicina General -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid #3b82f6;" onclick="Modules.reportes.loadMedicinaGeneralView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🩺</div>
          <h3>Consultas Medicina General</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Número de consultas de medicina general o familiar por médico en consultorio.
          </p>
          <div style="margin-top: 1.5rem; color: #3b82f6; font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>

        <!-- REPORTE 2: Especialistas -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid #10b981;" onclick="Modules.reportes.loadConsultasEspecialistasView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">👨‍⚕️</div>
          <h3>Consultas de Especialistas</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Número de consultas de médicos especialistas por especialidad y consultorio.
          </p>
          <div style="margin-top: 1.5rem; color: #10b981; font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>

        <!-- REPORTE 3: Otros Consultorios -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid var(--secondary);" onclick="Modules.reportes.loadOtrosConsultoriosView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🏢</div>
          <h3>Otros Consultorios</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Consultas o procedimientos de otros consultorios no incluidos anteriormente por tipo.
          </p>
          <div style="margin-top: 1.5rem; color: var(--secondary); font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>

        <!-- REPORTE 4: Ingresos/Egresos Hospitalarios -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid #f59e0b;" onclick="Modules.reportes.loadIngresosEgresosHospView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🚪</div>
          <h3>Ingresos y Egresos Hosp.</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Número de ingresos y egresos incluyendo piso general y servicios (UCI, UCIN, etc).
          </p>
          <div style="margin-top: 1.5rem; color: #f59e0b; font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>

        <!-- REPORTE 5: Quirófanos -->
        <div class="card report-card" style="cursor: pointer; transition: var(--transition); border-top: 4px solid var(--primary);" onclick="Modules.reportes.loadProcedimientosView()">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🔪</div>
          <h3>Partos y Cirugías</h3>
          <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
            Número de partos, cirugías y otros procedimientos realizados en los quirófanos.
          </p>
          <div style="margin-top: 1.5rem; color: var(--primary); font-weight: 600; font-size: 0.85rem;">
            Ver reporte →
          </div>
        </div>
      </div>
    `;
  },

  async loadUrgenciasView() {
    this.currentView = 'urgencias';
    this.renderViewWithFilter('🚑 Reporte Detallado de Urgencias', 'refreshUrgenciasBtn');
    document.getElementById("refreshUrgenciasBtn").addEventListener("click", () => this.fetchUrgenciasData());
    this.fetchUrgenciasData();
  },

  async loadEstudiosView() {
    this.currentView = 'estudios';
    this.renderViewWithFilter('🧪 Reporte de Estudios Paraclínicos', 'refreshEstudiosBtn');
    document.getElementById("refreshEstudiosBtn").addEventListener("click", () => this.fetchEstudiosData());
    this.fetchEstudiosData();
  },

  async loadMedicinaGeneralView() {
    this.currentView = 'medicina_general';
    const contentArea = document.getElementById("contentArea");

    const hospitalOptions = this.hospitales.map(h =>
      `<option value="${h.UNI_ORG}" ${this.selectedHospital === h.UNI_ORG ? 'selected' : ''}>${h.NOMUO}</option>`
    ).join('');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <button class="btn btn-secondary" style="margin-bottom: 0.5rem;" onclick="Modules.reportes.showMenu()">← Volver al Menú</button>
            <h2>🩺 Reporte de Medicina General / Familiar</h2>
          </div>
          <button id="refreshMedGenBtn" class="btn btn-primary">🔄 Actualizar Datos</button>
        </div>

        <div style="background: var(--background); padding: 1rem; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label for="filterHospitalMed" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hospital:</label>
            <select id="filterHospitalMed" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los hospitales</option>
              ${hospitalOptions}
            </select>
          </div>

          <div>
            <label for="filterFechaDesdeMed" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Desde:</label>
            <input type="date" id="filterFechaDesdeMed" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaDesde}" />
          </div>

          <div>
            <label for="filterFechaHastaMed" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hasta:</label>
            <input type="date" id="filterFechaHastaMed" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaHasta}" />
          </div>
        </div>
      </div>

      <div id="reportDataContainer">
        <p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>
      </div>
    `;

    document.getElementById("refreshMedGenBtn").addEventListener("click", () => this.fetchMedicinaGeneralData());
    document.getElementById("filterHospitalMed").addEventListener("change", (e) => {
      this.selectedHospital = e.target.value;
      this.fetchMedicinaGeneralData();
    });
    document.getElementById("filterFechaDesdeMed").addEventListener("change", (e) => {
      this.selectedFechaDesde = e.target.value;
      this.fetchMedicinaGeneralData();
    });
    document.getElementById("filterFechaHastaMed").addEventListener("change", (e) => {
      this.selectedFechaHasta = e.target.value;
      this.fetchMedicinaGeneralData();
    });

    this.fetchMedicinaGeneralData();
  },

  async fetchMedicinaGeneralData() {
    const container = document.getElementById("reportDataContainer");
    const hospital = this.selectedHospital || '';
    const fechaDesde = this.selectedFechaDesde || '';
    const fechaHasta = this.selectedFechaHasta || '';

    container.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>`;

    try {
      const params = new URLSearchParams({
        hospital_id: hospital,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const url = `../api/reportes/medicina_general.php?${params.toString()}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        this.renderMedicinaGeneralStats(res.data);
      } else {
        UI.toast.show(res.message, "error");
        container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">${res.message}</p>`;
      }
    } catch (error) {
      UI.toast.show("Error al cargar datos del reporte", "error");
      container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">Ocurrió un error de conexión con la base de datos.</p>`;
    }
  },

  renderMedicinaGeneralStats(data) {
    const container = document.getElementById("reportDataContainer");
    const { resumen, registros, total } = data;

    let resumenHtml = resumen.map(r => `
      <div class="card" style="background: var(--background); border: none; border-left: 4px solid #3b82f6;">
        <h4 style="color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">Dr. ${r.NOMBRE} ${r.APELLIDOPATERNO}</h4>
        <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem;">${r.CONSULTORIO}</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${r.total_consultas} <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-light);">consultas</span></div>
      </div>
    `).join('');

    if (resumen.length === 0) {
      resumenHtml = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No hay consultas registradas para los filtros seleccionados.</p>';
    }

    let rows = registros.map(r => `
      <tr>
        <td>${new Date(r.FECHACONSULTA).toLocaleString()}</td>
        <td>Dr. ${r.MEDICO_NOMBRE} ${r.MEDICO_PATERNO}</td>
        <td>${r.NOMBRECONSULTORIO}</td>
        <td><span class="badge" style="background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">${r.TIPOCONSULTA}</span></td>
      </tr>
    `).join('');

    if (registros.length === 0) {
      rows = '<tr><td colspan="4" style="text-align: center; color: var(--text-light); padding: 2rem;">No hay registros detallados</td></tr>';
    }

    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--secondary); margin-bottom: 1.5rem;">
        <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Total de Consultas Medicina General</h3>
        <div style="font-size: 2.5rem; font-weight: 700; color: var(--secondary); margin: 0.5rem 0;">${total}</div>
      </div>

      <h3 style="margin-bottom: 1rem;">👨‍⚕️ Resumen por Médico y Consultorio</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        ${resumenHtml}
      </div>

      <div class="card">
        <h3>📋 Detalle de Consultas Individuales</h3>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Médico</th>
                <th>Consultorio</th>
                <th>Tipo Atención</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async loadIngresosEgresosHospView() {
    this.currentView = 'ingresos_egresos_hosp';
    const contentArea = document.getElementById("contentArea");

    const hospitalOptions = this.hospitales.map(h =>
      `<option value="${h.UNI_ORG}" ${this.selectedHospital === h.UNI_ORG ? 'selected' : ''}>${h.NOMUO}</option>`
    ).join('');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <button class="btn btn-secondary" style="margin-bottom: 0.5rem;" onclick="Modules.reportes.showMenu()">← Volver al Menú</button>
            <h2>🚪 Reporte de Ingresos y Egresos Hospitalarios</h2>
          </div>
          <div>
            <button id="refreshHospBtn" class="btn btn-primary">🔄 Actualizar Datos</button>
            <button id="exportCsvBtn" class="btn btn-secondary" style="margin-left: 0.5rem; display: none;">📥 Exportar CSV</button>
          </div>
        </div>

        <div style="background: var(--background); padding: 1rem; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label for="filterHospitalHosp" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hospital:</label>
            <select id="filterHospitalHosp" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los hospitales</option>
              ${hospitalOptions}
            </select>
          </div>

          <div>
            <label for="filterFechaDesdeHosp" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Desde:</label>
            <input type="date" id="filterFechaDesdeHosp" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaDesde}" />
          </div>

          <div>
            <label for="filterFechaHastaHosp" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hasta:</label>
            <input type="date" id="filterFechaHastaHosp" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaHasta}" />
          </div>
        </div>
      </div>

      <div id="reportDataContainer">
        <p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>
      </div>
    `;

    document.getElementById("refreshHospBtn").addEventListener("click", () => this.fetchIngresosEgresosHospData());
    document.getElementById("exportCsvBtn").addEventListener("click", () => this.exportarCSV());
    document.getElementById("filterHospitalHosp").addEventListener("change", (e) => {
      this.selectedHospital = e.target.value;
      this.fetchIngresosEgresosHospData();
    });
    document.getElementById("filterFechaDesdeHosp").addEventListener("change", (e) => {
      this.selectedFechaDesde = e.target.value;
      this.fetchIngresosEgresosHospData();
    });
    document.getElementById("filterFechaHastaHosp").addEventListener("change", (e) => {
      this.selectedFechaHasta = e.target.value;
      this.fetchIngresosEgresosHospData();
    });

    this.fetchIngresosEgresosHospData();
  },

  async fetchIngresosEgresosHospData() {
    const container = document.getElementById("reportDataContainer");
    const hospital = this.selectedHospital || '';
    const fechaDesde = this.selectedFechaDesde || '';
    const fechaHasta = this.selectedFechaHasta || '';

    container.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>`;

    try {
      const params = new URLSearchParams({
        hospital_id: hospital,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const url = `../api/reportes/ingresos_egresos_hospital.php?${params.toString()}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        this.currentHospData = res.data;
        document.getElementById("exportCsvBtn").style.display = 'inline-block';
        this.renderIngresosEgresosHospStats(res.data);
      } else {
        UI.toast.show(res.message, "error");
        container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">${res.message}</p>`;
      }
    } catch (error) {
      UI.toast.show("Error al cargar datos del reporte", "error");
      container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">Ocurrió un error de conexión con la base de datos.</p>`;
    }
  },

  renderIngresosEgresosHospStats(data) {
    const container = document.getElementById("reportDataContainer");
    const { ingresos_por_area, egresos_por_area, registros, ocupacion_actual } = data;

    let resumenIngresosHtml = ingresos_por_area.map(r => `
      <div class="card" style="background: var(--background); border: none; border-left: 4px solid var(--primary);">
        <h4 style="color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">${r.NOMBREAREA}</h4>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${r.total_ingresos} <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-light);">ingresos</span></div>
      </div>
    `).join('');

    let resumenEgresosHtml = egresos_por_area.map(r => `
      <div class="card" style="background: var(--background); border: none; border-left: 4px solid var(--danger);">
        <h4 style="color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">${r.NOMBREAREA}</h4>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">${r.total_egresos} <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-light);">egresos</span></div>
      </div>
    `).join('');

    let resumenOcupacionHtml = (ocupacion_actual || []).map(r => `
      <div class="card" style="background: var(--background); border: none; border-left: 4px solid #10b981;">
        <h4 style="color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">${r.NOMBREAREA}</h4>
        <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${r.total_ocupacion} <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-light);">ocupadas</span></div>
      </div>
    `).join('');

    let rows = registros.map(r => {
      const badge = r.TIPO_MOV === 'Ingreso' 
        ? '<span style="color: var(--primary); background: #eff6ff; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">Ingreso</span>'
        : '<span style="color: var(--danger); background: #fef2f2; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">Egreso</span>';
      
      return `
        <tr>
          <td>${badge}</td>
          <td>${new Date(r.FECHA).toLocaleString()}</td>
          <td>${r.NOMBREAREA}</td>
          <td><strong>${r.NOMBREHABITACION}</strong></td>
        </tr>
      `;
    }).join('');

    if (registros.length === 0) {
      rows = '<tr><td colspan="4" style="text-align: center; color: var(--text-light); padding: 2rem;">No hay movimientos registrados</td></tr>';
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h3 style="margin-bottom: 1rem;">📈 Ingresos por Área</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            ${resumenIngresosHtml || '<p style="color: var(--text-light);">Sin ingresos registrados.</p>'}
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">📉 Egresos por Área</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            ${resumenEgresosHtml || '<p style="color: var(--text-light);">Sin egresos registrados.</p>'}
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">🛏️ Ocupación Actual</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            ${resumenOcupacionHtml || '<p style="color: var(--text-light);">No hay habitaciones ocupadas.</p>'}
          </div>
        </div>
      </div>

      <div class="card">
        <h3>📋 Historial de Movimientos</h3>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Área / Servicio</th>
                <th>Habitación</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  exportarCSV() {
    if (!this.currentHospData || !this.currentHospData.registros || this.currentHospData.registros.length === 0) {
      UI.toast.show("No hay datos para exportar", "warning");
      return;
    }

    const registros = this.currentHospData.registros;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Encabezados
    csvContent += "Tipo Movimiento,Fecha,Área,Habitación\n";

    // Filas
    registros.forEach(r => {
      const tipo = r.TIPO_MOV;
      const fecha = r.FECHA;
      const area = `"${r.NOMBREAREA}"`;
      const habitacion = `"${r.NOMBREHABITACION}"`;
      
      csvContent += `${tipo},${fecha},${area},${habitacion}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async loadOtrosConsultoriosView() {
    this.currentView = 'otros_consultorios';
    const contentArea = document.getElementById("contentArea");

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <button class="btn btn-secondary" style="margin-bottom: 0.5rem;" onclick="Modules.reportes.showMenu()">← Volver al Menú</button>
            <h2>🏢 Reporte de Otros Consultorios</h2>
          </div>
          <button id="refreshOtrosBtn" class="btn btn-primary">🔄 Actualizar Datos</button>
        </div>

        <div style="background: var(--background); padding: 1rem; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">

          <div>
            <label for="filterServicio" style="font-weight: 600; font-size: 0.9rem; display:block; margin-bottom:0.5rem;">Tipo de Servicio:</label>
            <select id="filterServicio" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los servicios</option>
            </select>
          </div>

          <div>
            <label for="filterConsultorio" style="font-weight: 600; font-size: 0.9rem; display:block; margin-bottom:0.5rem;">Consultorio:</label>
            <select id="filterConsultorio" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los consultorios</option>
            </select>
          </div>

          <div>
            <label for="filterAtencion" style="font-weight: 600; font-size: 0.9rem; display:block; margin-bottom:0.5rem;">Tipo de Atención:</label>
            <select id="filterAtencion" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todas</option>
              <option value="Primera Vez">Primera Vez</option>
              <option value="Subsecuente">Subsecuente</option>
            </select>
          </div>

        </div>
      </div>

      <div id="reportDataContainer">
        <p style="text-align: center; color: var(--text-light); padding: 3rem;">Presiona Actualizar Datos para cargar.</p>
      </div>
    `;

    document.getElementById("refreshOtrosBtn").addEventListener("click", () => this.fetchOtrosConsultoriosData());
    document.getElementById("filterServicio").addEventListener("change", () => this.fetchOtrosConsultoriosData());
    document.getElementById("filterConsultorio").addEventListener("change", () => this.fetchOtrosConsultoriosData());
    document.getElementById("filterAtencion").addEventListener("change", () => this.fetchOtrosConsultoriosData());

    this.loadCatalogosOtrosConsultorios();
    this.fetchOtrosConsultoriosData();
  },

  async loadCatalogosOtrosConsultorios() {
    try {
      const resServicios = await fetch("../api/tipos_servicios/listar_tipos_servicios.php?exclude_id=1", { credentials: "include" });
      const dataServicios = await resServicios.json();

      if (dataServicios.ok) {
        const filterServicio = document.getElementById("filterServicio");
        dataServicios.data.forEach(ts => {
          filterServicio.innerHTML += `<option value="${ts.ID}">${ts.NOMBRESERVICIO}</option>`;
        });
      }

      const resConsultorios = await fetch("../api/consultorios/listar_consultorios.php", { credentials: "include" });
      const dataConsultorios = await resConsultorios.json();

      if (dataConsultorios.ok) {
        const filterConsultorio = document.getElementById("filterConsultorio");
        dataConsultorios.data.forEach(c => {
          filterConsultorio.innerHTML += `<option value="${c.ID}">${c.CONSULTORIO}</option>`;
        });
      }

    } catch (error) {
      console.error("Error al cargar catálogos en reportes", error);
    }
  },

  async fetchOtrosConsultoriosData() {
    const container = document.getElementById("reportDataContainer");
    const srv = document.getElementById("filterServicio").value;
    const cons = document.getElementById("filterConsultorio").value;
    const aten = document.getElementById("filterAtencion").value;

    container.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>`;

    try {
      const url = `../api/reportes/otros_consultorios.php?hospital_id=${this.selectedHospital}&servicio_id=${srv}&consultorio_id=${cons}&atencion=${aten}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        let rows = res.data.registros.map(r => `
          <tr>
            <td>${new Date(r.FECHACONSULTA).toLocaleString()}</td>
            <td><strong>${r.NOMBRESERVICIO}</strong></td>
            <td>${r.NOMBRECONSULTORIO}</td>
            <td>Dr. ${r.MEDICO_NOMBRE} ${r.MEDICO_PATERNO}</td>
            <td><span class="badge" style="background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">${r.TIPOCONSULTA}</span></td>
          </tr>
        `).join('');

        if (res.data.registros.length === 0) {
          rows = '<tr><td colspan="5" style="text-align: center; color: var(--text-light); padding: 2rem;">No hay registros con los filtros seleccionados</td></tr>';
        }

        container.innerHTML = `
          <div class="card" style="border-left: 4px solid var(--secondary); margin-bottom: 2rem;">
            <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Total de Consultas / Procedimientos</h3>
            <div style="font-size: 2.5rem; font-weight: 700; color: var(--secondary); margin: 0.5rem 0;">${res.data.total}</div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo Servicio</th>
                    <th>Consultorio</th>
                    <th>Médico</th>
                    <th>Tipo Atención</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        UI.toast.show(res.message, "error");
      }
    } catch (error) {
      UI.toast.show("Error al cargar datos del reporte", "error");
      container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">Ocurrió un error de conexión con la base de datos.</p>`;
    }
  },

  renderViewWithFilter(title, btnId) {
    const contentArea = document.getElementById("contentArea");
    let hospitalOptions = this.hospitales.map(h =>
      `<option value="${h.UNI_ORG}" ${this.selectedHospital === h.UNI_ORG ? 'selected' : ''}>${h.NOMUO}</option>`
    ).join('');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <button class="btn btn-secondary" style="margin-bottom: 0.5rem;" onclick="Modules.reportes.showMenu()">← Volver al Menú</button>
            <h2>${title}</h2>
          </div>
          <button id="${btnId}" class="btn btn-primary">🔄 Actualizar Datos</button>
        </div>

        <div style="background: var(--background); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem;">
          <label for="filterHospital" style="font-weight: 600; font-size: 0.9rem;">Filtrar por Hospital:</label>
          <select id="filterHospital" class="form-group" style="margin-bottom: 0; width: auto; min-width: 250px;">
            <option value="">Todos los hospitales</option>
            ${hospitalOptions}
          </select>
        </div>
      </div>

      <div id="reportDataContainer">
        <p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos del reporte...</p>
      </div>
    `;

    document.getElementById("filterHospital").addEventListener("change", (e) => {
      this.selectedHospital = e.target.value;
      if (this.currentView === 'urgencias') this.fetchUrgenciasData();
      if (this.currentView === 'estudios') this.fetchEstudiosData();
    });
  },

  async fetchUrgenciasData() {
    try {
      const url = `../api/reportes/urgencias.php?hospital_id=${this.selectedHospital}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        this.renderUrgenciasStats(res.data);
      } else {
        UI.toast.show(res.message, "error");
      }
    } catch (error) {
      UI.toast.show("Error al conectar con la API", "error");
    }
  },

  renderUrgenciasStats(data) {
    const container = document.getElementById("reportDataContainer");
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="card" style="border-left: 4px solid var(--primary);">
          <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Ingresos Totales</h3>
          <div id="statIngresos" style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin: 0.5rem 0;">${data.ingresos}</div>
        </div>

        <div class="card" style="border-left: 4px solid var(--danger);">
          <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Egresos Totales</h3>
          <div id="statEgresos" style="font-size: 2.5rem; font-weight: 700; color: var(--danger); margin: 0.5rem 0;">${data.egresos}</div>
        </div>

        <div class="card" style="border-left: 4px solid #10b981;">
          <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Pacientes en Área</h3>
          <div id="statActivos" style="font-size: 2.5rem; font-weight: 700; color: #10b981; margin: 0.5rem 0;">${Math.max(0, data.ingresos - data.egresos)}</div>
        </div>
      </div>

      <div class="card">
        <h3>🕒 Últimos Movimientos (Urgencias)</h3>
        <div id="urgRecientesTable" class="table-container" style="margin-top: 1rem;"></div>
      </div>
    `;
    this.renderUrgenciasTable(data.recientes);
  },

  async fetchEstudiosData() {
    try {
      const url = `../api/reportes/estudios.php?hospital_id=${this.selectedHospital}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        this.renderEstudiosStats(res.data);
      } else {
        UI.toast.show(res.message, "error");
      }
    } catch (error) {
      UI.toast.show("Error al conectar con la API", "error");
    }
  },

  renderEstudiosStats(data) {
    const container = document.getElementById("reportDataContainer");

    let resumenHtml = data.resumen.map(r => `
      <div class="card" style="background: var(--background); border: none;">
        <h4 style="color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">${r.NOMBRELABORATORIO}</h4>
        <div style="font-size: 1.5rem; font-weight: 700; color: #8b5cf6;">${r.total_estudios} <span style="font-size: 0.9rem; font-weight: 400;">estudios</span></div>
      </div>
    `).join('');

    if (data.resumen.length === 0) {
      resumenHtml = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No hay estudios registrados.</p>';
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        ${resumenHtml}
      </div>

      <div class="card">
        <h3>📊 Desglose Detallado por Tipo de Estudio</h3>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Laboratorio / Depto</th>
                <th>Área Relacionada</th>
                <th>Tipo de Estudio</th>
                <th style="text-align: center;">Total Realizados</th>
              </tr>
            </thead>
            <tbody>
              ${data.detallado.map(d => `
                <tr>
                  <td><strong>${d.NOMBRELABORATORIO}</strong></td>
                  <td>${d.NOMBREAREA}</td>
                  <td>${d.NOMBREESTUDIO}</td>
                  <td style="text-align: center;"><span class="badge" style="background: #ede9fe; color: #8b5cf6; padding: 4px 12px;">${d.total}</span></td>
                </tr>
              `).join('')}
              ${data.detallado.length === 0 ? '<tr><td colspan="4" style="text-align: center;">Sin datos</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderUrgenciasTable(data) {
    const container = document.getElementById("urgRecientesTable");
    if (!data || data.length === 0) {
      container.innerHTML = `<p style="padding: 2rem; text-align: center; color: var(--text-light);">No hay movimientos registrados.</p>`;
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Fecha y Hora</th>
            <th>Habitación</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {
      const badge = item.tipo_mov === 'Ingreso'
        ? '<span style="color: var(--primary); background: #eff6ff; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">Ingreso</span>'
        : '<span style="color: var(--danger); background: #fef2f2; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">Egreso</span>';

      html += `
        <tr>
          <td>${badge}</td>
          <td>${new Date(item.fecha).toLocaleString()}</td>
          <td><strong>${item.NOMBREHABITACION}</strong></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  async loadProcedimientosView() {
    this.currentView = 'procedimientos';
    const contentArea = document.getElementById("contentArea");

    const hospitalOptions = this.hospitales.map(h =>
      `<option value="${h.UNI_ORG}" ${this.selectedHospital === h.UNI_ORG ? 'selected' : ''}>${h.NOMUO}</option>`
    ).join('');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <button class="btn btn-secondary" style="margin-bottom: 0.5rem;" onclick="Modules.reportes.showMenu()">← Volver al Menú</button>
            <h2>🔪 Reporte de Cirugías y Partos</h2>
          </div>
          <button id="refreshProcedimientosBtn" class="btn btn-primary">🔄 Actualizar Datos</button>
        </div>

        <div style="background: var(--background); padding: 1rem; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">

          <div>
            <label for="filterHospitalProc" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hospital:</label>
            <select id="filterHospitalProc" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los hospitales</option>
              ${hospitalOptions}
            </select>
          </div>

          <div>
            <label for="filterQuirofanoProc" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Quirófano:</label>
            <select id="filterQuirofanoProc" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los quirófanos</option>
            </select>
          </div>

          <div>
            <label for="filterTipoAtencionProc" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Tipo:</label>
            <select id="filterTipoAtencionProc" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos (Partos y Cirugías)</option>
              <option value="1">Partos</option>
              <option value="2">Cirugías</option>
            </select>
          </div>

          <div>
            <label for="filterTipoProcedimientoProc" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Procedimiento:</label>
            <select id="filterTipoProcedimientoProc" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los procedimientos</option>
            </select>
          </div>

          <div>
            <label for="filterFechaDesdeProc" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Desde:</label>
            <input type="date" id="filterFechaDesdeProc" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaDesde}" />
          </div>

          <div>
            <label for="filterFechaHastaProc" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hasta:</label>
            <input type="date" id="filterFechaHastaProc" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaHasta}" />
          </div>

        </div>
      </div>

      <div id="reportDataContainer">
        <p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos del reporte...</p>
      </div>
    `;

    document.getElementById("refreshProcedimientosBtn").addEventListener("click", () => this.fetchProcedimientosData());
    document.getElementById("filterHospitalProc").addEventListener("change", (e) => {
      this.selectedHospital = e.target.value;
      this.loadQuirofanosProc();
      this.fetchProcedimientosData();
    });
    document.getElementById("filterQuirofanoProc").addEventListener("change", () => this.fetchProcedimientosData());
    document.getElementById("filterTipoAtencionProc").addEventListener("change", () => this.fetchProcedimientosData());
    document.getElementById("filterTipoProcedimientoProc").addEventListener("change", () => this.fetchProcedimientosData());
    document.getElementById("filterFechaDesdeProc").addEventListener("change", (e) => {
      this.selectedFechaDesde = e.target.value;
      this.fetchProcedimientosData();
    });
    document.getElementById("filterFechaHastaProc").addEventListener("change", (e) => {
      this.selectedFechaHasta = e.target.value;
      this.fetchProcedimientosData();
    });

    await this.loadQuirofanosProc();
    await this.loadTiposProcedimientoProc();
    this.fetchProcedimientosData();
  },

  async loadQuirofanosProc() {
    try {
      const hospitalId = this.selectedHospital || '';
      const url = `../api/quirofanos/listar_quirofanos.php?hospital_id=${hospitalId}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      const select = document.getElementById("filterQuirofanoProc");
      if (!select) return;

      select.innerHTML = '<option value="">Todos los quirófanos</option>';
      if (res.ok) {
        res.data.forEach(q => {
          select.innerHTML += `<option value="${q.ID}">${q.NOMBREQUIROFANO}</option>`;
        });
      }
    } catch (error) {
      console.error("Error al cargar quirófanos:", error);
    }
  },

  async loadTiposProcedimientoProc() {
    try {
      const response = await fetch('../api/procquirugicos/listar_tipo_procedimiento.php', { credentials: "include" });
      const res = await response.json();

      const select = document.getElementById("filterTipoProcedimientoProc");
      if (!select) return;

      select.innerHTML = '<option value="">Todos los procedimientos</option>';
      if (res.ok) {
        res.data.forEach(t => {
          select.innerHTML += `<option value="${t.ID}">${t.NOMBREPROCEDIMIENTO}</option>`;
        });
      }
    } catch (error) {
      console.error("Error al cargar tipos de procedimiento:", error);
    }
  },

  async fetchProcedimientosData() {
    const container = document.getElementById("reportDataContainer");

    const hospital = this.selectedHospital || '';
    const quirofano = document.getElementById("filterQuirofanoProc")?.value || '';
    const tipoAtencion = document.getElementById("filterTipoAtencionProc")?.value || '';
    const tipoProcId = document.getElementById("filterTipoProcedimientoProc")?.value || '';
    const fechaDesde = document.getElementById("filterFechaDesdeProc")?.value || '';
    const fechaHasta = document.getElementById("filterFechaHastaProc")?.value || '';

    container.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>`;

    try {
      const params = new URLSearchParams({
        hospital_id: hospital,
        quirofano_id: quirofano,
        tipo_atencion: tipoAtencion,
        tipo_procedimiento_id: tipoProcId,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const url = `../api/reportes/procedimientos_quirofano.php?${params.toString()}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        this.renderProcedimientosStats(res.data);
      } else {
        UI.toast.show(res.message, "error");
        container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">${res.message}</p>`;
      }
    } catch (error) {
      UI.toast.show("Error al cargar datos del reporte", "error");
      container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">Ocurrió un error de conexión con la base de datos.</p>`;
    }
  },

  renderProcedimientosStats(data) {
    const container = document.getElementById("reportDataContainer");

    const { resumen, detallado } = data;

    const tipoStyle = (tipo) => tipo === 'Partos'
      ? { bg: '#fef9c3', color: '#a16207' }
      : { bg: '#e0f2fe', color: '#0284c7' };

    const rows = detallado.length > 0
      ? detallado.map(r => {
          const s = tipoStyle(r.TIPO_ATENCION);
          return `
            <tr>
              <td>${new Date(r.FECHA).toLocaleDateString()}</td>
              <td><strong>${r.NOMBREQUIROFANO}</strong></td>
              <td>
                <span class="badge" style="background:${s.bg}; color:${s.color};
                  padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">
                  ${r.TIPO_ATENCION}
                </span>
              </td>
              <td>${r.NOMBREPROCEDIMIENTO}</td>
              <td style="text-align: center;">
                <span class="badge" style="background: #ede9fe; color: #7c3aed;
                  padding: 4px 12px; border-radius: 6px; font-weight: 700;">
                  ${r.total}
                </span>
              </td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="5" style="text-align: center; color: var(--text-light); padding: 2rem;">No hay registros con los filtros seleccionados</td></tr>';

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="card" style="border-left: 4px solid var(--secondary);">
          <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Total</h3>
          <div style="font-size: 2.5rem; font-weight: 700; color: var(--secondary); margin: 0.5rem 0;">${resumen.total}</div>
        </div>

        <div class="card" style="border-left: 4px solid #0284c7;">
          <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Cirugías</h3>
          <div style="font-size: 2.5rem; font-weight: 700; color: #0284c7; margin: 0.5rem 0;">${resumen.cirugias}</div>
        </div>

        <div class="card" style="border-left: 4px solid #a16207;">
          <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Partos</h3>
          <div style="font-size: 2.5rem; font-weight: 700; color: #a16207; margin: 0.5rem 0;">${resumen.partos}</div>
        </div>
      </div>

      <div class="card">
        <h3>📋 Detalle por Fecha, Quirófano y Procedimiento</h3>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Quirófano</th>
                <th>Tipo</th>
                <th>Procedimiento</th>
                <th style="text-align: center;">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async loadConsultasEspecialistasView() {
    this.currentView = 'consultas_especialistas';
    const contentArea = document.getElementById("contentArea");

    const hospitalOptions = this.hospitales.map(h =>
      `<option value="${h.UNI_ORG}" ${this.selectedHospital === h.UNI_ORG ? 'selected' : ''}>${h.NOMUO}</option>`
    ).join('');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <button class="btn btn-secondary" style="margin-bottom: 0.5rem;" onclick="Modules.reportes.showMenu()">← Volver al Menú</button>
            <h2>👨‍⚕️ Reporte de Consultas de Especialistas</h2>
          </div>
          <button id="refreshEspecialistasBtn" class="btn btn-primary">🔄 Actualizar Datos</button>
        </div>

        <div style="background: var(--background); padding: 1rem; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label for="filterHospitalEsp" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hospital:</label>
            <select id="filterHospitalEsp" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los hospitales</option>
              ${hospitalOptions}
            </select>
          </div>

          <div>
            <label for="filterEspecialidadEsp" style="font-weight: 600; font-size: 0.9rem; display:block; margin-bottom:0.5rem;">Especialidad:</label>
            <select id="filterEspecialidadEsp" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todas las especialidades</option>
            </select>
          </div>

          <div>
            <label for="filterConsultorioEsp" style="font-weight: 600; font-size: 0.9rem; display:block; margin-bottom:0.5rem;">Consultorio:</label>
            <select id="filterConsultorioEsp" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todos los consultorios</option>
            </select>
          </div>

          <div>
            <label for="filterAtencionEsp" style="font-weight: 600; font-size: 0.9rem; display:block; margin-bottom:0.5rem;">Tipo de Atención:</label>
            <select id="filterAtencionEsp" class="form-group" style="margin-bottom: 0; width: 100%;">
              <option value="">Todas</option>
              <option value="Primera Vez">Primera Vez</option>
              <option value="Subsecuente">Subsecuente</option>
              <option value="Urgencia">Urgencia</option>
            </select>
          </div>

          <div>
            <label for="filterFechaDesdeEsp" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Desde:</label>
            <input type="date" id="filterFechaDesdeEsp" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaDesde}" />
          </div>

          <div>
            <label for="filterFechaHastaEsp" style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Hasta:</label>
            <input type="date" id="filterFechaHastaEsp" class="form-group" style="margin-bottom: 0; width: 100%;" value="${this.selectedFechaHasta}" />
          </div>
        </div>
      </div>

      <div id="reportDataContainer">
        <p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>
      </div>
    `;

    document.getElementById("refreshEspecialistasBtn").addEventListener("click", () => this.fetchConsultasEspecialistasData());

    document.getElementById("filterHospitalEsp").addEventListener("change", (e) => {
      this.selectedHospital = e.target.value;
      this.fetchConsultasEspecialistasData();
    });

    document.getElementById("filterEspecialidadEsp").addEventListener("change", (e) => {
      this.selectedEspecialidad = e.target.value;
      this.fetchConsultasEspecialistasData();
    });

    document.getElementById("filterConsultorioEsp").addEventListener("change", () => this.fetchConsultasEspecialistasData());
    document.getElementById("filterAtencionEsp").addEventListener("change", () => this.fetchConsultasEspecialistasData());

    document.getElementById("filterFechaDesdeEsp").addEventListener("change", (e) => {
      this.selectedFechaDesde = e.target.value;
      this.fetchConsultasEspecialistasData();
    });

    document.getElementById("filterFechaHastaEsp").addEventListener("change", (e) => {
      this.selectedFechaHasta = e.target.value;
      this.fetchConsultasEspecialistasData();
    });

    this.loadCatalogosConsultasEspecialistas();
    this.fetchConsultasEspecialistasData();
  },

  async loadCatalogosConsultasEspecialistas() {
    try {
      const resEspecialidades = await fetch("../api/especialidades/listar_especialidades.php", { credentials: "include" });
      const dataEspecialidades = await resEspecialidades.json();

      if (dataEspecialidades.ok) {
        const select = document.getElementById("filterEspecialidadEsp");

        if (select) {
          dataEspecialidades.data.forEach(e => {
            select.innerHTML += `<option value="${e.ID}">${e.ESPECIALIDAD}</option>`;
          });

          select.value = this.selectedEspecialidad;
        }
      }

      const resConsultorios = await fetch("../api/consultorios/listar_consultorios.php", { credentials: "include" });
      const dataConsultorios = await resConsultorios.json();

      if (dataConsultorios.ok) {
        const select = document.getElementById("filterConsultorioEsp");

        if (select) {
          dataConsultorios.data.forEach(c => {
            select.innerHTML += `<option value="${c.ID}">${c.CONSULTORIO}</option>`;
          });
        }
      }
    } catch (error) {
      console.error("Error al cargar catálogos de especialistas", error);
    }
  },

  async fetchConsultasEspecialistasData() {
    const container = document.getElementById("reportDataContainer");
    const hospital = document.getElementById("filterHospitalEsp")?.value || '';
    const especialidad = document.getElementById("filterEspecialidadEsp")?.value || '';
    const consultorio = document.getElementById("filterConsultorioEsp")?.value || '';
    const atencion = document.getElementById("filterAtencionEsp")?.value || '';
    const fechaDesde = document.getElementById("filterFechaDesdeEsp")?.value || '';
    const fechaHasta = document.getElementById("filterFechaHastaEsp")?.value || '';

    container.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 3rem;">Cargando datos...</p>`;

    try {
      const params = new URLSearchParams({
        hospital_id: hospital,
        especialidad_id: especialidad,
        consultorio_id: consultorio,
        atencion: atencion,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const url = `../api/reportes/consultas_especialistas.php?${params.toString()}`;
      const response = await fetch(url, { credentials: "include" });
      const res = await response.json();

      if (res.ok) {
        this.renderConsultasEspecialistasStats(res.data);
      } else {
        UI.toast.show(res.message, "error");
        container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">${res.message}</p>`;
      }
    } catch (error) {
      UI.toast.show("Error al cargar datos del reporte", "error");
      container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 3rem;">Ocurrió un error de conexión con la base de datos.</p>`;
    }
  },

  renderConsultasEspecialistasStats(data) {
    const container = document.getElementById("reportDataContainer");
    const { resumen, registros, total } = data;

    let resumenHtml = resumen.map(r => `
      <div class="card" style="background: var(--background); border: none; border-left: 4px solid #10b981;">
        <h4 style="color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">${r.ESPECIALIDAD} - ${r.NOMBRECONSULTORIO}</h4>
        <div style="margin-top: 0.25rem; margin-bottom: 0.5rem;">
          <span class="badge" style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; font-size: 0.7rem;">${r.TIPOCONSULTA}</span>
        </div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${r.total_consultas} <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-light);">consultas</span></div>
      </div>
    `).join('');

    if (resumen.length === 0) {
      resumenHtml = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No hay consultas registradas para los filtros seleccionados.</p>';
    }

    let rows = registros.map(r => `
      <tr>
        <td>${new Date(r.FECHACONSULTA).toLocaleString()}</td>
        <td><strong>${r.ESPECIALIDAD}</strong></td>
        <td>${r.NOMBRECONSULTORIO}</td>
        <td>Dr. ${r.MEDICO_NOMBRE} ${r.MEDICO_PATERNO}</td>
        <td><span class="badge" style="background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem;">${r.TIPOCONSULTA}</span></td>
      </tr>
    `).join('');

    if (registros.length === 0) {
      rows = '<tr><td colspan="5" style="text-align: center; color: var(--text-light); padding: 2rem;">No hay registros detallados</td></tr>';
    }

    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--secondary); margin-bottom: 1.5rem;">
        <h3 style="color: var(--text-light); font-size: 0.9rem; text-transform: uppercase;">Total de Consultas</h3>
        <div style="font-size: 2.5rem; font-weight: 700; color: var(--secondary); margin: 0.5rem 0;">${total}</div>
      </div>

      <h3 style="margin-bottom: 1rem;">📊 Resumen por Especialidad, Consultorio y Atención</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        ${resumenHtml}
      </div>

      <div class="card">
        <h3>📋 Detalle de Consultas Individuales</h3>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Especialidad</th>
                <th>Consultorio</th>
                <th>Médico</th>
                <th>Tipo Atención</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;

      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);

      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }
};