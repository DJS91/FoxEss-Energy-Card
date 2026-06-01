// __BUILD_INLINE_BACKGROUNDS_START__
const BUNDLED_BG_IMAGE_FILES = {
  day_no_ev: './images/energy-house-day-no-ev.png',
  day_with_ev: './images/energy-house-day-with-ev.png',
  night_no_ev: './images/energy-house-night-no-ev.png',
  night_with_ev: './images/energy-house-night-with-ev.png',
};
const BUNDLED_BG_IMAGES = Object.fromEntries(
  Object.entries(BUNDLED_BG_IMAGE_FILES).map(([key, imagePath]) => [
    key,
    new URL(imagePath, import.meta.url).href,
  ])
);
// __BUILD_INLINE_BACKGROUNDS_END__

// ============================================================
//  Energy Flow Card - Home Assistant Custom Lovelace Card
//  Single-file distribution (editor + card)
// ============================================================

//  Editor element 
class EnergyFlowCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // Schema for ha-form (HA built-in form generator)
  get _schema() {
    return [
      // -- Section: Base Energy Sensors ------------------------------------
      { name: '_section_base', type: 'constant', label: 'Base Energy Sensors', required: false },
      { name: 'grid_feed_in_sensor', label: 'Grid Feed-In / Export (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'grid_consumption_sensor', label: 'Grid Consumption / Import (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'battery_charge_sensor', label: 'Battery Charge Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'battery_discharge_sensor', label: 'Battery Discharge Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'battery_soc_sensor', label: 'Battery State of Charge (%)', selector: { entity: { domain: 'sensor' } } },
      { name: 'load_power_sensor', label: 'Home Load Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'inverter_state_sensor', label: 'Inverter State', selector: { entity: { domain: 'sensor' } } },
      { name: 'work_mode_select', label: 'Work Mode (select entity)', selector: { entity: { domain: 'select' } } },
      { name: 'solar_label', label: 'Solar label (default: GEN LOAD)', selector: { text: {} } },
      { name: 'solar_generation_sensor', label: 'Solar Generation / Gen Load (kW)', selector: { entity: { domain: 'sensor' } } },
      // -- Section: EV Charger --------------------------------------------
      { name: '_section_evc', type: 'constant', label: 'EV Charger', required: false },
      { name: 'evc_power_sensor', label: 'EV Charger Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'evc_status_sensor', label: 'EV Charger Status', selector: { entity: { domain: 'sensor' } } },
      { name: 'evc_unplugged_status', label: 'EV Charger Unplugged Status (default: Unplugged)', selector: { text: {} } },
      // -- Section: Inverter Details ---------------------------------------
      { name: '_section_inv_det', type: 'constant', label: 'Inverter Details', required: false },
      { name: 'inverter_temp_sensor', label: 'Inverter Temperature (°C)', selector: { entity: { domain: 'sensor' } } },
      { name: 'ambient_temp_sensor', label: 'Ambient Temperature (°C)', selector: { entity: { domain: 'sensor' } } },
      { name: 'battery_temp_sensor', label: 'Battery Temperature (°C)', selector: { entity: { domain: 'sensor' } } },
      { name: 'cell_temp_low_sensor', label: 'Battery Cell Temp Low (°C)', selector: { entity: { domain: 'sensor' } } },
      { name: 'cell_temp_high_sensor', label: 'Battery Cell Temp High (°C)', selector: { entity: { domain: 'sensor' } } },
      // -- Section: Grid Details -------------------------------------------
      { name: '_section_grid', type: 'constant', label: 'Grid Details', required: false },
      { name: 'grid_voltage_sensor', label: 'Grid Voltage (V)', selector: { entity: { domain: 'sensor' } } },
      { name: 'grid_current_sensor', label: 'Grid Current (A)', selector: { entity: { domain: 'sensor' } } },
      // -- Section: Top Right Details --------------------------------------
      { name: '_section_top', type: 'constant', label: 'Top Right Details', required: false },
      { name: 'battery_soh_sensor', label: 'Battery State of Health (%)', selector: { entity: { domain: 'sensor' } } },
      { name: 'inverter_fault_sensor', label: 'Inverter Fault Code', selector: { entity: { domain: 'sensor' } } },
      // -- Section: Solar / PV Details -------------------------------------
      { name: '_section_pv', type: 'constant', label: 'Solar / PV Details', required: false },
      { name: 'pv1_power_sensor', label: 'PV1 Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv1_current_sensor', label: 'PV1 Current (A)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv1_voltage_sensor', label: 'PV1 Voltage (V)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv2_power_sensor', label: 'PV2 Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv2_current_sensor', label: 'PV2 Current (A)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv2_voltage_sensor', label: 'PV2 Voltage (V)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv3_power_sensor', label: 'PV3 Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv3_current_sensor', label: 'PV3 Current (A)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv3_voltage_sensor', label: 'PV3 Voltage (V)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv4_power_sensor', label: 'PV4 Power (kW)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv4_current_sensor', label: 'PV4 Current (A)', selector: { entity: { domain: 'sensor' } } },
      { name: 'pv4_voltage_sensor', label: 'PV4 Voltage (V)', selector: { entity: { domain: 'sensor' } } },
      // -- Section: Visual Effects -----------------------------------------
      { name: '_section_vis', type: 'constant', label: 'Visual Effects', required: false },
      { name: 'weather_entity', label: 'Weather Entity (for cloud/rain effects)', selector: { entity: { domain: 'weather' } } },
      { name: 'sun_entity', label: 'Sun Entity (day/night cycle)', selector: { entity: { domain: 'sun' } } },
      { name: 'background_image', label: 'Background Image URL (e.g. /local/energy-house.png)', selector: { text: {} } },
    ];
  }

    _pickerFields() {
    return [
      { section: 'Base Energy Sensors' },
      { key: 'grid_feed_in_sensor', label: 'Grid Feed-In / Export (kW)', placeholder: 'sensor.foxessinverter_feed_in' },
      { key: 'grid_consumption_sensor', label: 'Grid Consumption / Import (kW)', placeholder: 'sensor.foxessinverter_grid_consumption' },
      { key: 'battery_charge_sensor', label: 'Battery Charge Power (kW)', placeholder: 'sensor.foxessinverter_battery_charge' },
      { key: 'battery_discharge_sensor', label: 'Battery Discharge Power (kW)', placeholder: 'sensor.foxessinverter_rpower' },
      { key: 'battery_soc_sensor', label: 'Battery State of Charge (%)', placeholder: 'sensor.foxessinverter_battery_soc' },
      { key: 'load_power_sensor', label: 'Home Load Power (kW)', placeholder: 'sensor.foxessinverter_load_power' },
      { key: 'inverter_state_sensor', label: 'Inverter State (on/off grid)', placeholder: 'sensor.foxessinverter_inverter_state' },
      { key: 'work_mode_select', label: 'Work Mode (select entity)', placeholder: 'select.foxessinverter_work_mode' },
      { key: 'solar_label', label: 'Solar label (default: GEN LOAD)', placeholder: 'GEN LOAD' },
      { key: 'solar_generation_sensor', label: 'Solar Generation (kW)', placeholder: 'sensor.foxessinverter_genload' },
      { section: 'EV Charger' },
      { key: 'evc_power_sensor', label: 'EV Charger Power (kW)', placeholder: 'sensor.ev_charger_power' },
      { key: 'evc_status_sensor', label: 'EV Charger Status', placeholder: 'sensor.ev_charger_status' },
      { key: 'evc_unplugged_status', label: 'EV Charger Unplugged Status', placeholder: 'Unplugged' },
      { section: 'Inverter Details' },
      { key: 'inverter_temp_sensor', label: 'Inverter Temperature (°C)', placeholder: 'sensor.foxessinverter_invtemp' },
      { key: 'ambient_temp_sensor', label: 'Ambient Temperature (°C)', placeholder: 'sensor.foxessinverter_ambtemp' },
      { key: 'battery_temp_sensor', label: 'Battery Temperature (°C)', placeholder: 'sensor.foxessinverter_battery_temp' },
      { key: 'cell_temp_low_sensor', label: 'Battery Cell Temp Low (°C)', placeholder: 'sensor.foxessinverter_bms_cell_temp_low' },
      { key: 'cell_temp_high_sensor', label: 'Battery Cell Temp High (°C)', placeholder: 'sensor.foxessinverter_bms_cell_temp_high' },
      { section: 'Grid Details' },
      { key: 'grid_voltage_sensor', label: 'Grid Voltage (V)', placeholder: 'sensor.foxessinverter_rvolt' },
      { key: 'grid_current_sensor', label: 'Grid Current (A)', placeholder: 'sensor.foxessinverter_rcurrent' },
      { section: 'Top Right Details' },
      { key: 'battery_soh_sensor', label: 'Battery State of Health (%)', placeholder: 'sensor.foxessinverter_battery_soh' },
      { key: 'inverter_fault_sensor', label: 'Inverter Fault Code', placeholder: 'sensor.foxessinverter_inverter_fault_code' },
      { section: 'Solar / PV Details' },
      { key: 'pv1_power_sensor', label: 'PV1 Power (kW)', placeholder: 'sensor.foxessinverter_pv1_power' },
      { key: 'pv1_current_sensor', label: 'PV1 Current (A)', placeholder: 'sensor.foxessinverter_pv1_current' },
      { key: 'pv1_voltage_sensor', label: 'PV1 Voltage (V)', placeholder: 'sensor.foxessinverter_pv1_voltage' },
      { key: 'pv2_power_sensor', label: 'PV2 Power (kW)', placeholder: 'sensor.foxessinverter_pv2_power' },
      { key: 'pv2_current_sensor', label: 'PV2 Current (A)', placeholder: 'sensor.foxessinverter_pv2_current' },
      { key: 'pv2_voltage_sensor', label: 'PV2 Voltage (V)', placeholder: 'sensor.foxessinverter_pv2_voltage' },
      { key: 'pv3_power_sensor', label: 'PV3 Power (kW)', placeholder: 'sensor.foxessinverter_pv3_power' },
      { key: 'pv3_current_sensor', label: 'PV3 Current (A)', placeholder: 'sensor.foxessinverter_pv3_current' },
      { key: 'pv3_voltage_sensor', label: 'PV3 Voltage (V)', placeholder: 'sensor.foxessinverter_pv3_voltage' },
      { key: 'pv4_power_sensor', label: 'PV4 Power (kW)', placeholder: 'sensor.foxessinverter_pv4_power' },
      { key: 'pv4_current_sensor', label: 'PV4 Current (A)', placeholder: 'sensor.foxessinverter_pv4_current' },
      { key: 'pv4_voltage_sensor', label: 'PV4 Voltage (V)', placeholder: 'sensor.foxessinverter_pv4_voltage' },
      { section: 'Visual Effects' },
      { key: 'weather_entity', label: 'Weather Entity (for cloud/rain effects)', placeholder: 'weather.your_location_hourly' },
      { key: 'sun_entity', label: 'Sun Entity (day/night cycle)', placeholder: 'sun.sun' },
    ];
  }

  _render() {
    const c = this._config;
    const fields = this._pickerFields();

    let html = `
      <style>
        .card-config { padding: 16px; }
        .section-header {
          font-size: 13px; font-weight: 600; color: var(--primary-color);
          padding: 14px 0 4px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
          margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .row { margin-bottom: 12px; }
        .row label { display: block; font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; }
        .row input[type="text"] {
          width: 100%; box-sizing: border-box; padding: 8px 12px;
          border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
          background: var(--card-background-color, #1c1c1c);
          color: var(--primary-text-color, #fff); font-size: 14px; font-family: inherit;
        }
        .row input[type="text"]:focus { outline: none; border-color: var(--primary-color, #03a9f4); }
        .row input[type="text"]::placeholder { color: var(--disabled-text-color, #888); }
      </style>
      <div class="card-config">
    `;

    for (const f of fields) {
      if (f.section) {
        html += `<div class="section-header">${f.section}</div>`;
      } else {
        const val = (c[f.key] || '').replace(/"/g, '&quot;');
        const ph = (f.placeholder || '').replace(/"/g, '&quot;');
        html += `<div class="row"><label>${f.label}</label><input type="text" data-key="${f.key}" value="${val}" placeholder="${ph}"></div>`;
      }
    }
    html += `</div>`;
    this.shadowRoot.innerHTML = html;

    this.shadowRoot.querySelectorAll('input[type="text"]').forEach(input => {
      input.addEventListener('change', () => {
        this._config = { ...this._config, [input.dataset.key]: input.value };
        this._fireConfigChanged();
      });
    });
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('energy-flow-card-editor', EnergyFlowCardEditor);


//  Main card element 
class EnergyFlowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rafId = null;
    // Bind render so we can cancel the RAF on disconnect
    this._boundRender = this._renderCard.bind(this);
  }

  //  HA lifecycle 
  static getConfigElement() {
    return document.createElement('energy-flow-card-editor');
  }

  static getStubConfig() {
    return {
      solar_generation_sensor: 'sensor.foxessinverter_genload',
      grid_feed_in_sensor: 'sensor.foxessinverter_feed_in',
      grid_consumption_sensor: 'sensor.foxessinverter_grid_consumption',
      battery_charge_sensor: 'sensor.foxessinverter_battery_charge',
      battery_discharge_sensor: 'sensor.foxessinverter_rpower',
      battery_soc_sensor: 'sensor.foxessinverter_battery_soc',
      load_power_sensor: 'sensor.foxessinverter_load_power',
      inverter_temp_sensor: 'sensor.foxessinverter_invtemp',
      ambient_temp_sensor: 'sensor.foxessinverter_ambtemp',
      battery_temp_sensor: 'sensor.foxessinverter_battery_temp',
      cell_temp_low_sensor: 'sensor.foxessinverter_bms_cell_temp_low',
      cell_temp_high_sensor: 'sensor.foxessinverter_bms_cell_temp_high',
      grid_voltage_sensor: 'sensor.foxessinverter_rvolt',
      grid_current_sensor: 'sensor.foxessinverter_rcurrent',
      battery_soh_sensor: 'sensor.foxessinverter_battery_soh',
      inverter_fault_sensor: 'sensor.foxessinverter_inverter_fault_code',
      inverter_state_sensor: 'sensor.foxessinverter_inverter_state',
      work_mode_select: 'select.foxessinverter_work_mode',
      pv1_power_sensor: 'sensor.foxessinverter_pv1_power',
      pv1_current_sensor: 'sensor.foxessinverter_pv1_current',
      pv1_voltage_sensor: 'sensor.foxessinverter_pv1_voltage',
      pv2_power_sensor: 'sensor.foxessinverter_pv2_power',
      pv2_current_sensor: 'sensor.foxessinverter_pv2_current',
      pv2_voltage_sensor: 'sensor.foxessinverter_pv2_voltage',
      pv3_power_sensor: 'sensor.foxessinverter_pv3_power',
      pv3_current_sensor: 'sensor.foxessinverter_pv3_current',
      pv3_voltage_sensor: 'sensor.foxessinverter_pv3_voltage',
      pv4_power_sensor: 'sensor.foxessinverter_pv4_power',
      pv4_current_sensor: 'sensor.foxessinverter_pv4_current',
      pv4_voltage_sensor: 'sensor.foxessinverter_pv4_voltage',
      sun_entity: 'sun.sun',
      weather_entity: 'weather.alexandra_hills_hourly',
      evc_power_sensor: '',
      evc_status_sensor: '',
      evc_unplugged_status: 'Unplugged',
      solar_label: '',
      background_image: '',
    };
  }

  setConfig(config) {
    this._config = config;
    this._scheduleRender();
  }

  set hass(hass) {
    this._hass = hass;
    this._scheduleRender();
  }

  connectedCallback() {
    this._scheduleRender();
  }

  disconnectedCallback() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  getCardSize() {
    return 5;
  }

  //  Render scheduling 
  _scheduleRender() {
    if (this._rafId) return; // already queued
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._renderCard();
    });
  }

  _getStoredFlag(key, fallback = false) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value === 'true';
    } catch (_err) {
      return fallback;
    }
  }

  _setStoredFlag(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (_err) {
      // Storage can be unavailable in hardened browser contexts.
    }
  }

  _toggleStoredFlag(key, currentValue) {
    this._setStoredFlag(key, !currentValue);
    this._lastRenderKey = null;
    this._scheduleRender();
  }

  _toggleEffects(currentValue) {
    this._toggleStoredFlag('energy_effects_enabled', currentValue);
  }

  _toggleDetails(currentValue) {
    this._toggleStoredFlag('energy_details_visible', currentValue);
  }

  _bindControls(dayCycleOn, overlayVisible) {
    const bind = (selector, handler) => {
      const control = this.shadowRoot.querySelector(selector);
      if (!control) return;
      control.addEventListener('click', event => {
        event.stopPropagation();
        handler();
      });
      control.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        handler();
      });
    };
    bind('[data-action="toggle-effects"]', () => this._toggleEffects(dayCycleOn));
    bind('[data-action="toggle-details"]', () => this._toggleDetails(overlayVisible));
  }

  //  Sensor helpers 
  _state(entityId, fallback = 0) {
    if (!entityId || !this._hass) return fallback;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return fallback;
    const v = parseFloat(stateObj.state);
    return isNaN(v) ? (stateObj.state ?? fallback) : v;
  }

  _stateStr(entityId, fallback = 'N/A') {
    if (!entityId || !this._hass) return fallback;
    return this._hass.states[entityId]?.state ?? fallback;
  }

  _stateNumber(entityId) {
    if (!entityId || !this._hass) return null;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return null;
    const v = parseFloat(stateObj.state);
    return Number.isFinite(v) ? v : null;
  }

  //  Format helpers 
  _fmtVal(w) { return w >= 1000 ? (w / 1000).toFixed(2) : Math.round(w); }
  _fmtUnit(w) { return w >= 1000 ? 'kW' : 'W'; }
  _titleCase(value) {
    return String(value)
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b[a-z]/g, letter => letter.toUpperCase());
  }

  //  Main render 
  _renderCard() {
    if (!this._hass || !this._config) return;
    const c = this._config;
    const s = (id, fb = 0) => this._state(id, fb);
    const ss = (id, fb = 'N/A') => this._stateStr(id, fb);

    //  Sensor values 
    const solar_w    = s(c.solar_generation_sensor) * 1000;
    const grid_exp_kw = s(c.grid_feed_in_sensor);
    const grid_imp_kw = s(c.grid_consumption_sensor);
    const grid_exp_w  = grid_exp_kw * 1000;
    const grid_imp_w  = grid_imp_kw * 1000;
    const grid_w      = grid_imp_w > 0 ? grid_imp_w : grid_exp_w > 0 ? -grid_exp_w : 0;
    const bat_chg_kw  = s(c.battery_charge_sensor);
    const bat_dis_kw  = s(c.battery_discharge_sensor);
    const bat_chg_w   = bat_chg_kw * 1000;
    const bat_dis_w   = bat_dis_kw * 1000;
    const bPct        = Math.min(100, Math.max(0, s(c.battery_soc_sensor)));
    const home_w      = s(c.load_power_sensor) * 1000;
    const inv_temp    = s(c.inverter_temp_sensor);
    const amb_temp    = s(c.ambient_temp_sensor);
    const bat_temp    = s(c.battery_temp_sensor);
    const cell_temp_low   = this._stateNumber(c.cell_temp_low_sensor);
    const cell_temp_high  = this._stateNumber(c.cell_temp_high_sensor);
    const hasCellTempLow  = cell_temp_low !== null;
    const hasCellTempHigh = cell_temp_high !== null;
    const grid_volt   = s(c.grid_voltage_sensor);
    const grid_curr   = s(c.grid_current_sensor);
    const bat_soh     = s(c.battery_soh_sensor);
    const inv_fault   = ss(c.inverter_fault_sensor);
    const inv_state   = ss(c.inverter_state_sensor);
    const workMode    = ss(c.work_mode_select, 'Unknown');
    const pv1_power_kw = s(c.pv1_power_sensor);
    const pv1_current  = s(c.pv1_current_sensor);
    const pv1_voltage  = s(c.pv1_voltage_sensor);
    const pv2_power_kw = s(c.pv2_power_sensor);
    const pv2_current  = s(c.pv2_current_sensor);
    const pv2_voltage  = s(c.pv2_voltage_sensor);
    const pv3_power_kw = s(c.pv3_power_sensor);
    const pv3_current  = s(c.pv3_current_sensor);
    const pv3_voltage  = s(c.pv3_voltage_sensor);
    const pv4_power_kw = s(c.pv4_power_sensor);
    const pv4_current  = s(c.pv4_current_sensor);
    const pv4_voltage  = s(c.pv4_voltage_sensor);
    const evcPowerConfigured = !!c.evc_power_sensor;
    const evcStatusConfigured = !!c.evc_status_sensor;
    const evc_power_kw = this._stateNumber(c.evc_power_sensor);
    const evc_power_w = evc_power_kw !== null ? evc_power_kw * 1000 : 0;
    const evcStatusRaw = (ss(c.evc_status_sensor, '') || '').trim();
    const evcStatusDisplay = this._titleCase(evcStatusRaw);
    const evc_status = evcStatusDisplay.length > 22 ? `${evcStatusDisplay.slice(0, 21)}...` : evcStatusDisplay;
    const evcVisible = evcPowerConfigured || evcStatusConfigured;
    const evcUnpluggedStatus = (c.evc_unplugged_status || 'Unplugged').trim();
    const evcPluggedIn = evcStatusConfigured && evcStatusRaw.toLowerCase() !== evcUnpluggedStatus.toLowerCase();
    const sunEntity = c.sun_entity || 'sun.sun';
    const sunObj = sunEntity ? this._hass.states[sunEntity] : null;
    const sunState = (sunObj?.state || '').toLowerCase();
    const sunElevationValue = Number(sunObj?.attributes?.elevation);
    const sunElevation = Number.isFinite(sunElevationValue)
      ? sunElevationValue
      : (sunState === 'below_horizon' ? -12 : 35);
    const sunRising = typeof sunObj?.attributes?.rising === 'boolean'
      ? sunObj.attributes.rising
      : (new Date().getHours() < 12);
    const dayCycleOn     = !!sunEntity && this._getStoredFlag('energy_effects_enabled', true);
    const overlayVisible = this._getStoredFlag('energy_details_visible', false);
    const weatherState   = ss(c.weather_entity, '').toLowerCase();
    const weatherRainy   = weatherState === 'rainy' || weatherState === 'lightning-rainy';
    const weatherCloudy  = weatherState === 'cloudy';
    const weatherFoggy   = weatherState === 'fog';
    const weatherOverlay = dayCycleOn && (weatherRainy || weatherCloudy || weatherFoggy);
    const weatherActive  = weatherRainy || weatherCloudy || weatherFoggy;
    const solarLabel     = c.solar_label || 'GEN LOAD';
    const bgIsDay        = sunElevation >= 0 && sunState !== 'below_horizon';
    const bgImageKey     = `${bgIsDay ? 'day' : 'night'}_${evcPluggedIn ? 'with_ev' : 'no_ev'}`;
    const bgImage        = c.background_image || BUNDLED_BG_IMAGES[bgImageKey] || BUNDLED_BG_IMAGES.day_no_ev;

    //  State flags 
    const solar_on    = solar_w    > 0;
    const importing   = grid_imp_w > 0;
    const exporting   = grid_exp_w > 0;
    const charging    = bat_chg_w  > 0;
    const discharge   = bat_dis_w  > 0;
    const home_on     = home_w     > 0;
    const forceCharge    = workMode === 'Force Charge';
    const forceDischarge = workMode === 'Force Discharge';
    const solarCharging  = solar_on && charging && !forceCharge;

    //  Colours 
    const C_SOL  = solar_on    ? '#34d399' : '#3d4256';
    const C_GRD  = forceCharge ? '#60a5fa' : (importing || exporting) ? '#34d399' : '#3d4256';
    const C_BAT  = forceCharge ? '#60a5fa' : (charging || discharge)  ? '#34d399' : '#3d4256';
    const C_HOM  = (forceCharge && importing) ? '#60a5fa' : home_on   ? '#34d399' : '#3d4256';
    const C_INV  = (solar_on || charging || discharge) ? '#34d399' : '#3d4256';
    const PHOTON_TIP = forceCharge ? '#bfdbfe' : '#8ff788';
    const Cardbg = '#14141D';

    //  Day cycle sky gradient 
    const _sky = (() => {
      let h = new Date().getHours() + new Date().getMinutes() / 60;
      if (sunObj && (sunState === 'above_horizon' || sunState === 'below_horizon' || Number.isFinite(sunElevationValue))) {
        const elev = Math.max(-18, Math.min(70, sunElevation));
        if (elev <= -8) {
          h = sunRising ? 5 : 19.5;
        } else if (elev < 0) {
          const t = (elev + 8) / 8;
          h = sunRising ? 5 + t * 2 : 18.5 - t;
        } else {
          const t = Math.min(elev / 60, 1);
          h = sunRising ? 7 + t * 5 : 17.5 - t * 5.5;
        }
      }
      const kf = [
        [0,    [20,  20,  29], 0,    [20,  20,  29], 0,    0.50],
        [5,    [20,  20,  29], 0,    [20,  20,  29], 0,    0.50],
        [5.75, [45,  55, 120], 0.50, [190,  85,  15], 0.65, 0.55],
        [7,    [80,  155, 235], 0.52, [255, 220, 130], 0.75, 0.44],
        [9,    [125, 188, 252], 0.58, [255, 248, 200], 0.88, 0.30],
        [12,   [138, 198, 255], 0.68, [255, 255, 245], 0.94, 0.22],
        [14.5, [122, 182, 248], 0.65, [255, 252, 230], 0.92, 0.24],
        [16,   [95,  152, 218], 0.55, [235, 185,  80], 0.80, 0.38],
        [16.5, [115, 45,  75], 0.55, [200,  75,  10], 0.68, 0.53],
        [17.5, [75,  18,  95], 0.58, [120,  28,  18], 0.60, 0.55],
        [18,   [20,  20,  29], 0.20, [20,   20,  29], 0.20, 0.50],
        [18.5, [20,  20,  29], 0,    [20,  20,  29], 0,    0.00],
        [24,   [20,  20,  29], 0,    [20,  20,  29], 0,    0.50],
      ];
      let a = kf[0], b = kf[kf.length - 1];
      for (let i = 0; i < kf.length - 1; i++) {
        if (h >= kf[i][0] && h < kf[i+1][0]) { a = kf[i]; b = kf[i+1]; break; }
      }
      const t = (h - a[0]) / (b[0] - a[0]);
      const lr = (av, bv) => Math.round(av + (bv - av) * t);
      const lf = (av, bv) => parseFloat((av + (bv - av) * t).toFixed(3));
      const _tr = lr(a[1][0], b[1][0]), _tg = lr(a[1][1], b[1][1]), _tb = lr(a[1][2], b[1][2]);
      const _sr = lr(a[3][0], b[3][0]), _sg = lr(a[3][1], b[3][1]), _sb = lr(a[3][2], b[3][2]);
      return {
        tr: _tr, tg: _tg, tb: _tb, top: lf(a[2], b[2]),
        sr: _sr, sg: _sg, sb: _sb, sun: lf(a[4], b[4]),
        sunC: lf(a[5], b[5]),
        ltr: Math.min(255, _tr + 55), ltg: Math.min(255, _tg + 50), ltb: Math.min(255, _tb + 35),
        s2r: Math.min(255, Math.round(_sr * 0.5 + 255 * 0.5)),
        s2g: Math.min(255, Math.round(_sg * 0.5 + 255 * 0.5)),
        s2b: Math.min(255, Math.round(_sb * 0.5 + 255 * 0.5)),
        s3r: Math.min(255, Math.round(_sr * 0.15 + 255 * 0.85)),
        s3g: Math.min(255, Math.round(_sg * 0.15 + 255 * 0.85)),
        s3b: Math.min(255, Math.round(_sb * 0.15 + 255 * 0.85)),
      };
    })();

    //  SVG helpers 
    const wire = (d, color, active, glowColor = null) =>
      `<path d="${d}" stroke="${glowColor ?? '#5B5B5B'}" stroke-width="3.5" fill="none"
       opacity="${active ? 0.95 : 0.25}" stroke-linecap="round"
       stroke-linejoin="round"${glowColor ? ' filter="url(#lg)"' : ''}/>`;

    const pathLength = d => {
      const pts = [];
      const re = /[ML]\s*([\d.]+),([\d.]+)/g;
      let m;
      while ((m = re.exec(d)) !== null) pts.push([parseFloat(m[1]), parseFloat(m[2])]);
      let tot = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
        tot += Math.sqrt(dx*dx + dy*dy);
      }
      return tot;
    };

    const travelDot = (d, color, dur = '1.6s', begin = '0s', len = 30, gap = 0, pathLen = 0) => {
      const gid   = `strk_${color.slice(1)}_${Math.abs(begin).toFixed(0).replace('.','_')}`;
      const base  = parseFloat(dur);
      const tot   = (base + gap).toFixed(2);
      const gfNum = gap > 0 ? gap / (base + gap) : 0;
      const gf    = gfNum > 0 ? gfNum.toFixed(4) : null;
      const _cpts = [];
      { const _cr = /[ML]\s*([\d.]+),([\d.]+)/g; let _cm; while((_cm=_cr.exec(d))!==null) _cpts.push([parseFloat(_cm[1]),parseFloat(_cm[2])]); }
      let _cTot = 0; const _cSegs = [];
      for(let i=1;i<_cpts.length;i++){const _ddx=_cpts[i][0]-_cpts[i-1][0],_ddy=_cpts[i][1]-_cpts[i-1][1];const _sl=Math.sqrt(_ddx*_ddx+_ddy*_ddy);_cSegs.push(_sl);_cTot+=_sl;}
      const _cFr=[0]; let _cAcc=0; for(const _sg of _cSegs){_cAcc+=_sg;_cFr.push(parseFloat((_cAcc/_cTot).toFixed(4)));}
      const kAttr = gf
        ? `calcMode="linear" keyTimes="0;${gf};${_cFr.slice(1).map(f=>(gfNum+(1-gfNum)*f).toFixed(4)).join(';')}" keyPoints="0;0;${_cFr.slice(1).map(f=>f.toFixed(4)).join(';')}"`
        : _cFr.length > 2
          ? `calcMode="linear" keyTimes="${_cFr.map(f=>f.toFixed(4)).join(';')}" keyPoints="${_cFr.map(f=>f.toFixed(4)).join(';')}"`
          : `calcMode="linear"`;
      const growFrac = _cTot > 0 ? Math.min(len / _cTot, 0.80) : 0.15;
      const growAt  = (gfNum + (1 - gfNum) * growFrac).toFixed(4);
      const fadeAt  = (gfNum + (1 - gfNum) * 0.90).toFixed(4);
      const opKT = gf ? `0;${gf};${growAt};${fadeAt};1` : `0;${growAt};${fadeAt};1`;
      const opV  = gf ? '0;0;1;1;0' : '0;1;1;0';
      const _cornerFrs = _cFr.slice(1, -1);
      const dipW = _cTot > 0 ? (len / _cTot) : 0.15;
      let wAnim = '', xAnim = '';
      if (_cornerFrs.length > 0 && dipW > 0) {
        const _tdWKf = [[0, len], [1, len]];
        const _tdXKf = [[0, -len], [1, -len]];
        for (const cf of _cornerFrs) {
          const ct = gfNum + (1 - gfNum) * cf;
          const t0 = parseFloat(Math.max(parseFloat(gf ?? 0), ct - dipW).toFixed(4));
          const tc = parseFloat(ct.toFixed(4));
          const t1 = parseFloat(Math.min(1.0, ct + dipW).toFixed(4));
          _tdWKf.push([t0, len], [tc, 0], [t1, len]);
          _tdXKf.push([t0, -len], [tc, 0], [t1, -len]);
        }
        _tdWKf.sort((a, b) => a[0] - b[0]);
        _tdXKf.sort((a, b) => a[0] - b[0]);
        const _wD = [], _xD = [];
        for (const p of _tdWKf) { if (_wD.length && _wD[_wD.length-1][0]===p[0]) _wD[_wD.length-1][1]=p[1]; else _wD.push([...p]); }
        for (const p of _tdXKf) { if (_xD.length && _xD[_xD.length-1][0]===p[0]) _xD[_xD.length-1][1]=p[1]; else _xD.push([...p]); }
        const wKT = _wD.map(p => p[0].toFixed(4)).join(';');
        const wV  = _wD.map(p => p[1]).join(';');
        const xKT = _xD.map(p => p[0].toFixed(4)).join(';');
        const xV  = _xD.map(p => p[1]).join(';');
        wAnim = `<animate attributeName="width" dur="${tot}s" begin="${begin}" repeatCount="indefinite" calcMode="linear" keyTimes="${wKT}" values="${wV}"/>`;
        xAnim = `<animate attributeName="x" dur="${tot}s" begin="${begin}" repeatCount="indefinite" calcMode="linear" keyTimes="${xKT}" values="${xV}"/>`;
      }
      return `<defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${color}" stop-opacity="0"/>
          <stop offset="55%"  stop-color="${color}" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="${PHOTON_TIP}" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <g>
        <animateMotion dur="${tot}s" begin="${begin}" repeatCount="indefinite"
          path="${d}" ${kAttr} rotate="auto"/>
        <rect x="${-len}" y="-0.75" width="${len}" height="1.5"
              fill="url(#${gid})" rx="1" filter="url(#sg)">
          <animate attributeName="opacity" dur="${tot}s" begin="${begin}"
            repeatCount="indefinite" calcMode="linear"
            keyTimes="${opKT}" values="${opV}"/>
          ${wAnim}${xAnim}
        </rect>
      </g>`;
    };

    const wireMask = (id, d) =>
      `<mask id="${id}">
         <path d="${d}" stroke="white" stroke-width="12" fill="none"
               stroke-linecap="round" stroke-linejoin="round"/>
       </mask>`;

    const hubNode = (cx, cy, active) => {
      const col = active ? '#e2e8f0' : '#4a5068';
      const op  = active ? 1 : 0.5;
      return `<circle cx="${cx}" cy="${cy}" r="12"
                fill="rgba(8,9,26,0.8)" stroke="${col}"
                stroke-width="2" opacity="${op}"/>
              <circle cx="${cx}" cy="${cy}" r="4.5"
                fill="${col}" opacity="${active ? 0.95 : 0.4}"/>`;
    };

    const flowDots = (d, color, dur = '1.8s', n = 2, len = 30, sharedPhase = null, gap = 0.5) => {
      const base  = parseFloat(dur);
      const total = base + gap;
      const phase = sharedPhase !== null ? sharedPhase : (Date.now() % (total * 1000)) / 1000;
      const pLen  = pathLength(d);
      let sv = '';
      for (let i = 0; i < n; i++) {
        let begin = -phase + (i * total / n);
        if (begin > 0) begin -= total;
        sv += travelDot(d, color, dur, begin.toFixed(2) + 's', len, gap, pLen);
      }
      return sv;
    };

    //  Layout config 
    const JX = 320, JY = 242;
    const INV_X = JX - 90, INV_Y = JY - 28;
    const SOL_X = INV_X, SOL_TOP_Y = 93;
    const EVC_LINE_X = 58, EVC_TEXT_X = EVC_LINE_X + 10;
    const EVC_LABEL_Y = 30, EVC_POWER_Y = 50, EVC_STATUS_Y = 69;
    const BAT_BOT_Y = 250;
    const GRD_WALL_Y = 330, GRD_CORN_X = 188, GRD_CORN_Y = 368, GRD_EXIT_X = 49, GRD_EXIT_Y = 330;
    const HOM_END_X = 380, HOM_END_Y = 228;
    const SOL_R = 23, BAT_R = 26, CONN_R = 17;
    const GRD_LINE_X = 20, BAT_LINE_X = 220, HOM_LINE_X = 420;
    const GRD_LINE_LEN = 100, BAT_LINE_LEN = 100, HOM_LINE_LEN = 100;
    const SLINE_COLOR = 'rgba(255,255,255,0.35)';

    const _cdx = JX - INV_X, _cdy = JY - INV_Y;
    const _clen = Math.sqrt(_cdx*_cdx + _cdy*_cdy);
    const _cox = CONN_R * _cdx / _clen, _coy = CONN_R * _cdy / _clen;

    const dSol     = `M ${SOL_X},${SOL_TOP_Y} L ${INV_X},${INV_Y - SOL_R}`;
    const dBatDwn  = `M ${INV_X},${INV_Y + BAT_R} L ${INV_X},${BAT_BOT_Y}`;
    const dBatUp   = `M ${INV_X},${BAT_BOT_Y} L ${INV_X},${INV_Y + BAT_R}`;
    const dGrdIn   = `M ${GRD_EXIT_X},${GRD_EXIT_Y} L ${GRD_CORN_X},${GRD_CORN_Y} L ${JX},${GRD_WALL_Y} L ${JX},${JY}`;
    const dGrdOut  = `M ${JX},${JY} L ${JX},${GRD_WALL_Y} L ${GRD_CORN_X},${GRD_CORN_Y} L ${GRD_EXIT_X},${GRD_EXIT_Y}`;
    const dHom     = `M ${JX},${JY} L ${HOM_END_X},${HOM_END_Y}`;
    const dConnOut = `M ${(INV_X + _cox).toFixed(1)},${(INV_Y + _coy).toFixed(1)} L ${JX},${JY}`;
    const dConnIn  = `M ${JX},${JY} L ${(INV_X + _cox).toFixed(1)},${(INV_Y + _coy).toFixed(1)}`;

    //  Wall-clock phase sync 
    const jPhase    = (Date.now() % 2000) / 1000;
    const jPhaseOut = (jPhase + 0.5) % 2.0;

    //  Detail overlay animation 
    const _now     = Date.now();
    const _prevOv  = localStorage.getItem('energy_overlay_prev') === 'true';
    const _lastTs  = parseInt(localStorage.getItem('energy_overlay_ts') ?? '0') || _now;
    const _detTrans = overlayVisible !== _prevOv;
    if (_detTrans) {
      localStorage.setItem('energy_overlay_prev', String(overlayVisible));
      localStorage.setItem('energy_overlay_ts', String(_now));
    }
    const _elapsed    = _detTrans ? 0 : (_now - _lastTs) / 1000;
    const _animDur    = 0.25;
    const _animWindow = 0.75;

    const dayCycleConfigured = !!sunEntity;
    if (!dayCycleConfigured) {
      localStorage.removeItem('energy_daycycle_prev');
      localStorage.removeItem('energy_daycycle_ts');
    }
    const _prevDc   = dayCycleConfigured ? localStorage.getItem('energy_daycycle_prev') === 'true' : false;
    const _lastDcTs = dayCycleConfigured ? parseInt(localStorage.getItem('energy_daycycle_ts') ?? '0') : _now;
    const _dcTrans  = dayCycleConfigured ? (dayCycleOn !== _prevDc) : false;
    if (_dcTrans) {
      localStorage.setItem('energy_daycycle_prev', String(dayCycleOn));
      localStorage.setItem('energy_daycycle_ts', String(_now));
    }
    const _dcElapsed = _dcTrans ? 0 : (_now - _lastDcTs) / 1000;
    const _dcAnimDur = 1.2;
    const _dcStyle   = _dcElapsed >= _dcAnimDur + 0.1
      ? `opacity:${dayCycleOn ? 1 : 0}`
      : `animation:${dayCycleOn ? 'detailFadeIn' : 'detailFadeOut'} ${_dcAnimDur}s ease both ${(-_dcElapsed).toFixed(2)}s`;

    const _dAnim = (i, n=8, fadeInName='detailFadeIn', fadeOutName='detailFadeOut') => {
      if (_elapsed >= _animWindow) return '';
      const name  = overlayVisible ? fadeInName : fadeOutName;
      const delay = overlayVisible ? (i * 0.06) : ((n - 1 - i) * 0.06);
      if (_elapsed > delay + _animDur + 0.05) return '';
      return `animation:${name} ${_animDur}s ease both ${(delay - _elapsed).toFixed(2)}s`;
    };
    // -- Render deduplication --------------------------------------------------
    // Skip full DOM rebuild when no card-relevant values have changed.
    // HA fires hass updates for every entity in the system; we only care
    // about our ~30 sensors.  Sky gradient refreshes once per minute.
    const _renderKey = [
      solar_w, grid_imp_w, grid_exp_w, bat_chg_w, bat_dis_w, home_w, bPct,
      inv_temp, amb_temp, bat_temp, hasCellTempLow, cell_temp_low, hasCellTempHigh, cell_temp_high, bat_soh,
      inv_state, inv_fault, workMode, grid_volt, grid_curr,
      pv1_power_kw, pv1_current, pv1_voltage,
      pv2_power_kw, pv2_current, pv2_voltage,
      pv3_power_kw, pv3_current, pv3_voltage,
      pv4_power_kw, pv4_current, pv4_voltage,
      evcPowerConfigured, evc_power_kw, evcStatusConfigured, evc_status, evcUnpluggedStatus, evcPluggedIn,
      dayCycleOn, sunEntity, sunState, Math.round(sunElevation * 10) / 10, sunRising,
      overlayVisible, weatherState, c.background_image ? bgImage : bgImageKey,
      Math.floor(Date.now() / 60000)
    ].join('\u0000');
    if (_renderKey === this._lastRenderKey) return;
    this._lastRenderKey = _renderKey;

    //  Clouds 
    const _cDayW   = _sky.top;
    const _cNightT = Math.max(0, 1 - _cDayW * 3);
    const _cR  = Math.round(Math.min(255, 255*0.93 + _sky.sr*0.07) * (1-_cNightT) + 155 * _cNightT);
    const _cG  = Math.round(Math.min(255, 255*0.93 + _sky.sg*0.07) * (1-_cNightT) + 168 * _cNightT);
    const _cB  = Math.round(Math.min(255, 255*0.93 + _sky.sb*0.07) * (1-_cNightT) + 190 * _cNightT);
    const _cFl = `rgba(${_cR},${_cG},${_cB},0.92)`;
    const _cSh = `rgba(${Math.max(195,_cR-45)},${Math.max(204,_cG-36)},${Math.min(255,_cB+14)},0.46)`;
    const _cBase = dayCycleOn ? parseFloat(Math.max(0.18, Math.min(0.62, _sky.top * 1.05 + _cNightT * 0.18)).toFixed(3)) : 0.18;
    const _cDefs = [
      ['cfar', 57, 0.46, 389, 0.322, 0.28, 11, 89, [[-14,-9,10],[0,-14,13],[16,-9,9]]],
      ['cfar', 67, 0.55, 461, 0.508, 0.22, 9,  91, [[-20,-7,11],[-4,-13,15],[14,-8,11],[27,-3,7]]],
      ['cfar', 48, 0.41, 503, 0.614, 0.19, 15, 85, [[-12,-7,9],[2,-11,11],[18,-6,8]]],
      ['cblur',84, 0.64, 251, 0.281, 0.32, 10, 90, [[-28,-10,15],[-8,-17,20],[12,-15,18],[32,-9,14]]],
      ['cblur',79, 0.71, 281, 0.548, 0.28, 8,  92, [[-34,-9,14],[-14,-16,19],[7,-19,22],[26,-13,17],[42,-5,11]]],
      ['cblur',99, 0.74, 167, 0.244, 0.38, 12, 88, [[-36,-12,17],[-13,-20,24],[9,-18,22],[31,-11,18],[50,-3,12]]],
      ['cblur',112,0.80, 191, 0.501, 0.34, 10, 90, [[-32,-8,16],[-11,-16,21],[11,-14,19],[31,-6,15]]],
      ['cblur',91, 0.67, 223, 0.732, 0.30, 14, 86, [[-29,-7,14],[-6,-13,19],[14,-11,17],[33,-4,12]]],
    ];
    const _cNowSec = _now / 1000;
    let _cKf = '', _cSvg = '';
    for (let i = 0; i < _cDefs.length; i++) {
      const [flt, y, sc, dur, pf, opF, fi, fo, bl] = _cDefs[i];
      const op  = parseFloat((_cBase * opF).toFixed(3));
      const del = -((_cNowSec + dur * pf) % dur);
      const fiPeak = Math.min(fi + 8, fo - 8);
      const foPeak = Math.max(fo - 6, fi + 9);
      _cKf += `@keyframes cld${i}{0%{opacity:0;transform:translateX(-360px)}${fi}%{opacity:0}${fiPeak}%{opacity:${op}}${foPeak}%{opacity:${op}}${fo}%{opacity:0}100%{opacity:0;transform:translateX(960px)}}`;
      const lft = Math.min(...bl.map(b => b[0]*sc - b[2]*sc));
      const rgt = Math.max(...bl.map(b => b[0]*sc + b[2]*sc));
      let el = `<ellipse cx="${((lft+rgt)/2).toFixed(1)}" cy="${(y+7*sc).toFixed(1)}" rx="${((rgt-lft)/2*0.80).toFixed(1)}" ry="${(6*sc).toFixed(1)}" fill="${_cSh}"/>`;
      for (const [bx, by, br] of bl) el += `<circle cx="${(bx*sc).toFixed(1)}" cy="${(y+by*sc).toFixed(1)}" r="${(br*sc).toFixed(1)}" fill="${_cFl}"/>`;
      _cSvg += `<g filter="url(#${flt})" style="animation:cld${i} ${dur}s ${del}s linear infinite">${el}</g>`;
    }

    //  Stars 
    const _starOp = dayCycleOn ? parseFloat((_cNightT * 0.75).toFixed(3)) : 0;
    const _starExclude = (x, y) => x > 220 && x < 390 && y < 70;
    let _stSvg = '';
    if (_starOp > 0.01) {
      let _rng = 0xA3C59D;
      const _lcg = () => { _rng = ((_rng * 1664525 + 1013904223) & 0xFFFFFFFF) >>> 0; return _rng / 0xFFFFFFFF; };
      const _sDefs = [];
      let _attempts = 0;
      while (_sDefs.length < 50 && _attempts < 200) {
        _attempts++;
        const x   = 10  + _lcg() * 580;
        const y   = 18  + _lcg() * 72;
        const r   = 0.35 + _lcg() * 0.9;
        const op  = 0.28 + _lcg() * 0.42;
        const dur = 2.3 + _lcg() * 5.8;
        const pf  = _lcg();
        if (!_starExclude(x, y)) _sDefs.push([x, y, r, op, dur, pf]);
      }
      for (let i = 0; i < _sDefs.length; i++) {
        const [sx, sy, sr, sOp, sDur, sPf] = _sDefs[i];
        const lo  = parseFloat((sOp * 0.30 * _starOp).toFixed(3));
        const hi  = parseFloat((sOp * _starOp).toFixed(3));
        const del = -((_cNowSec + sDur * sPf) % sDur);
        const flt = sr > 0.85 ? ' filter="url(#stglow)"' : '';
        _stSvg += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(2)}"${flt} fill="white" style="animation:stTwinkle${i} ${sDur.toFixed(2)}s ${del.toFixed(2)}s ease-in-out infinite"/>`;
        _stSvg = `<style>@keyframes stTwinkle${i}{0%,100%{opacity:${lo}}50%{opacity:${hi}}}</style>` + _stSvg;
      }
    }

    //  Weather clouds 
    let _wSvg = '', _wKf = '';
    if (weatherActive && !weatherFoggy) {
      const _wDefs = weatherRainy ? [
        ['cblur', 52, 0.92, 83, 0.072, 0.58, 5, 95, [[-50,-14,22],[-22,-26,30],[8,-24,28],[38,-16,24],[62,-5,16]]],
        ['cblur', 46, 0.88, 89, 0.040, 0.53, 5, 95, [[-46,-13,21],[-20,-24,28],[8,-22,26],[36,-14,22],[58,-4,15]]],
        ['cblur', 44, 0.85, 97, 0.218, 0.54, 6, 94, [[-44,-12,19],[-18,-22,25],[10,-20,23],[34,-11,19],[54,-3,13]]],
        ['cblur', 53, 0.84, 103, 0.150, 0.52, 6, 94, [[-42,-12,19],[-17,-21,25],[9,-19,23],[34,-11,19],[54,-3,13]]],
        ['cfar',  36, 0.52, 149, 0.229, 0.44, 8, 92, [[-16,-8,11],[0,-13,14],[17,-9,11],[30,-4,8]]],
        ['cblur', 62, 0.90, 127, 0.310, 0.55, 6, 94, [[-44,-14,20],[-18,-23,28],[8,-21,26],[35,-13,22],[57,-4,15]]],
        ['cblur', 60, 0.88, 107, 0.391, 0.52, 7, 93, [[-40,-12,19],[-15,-21,25],[10,-19,23],[34,-10,19],[52,-3,13]]],
        ['cfar',  37, 0.50, 109, 0.420, 0.43, 8, 92, [[-17,-9,12],[0,-14,15],[18,-9,12],[32,-4,9]]],
        ['cblur', 42, 0.94, 167, 0.451, 0.55, 5, 95, [[-48,-15,22],[-20,-25,29],[9,-23,27],[36,-13,23],[58,-4,15]]],
        ['cblur', 48, 0.80, 131, 0.488, 0.50, 6, 94, [[-38,-11,17],[-13,-20,23],[11,-18,21],[33,-9,17]]],
        ['cblur', 57, 0.82, 139, 0.560, 0.51, 7, 93, [[-38,-11,17],[-14,-20,22],[10,-17,20],[30,-9,16],[48,-2,11]]],
        ['cblur', 55, 0.78, 113, 0.634, 0.50, 7, 93, [[-34,-10,16],[-11,-18,21],[10,-16,19],[30,-8,15],[48,-2,11]]],
        ['cblur', 43, 0.86, 121, 0.680, 0.50, 6, 94, [[-40,-12,18],[-15,-21,24],[9,-19,22],[33,-10,18],[52,-3,12]]],
        ['cfar',  33, 0.48, 191, 0.712, 0.40, 9, 91, [[-14,-7,10],[2,-11,12],[18,-7,10],[30,-3,7]]],
        ['cblur', 59, 0.76, 163, 0.770, 0.49, 7, 93, [[-36,-10,16],[-12,-18,21],[10,-16,19],[30,-8,15],[47,-2,11]]],
        ['cblur', 58, 0.86, 157, 0.823, 0.52, 6, 94, [[-42,-13,19],[-16,-22,26],[9,-20,24],[32,-11,20],[50,-3,14]]],
        ['cfar',  34, 0.46, 179, 0.870, 0.38, 9, 91, [[-15,-8,11],[2,-12,13],[18,-8,10],[30,-3,7]]],
        ['cblur', 50, 0.92, 193, 0.930, 0.54, 5, 95, [[-48,-14,22],[-21,-25,29],[8,-23,27],[36,-13,23],[58,-4,15]]],
      ] : [
        ['cblur', 96, 0.88, 97, 0.144, 0.50, 7, 93, [[-42,-12,19],[-16,-22,26],[9,-20,24],[34,-12,20],[56,-4,14]]],
        ['cblur', 82, 0.80, 113, 0.483, 0.44, 9, 91, [[-36,-10,16],[-12,-18,22],[12,-16,20],[32,-8,16]]],
        ['cfar',  62, 0.52, 149, 0.617, 0.36, 10, 90, [[-17,-9,11],[0,-14,14],[17,-9,11],[30,-4,8]]],
        ['cblur', 74, 0.70, 167, 0.312, 0.42,  8, 92, [[-30,-8,14],[-8,-15,18],[10,-13,16],[28,-6,12]]],
      ];
      const _wDarken = weatherRainy ? 0.48 : 0.74;
      const _wCR  = Math.max(0, Math.round(_cR * _wDarken));
      const _wCG  = Math.max(0, Math.round(_cG * _wDarken));
      const _wCB  = Math.max(0, Math.round(_cB * (weatherRainy ? 0.52 : 0.78)));
      const _wFl  = `rgba(${_wCR},${_wCG},${_wCB},0.95)`;
      const _wSh  = `rgba(${Math.max(0,_wCR-30)},${Math.max(0,_wCG-25)},${Math.min(255,_wCB+8)},0.55)`;
      const _wBase = weatherRainy ? 0.55 : 0.42;
      for (let i = 0; i < _wDefs.length; i++) {
        const [flt, y, sc, dur, pf, opF, fi, fo, bl] = _wDefs[i];
        const op  = parseFloat(Math.min(0.95, _wBase * opF * (weatherRainy ? 1.8 : 1.5)).toFixed(3));
        const del = -((_cNowSec + dur * pf) % dur);
        const fiPeak = Math.min(fi + 8, fo - 8);
        const foPeak = Math.max(fo - 6, fi + 9);
        _wKf += `@keyframes wcld${i}{0%{opacity:0;transform:translateX(-360px)}${fi}%{opacity:0}${fiPeak}%{opacity:${op}}${foPeak}%{opacity:${op}}${fo}%{opacity:0}100%{opacity:0;transform:translateX(960px)}}`;
        const lft = Math.min(...bl.map(b => b[0]*sc - b[2]*sc));
        const rgt = Math.max(...bl.map(b => b[0]*sc + b[2]*sc));
        let el = `<ellipse cx="${((lft+rgt)/2).toFixed(1)}" cy="${(y+7*sc).toFixed(1)}" rx="${((rgt-lft)/2*0.80).toFixed(1)}" ry="${(6*sc).toFixed(1)}" fill="${_wSh}"/>`;
        for (const [bx, by, br] of bl) el += `<circle cx="${(bx*sc).toFixed(1)}" cy="${(y+by*sc).toFixed(1)}" r="${(br*sc).toFixed(1)}" fill="${_wFl}"/>`;
        _wSvg += `<g filter="url(#${flt})" style="animation:wcld${i} ${dur}s ${del}s linear infinite">${el}</g>`;
      }
    }

    //  Rain 
    let _rainSvg = '', _rKf = '';
    if (weatherRainy) {
      let _rRng = 0xC4D7E2;
      const _rLcg = () => { _rRng = ((_rRng * 1664525 + 1013904223) & 0xFFFFFFFF) >>> 0; return _rRng / 0xFFFFFFFF; };
      for (let i = 0; i < 45; i++) {
        const rx   = _rLcg() * 620 - 10;
        const rop  = parseFloat((0.12 + _rLcg() * 0.15).toFixed(3));
        const rdur = parseFloat((0.50 + _rLcg() * 0.70).toFixed(2));
        const rpf  = _rLcg();
        const rlen = parseFloat((12 + _rLcg() * 12).toFixed(1));
        const rdel = parseFloat(-((_cNowSec + rdur * rpf) % rdur).toFixed(2));
        const rdx  = parseFloat((rlen * 0.25).toFixed(1));
        _rKf += `@keyframes rf${i}{0%{transform:translateY(-40px)}100%{transform:translateY(440px)}}`;
        _rainSvg += `<g style="animation:rf${i} ${rdur}s ${rdel}s linear infinite">` +
          `<line x1="${rx.toFixed(1)}" y1="${(-rlen).toFixed(1)}" x2="${(rx+rdx).toFixed(1)}" y2="0" ` +
          `stroke="rgba(174,200,225,${rop})" stroke-width="0.9" stroke-linecap="round"/></g>`;
      }
    }

    //  Sky gradient stops 
    const _sc   = _sky.sunC;
    const _pct  = v => (v * 100).toFixed(1) + '%';
    const _skFd = _pct(Math.max(0.16, _sc - 0.08));
    const _skFl = _pct(Math.max(0.18, _sc - 0.05));
    const _hrzn = _pct(Math.max(0.19, _sc - 0.03));
    const _snOt = _pct(Math.max(0.20, _sc - 0.015));
    const _snMd = _pct(_sc);
    const _snCr = _pct(Math.min(0.72, _sc + 0.04));
    const _lwSk = _pct(Math.min(0.77, _sc + 0.10));
    const _dkEd = _pct(Math.min(0.82, _sc + 0.18));

    //  Force-discharge dollar signs 
    let _dollarSvg = '';
    if (forceDischarge) {
      const _dur = 2.7;
      const _phase = (Date.now() % (_dur * 1000)) / 1000;
      const _b0 = (-_phase).toFixed(2) + 's';
      const _b1 = (-_phase + 0.9 > 0 ? -_phase + 0.9 - _dur : -_phase + 0.9).toFixed(2) + 's';
      const _b2 = (-_phase + 1.8 > 0 ? -_phase + 1.8 - _dur : -_phase + 1.8).toFixed(2) + 's';
      _dollarSvg = `<g filter="url(#ng)">
        <text x="38" y="0" font-family="sans-serif" font-size="17" font-weight="700" fill="#4ade80" text-anchor="middle">$
          <animate attributeName="y" from="130" to="28" dur="${_dur}s" begin="${_b0}" repeatCount="indefinite" calcMode="spline" keySplines="0.2 0 0.8 1"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.78;1" dur="${_dur}s" begin="${_b0}" repeatCount="indefinite"/>
        </text>
        <text x="52" y="0" font-family="sans-serif" font-size="13" font-weight="700" fill="#4ade80" text-anchor="middle">$
          <animate attributeName="y" from="120" to="22" dur="${_dur}s" begin="${_b1}" repeatCount="indefinite" calcMode="spline" keySplines="0.2 0 0.8 1"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.78;1" dur="${_dur}s" begin="${_b1}" repeatCount="indefinite"/>
        </text>
        <text x="24" y="0" font-family="sans-serif" font-size="11" font-weight="700" fill="#4ade80" text-anchor="middle">$
          <animate attributeName="y" from="135" to="32" dur="${_dur}s" begin="${_b2}" repeatCount="indefinite" calcMode="spline" keySplines="0.2 0 0.8 1"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.78;1" dur="${_dur}s" begin="${_b2}" repeatCount="indefinite"/>
        </text>
      </g>`;
    }

    //  Format helpers 
    const fmtVal  = w => w >= 1000 ? (w / 1000).toFixed(2) : Math.round(w);
    const fmtUnit = w => w >= 1000 ? 'kW' : 'W';

    //  Full SVG 
    const html = `
      <style>
        :host { display: block; }
        ha-card { background: ${Cardbg}; border-radius: 16px; padding: 10px; overflow: hidden; font-family: sans-serif; color: white; }
        .wrap { position: relative; width: 100%; box-sizing: border-box; margin: 0; user-select: none; }
        svg { width: 100%; height: auto; display: block; border-radius: 12px; overflow: hidden; }
      </style>
      <ha-card>
        <div class="wrap">
          <svg viewBox="0 0 600 492" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="ng" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="lg" x="-20" y="-20" width="640" height="500" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="2.5" result="b">
                  <animate attributeName="stdDeviation" values="1;3.5;1" dur="2.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
                </feGaussianBlur>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="sg" x="-50%" y="-500%" width="200%" height="1100%">
                <feGaussianBlur stdDeviation="1.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="stglow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="1.2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="cfar" x="-35%" y="-100%" width="170%" height="300%">
                <feGaussianBlur stdDeviation="6.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="cblur" x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <clipPath id="rclip">
                <path d="M 12,0 L 588,0 Q 600,0 600,12 L 600,400 L 0,400 L 0,12 Q 0,0 12,0 Z"/>
              </clipPath>
              <clipPath id="rainclip">
                <rect x="0" y="30" width="600" height="170"/>
              </clipPath>
              <linearGradient id="wOverlayFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="rgb(40,48,65)" stop-opacity="0.70"/>
                <stop offset="55%"  stop-color="rgb(40,48,65)" stop-opacity="0.70"/>
                <stop offset="100%" stop-color="rgb(40,48,65)" stop-opacity="0"/>
              </linearGradient>
              <style>
                @keyframes pulseBlue{0%,100%{text-shadow:0 0 1px #60a5fa,0 0 8px #3b82f6}50%{text-shadow:0 0 3px #93c5fd,0 0 11px #3b82f6,0 0 28px #1d4ed8}}
                @keyframes pulseGreen{0%,100%{text-shadow:0 0 1px #34d399,0 0 8px #16a34a}50%{text-shadow:0 0 3px #86efac,0 0 11px #16a34a,0 0 28px #15803d}}
                @keyframes detailFadeIn{0%{opacity:0}100%{opacity:1}}
                @keyframes detailFadeOut{0%{opacity:1}100%{opacity:0}}
                @keyframes grdVolFadeIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
                @keyframes grdVolFadeOut{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(8px)}}
                @keyframes batTmpFadeIn{0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)}}
                @keyframes batTmpFadeOut{0%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(-8px)}}
                @keyframes rtlFadeIn{0%{opacity:0;transform:translateX(8px)}100%{opacity:1;transform:translateX(0)}}
                @keyframes rtlFadeOut{0%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(8px)}}
                ${_cKf}
                ${_wKf}
                ${_rKf}
              </style>
              <linearGradient id="skyCycleGrad" x1="0" y1="0" x2="0" y2="1.0">
                <stop offset="0%"       stop-color="#14141D" stop-opacity="1"/>
                <stop offset="5%"       stop-color="#14141D" stop-opacity="1"/>
                <stop offset="${_skFd}" stop-color="rgb(${_sky.tr},${_sky.tg},${_sky.tb})" stop-opacity="${parseFloat((_sky.top * 0.8).toFixed(3))}"/>
                <stop offset="${_skFl}" stop-color="rgb(${_sky.tr},${_sky.tg},${_sky.tb})" stop-opacity="${_sky.top}"/>
                <stop offset="${_hrzn}" stop-color="rgb(${_sky.ltr},${_sky.ltg},${_sky.ltb})" stop-opacity="${_sky.top}"/>
                <stop offset="${_snOt}" stop-color="rgb(${_sky.sr},${_sky.sg},${_sky.sb})" stop-opacity="${_sky.sun}"/>
                <stop offset="${_snMd}" stop-color="rgb(${_sky.s2r},${_sky.s2g},${_sky.s2b})" stop-opacity="${_sky.sun}"/>
                <stop offset="${_snCr}" stop-color="rgb(${_sky.s3r},${_sky.s3g},${_sky.s3b})" stop-opacity="${parseFloat((_sky.sun * 0.85).toFixed(3))}"/>
                <stop offset="${_lwSk}" stop-color="rgb(${_sky.ltr},${_sky.ltg},${_sky.ltb})" stop-opacity="${parseFloat((_sky.top * 0.4).toFixed(3))}"/>
                <stop offset="${_dkEd}" stop-color="#14141D" stop-opacity="1"/>
                <stop offset="100%"    stop-color="#14141D" stop-opacity="1"/>
              </linearGradient>
            </defs>

            <rect width="600" height="460" fill="${Cardbg}"/>
            <rect width="600" height="400" fill="url(#skyCycleGrad)" clip-path="url(#rclip)" style="${_dcStyle}"/>
            <g clip-path="url(#rclip)" style="${_dcStyle}">${_stSvg}</g>
            <g style="${_dcStyle}" clip-path="url(#rclip)">${_cSvg}</g>

            ${weatherActive ? `<g style="${_dcStyle}">
              ${weatherFoggy
                ? `<rect width="600" height="400" fill="rgba(200,205,215,0.30)" clip-path="url(#rclip)"/>`
                : weatherRainy
                  ? `<rect width="600" height="230" fill="url(#wOverlayFade)" clip-path="url(#rclip)"/>`
                  : `<rect width="600" height="230" fill="rgba(50,55,72,0.24)" clip-path="url(#rclip)"/>`}
              ${!weatherFoggy ? `<g clip-path="url(#rclip)">${_wSvg}</g>` : ''}
              ${weatherRainy ? `<g clip-path="url(#rainclip)">${_rainSvg}</g>` : ''}
            </g>` : ''}

            <image href="${bgImage}"
                   x="0" y="0" width="600" height="400"
                   preserveAspectRatio="xMidYMid meet"
                   clip-path="url(#rclip)"/>

            <rect width="600" height="400" fill="rgba(2,4,18,0)" clip-path="url(#rclip)"/>
            <rect x="0" y="375" width="600" height="117" fill="${Cardbg}"/>

            ${wire(dSol,    C_SOL, solar_on, (solar_on && charging && !forceCharge) ? C_SOL : null)}
            ${wire(dBatDwn, C_BAT, charging || discharge, (charging || forceCharge) ? C_BAT : null)}
            <path d="${dGrdIn}" stroke="${forceCharge ? C_GRD : 'url(#grdExitFade)'}" stroke-width="3.5" fill="none"
              opacity="${(importing || exporting) ? 0.55 : 0.25}" stroke-linecap="round"
              stroke-linejoin="round" ${forceCharge ? 'filter="url(#lg)"' : ''}/>
            ${wire(dHom,    C_HOM, home_on)}
            ${wire(dConnOut, C_INV, importing || exporting || home_on || solar_on || discharge, forceCharge ? C_GRD : null)}

            <defs>
              ${wireMask('mSol',    dSol)}
              ${wireMask('mBatDwn', dBatDwn)}
              ${wireMask('mBatUp',  dBatUp)}
              ${wireMask('mGrdIn',  dGrdIn)}
              ${wireMask('mGrdOut', dGrdOut)}
              ${wireMask('mHom',    dHom)}
              ${wireMask('mConOut', dConnOut)}
              ${wireMask('mConIn',  dConnIn)}
              <linearGradient id="grdExitFade" gradientUnits="userSpaceOnUse"
                x1="${GRD_EXIT_X}" y1="${GRD_EXIT_Y}"
                x2="${GRD_EXIT_X + Math.round((GRD_CORN_X - GRD_EXIT_X) * 0.55)}" y2="${GRD_EXIT_Y + Math.round((GRD_CORN_Y - GRD_EXIT_Y) * 0.55)}">
                <stop offset="0%"   stop-color="#828282" stop-opacity="0"/>
                <stop offset="100%" stop-color="#525252" stop-opacity="1"/>
              </linearGradient>
            </defs>

            ${solar_on  ? `<g mask="url(#mSol)">${flowDots(dSol,     C_SOL, '2.2s', 1)}</g>` : ''}
            ${charging  ? `<g mask="url(#mBatDwn)">${flowDots(dBatDwn, C_BAT, '1.8s', 1, 10)}</g>` : ''}
            ${discharge ? `<g mask="url(#mBatUp)">${flowDots(dBatUp,  C_BAT, '1.8s', 1, 10)}</g>` : ''}
            ${importing ? `<g mask="url(#mGrdIn)">${flowDots(dGrdIn,  C_GRD, '3.4s')}</g>` : ''}
            ${exporting ? `<g mask="url(#mGrdOut)">${flowDots(dGrdOut, C_GRD, '1.5s', 1, 60, jPhaseOut)}</g>` : ''}
            ${home_on   ? `<g mask="url(#mHom)">${flowDots(dHom,    C_HOM, '1.5s', 1, 30, jPhaseOut)}</g>` : ''}
            ${(solar_on || discharge || exporting) && !(forceCharge && importing) ? `<g mask="url(#mConOut)">${flowDots(dConnOut, C_INV, '1.5s', 1, 30, jPhase)}</g>` : ''}
            ${importing && (charging || forceCharge) ? `<g mask="url(#mConIn)">${flowDots(dConnIn, forceCharge ? C_GRD : C_INV, '1.4s', 1)}</g>` : ''}

            <!-- Detail overlay -->
            ${c.inverter_temp_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(0, 8, 'batTmpFadeIn', 'batTmpFadeOut')}">
              <text x="250" y="188" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Inv. Temp</text>
              <text x="250" y="207" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="16" fill="#ffffff">${inv_temp}<tspan dx="2" font-size="11" font-weight="400" fill="#ccc">°C</tspan></text>
            </g>` : ''}
            ${c.battery_temp_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(1, 8, 'batTmpFadeIn', 'batTmpFadeOut')}">
              <text x="260" y="246" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Batt. Temp</text>
              <text x="260" y="265" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="16" fill="#ffffff">${bat_temp}<tspan dx="2" font-size="11" font-weight="400" fill="#ccc">°C</tspan></text>
              ${hasCellTempLow ? `<text x="260" y="285" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="13" fill="#bedbff"><tspan dx="1" font-size="11" font-weight="400" fill="#ccc">low </tspan>${cell_temp_low}<tspan dx="1" font-size="10" font-weight="400" fill="#ccc">°C</tspan></text>` : ''}
              ${hasCellTempHigh ? `<text x="260" y="${hasCellTempLow ? 302 : 285}" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="13" fill="#ffa8a8"><tspan dx="1" font-size="11" font-weight="400" fill="#ccc">high </tspan>${cell_temp_high}<tspan dx="1" font-size="10" font-weight="400" fill="#ccc">°C</tspan></text>` : ''}
            </g>` : ''}
            ${c.grid_voltage_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(2, 8, 'grdVolFadeIn', 'grdVolFadeOut')}">
              <text x="${GRD_EXIT_X + 12}" y="${GRD_EXIT_Y - 23}" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Grid Vol</text>
              <text x="${GRD_EXIT_X + 12}" y="${GRD_EXIT_Y - 4}" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="16" fill="#fff">${grid_volt}<tspan dx="2" font-size="11" font-weight="400" fill="#ccc">V</tspan></text>
            </g>` : ''}
            ${c.grid_current_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(3, 8, 'rtlFadeIn', 'rtlFadeOut')}">
              <text x="${INV_X - 58}" y="${INV_Y - 43}" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Inv. Curr</text>
              <text x="${INV_X - 58}" y="${INV_Y - 24}" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="16" fill="#fff">${grid_curr}<tspan dx="2" font-size="11" font-weight="400" fill="#ccc">A</tspan></text>
            </g>` : ''}
            ${c.ambient_temp_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(4, 8, 'rtlFadeIn', 'rtlFadeOut')}">
              <text x="${INV_X - 74}" y="${INV_Y + 17}" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Amb. Tmp</text>
              <text x="${INV_X - 68}" y="${INV_Y + 36}" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="16" fill="#fff">${amb_temp}<tspan dx="2" font-size="11" font-weight="400" fill="#ccc">°C</tspan></text>
            </g>` : ''}
            ${c.battery_soh_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(5)}">
              <text x="585" y="18" text-anchor="end" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Batt. Health</text>
              <text x="585" y="35" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14" fill="#34d399">${bat_soh}<tspan dx="2" font-size="11" font-weight="400" fill="#ccc">%</tspan></text>
            </g>` : ''}
            ${(c.inverter_fault_sensor || c.weather_entity) ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(6)}">
              ${c.inverter_fault_sensor ? `<text x="585" y="56" text-anchor="end" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Faults</text>
              <text x="585" y="72" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14"
                fill="${inv_fault === 'None' ? '#34d399' : inv_fault === '0' || inv_fault === 'N/A' ? '#6b7280' : '#f87171'}">${inv_fault}</text>` : ''}
              ${c.weather_entity ? `<text x="585" y="94" text-anchor="end" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#ccc">Weather</text>
              <text x="585" y="110" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14"
                fill="${weatherRainy ? '#93c5fd' : weatherCloudy ? '#d1d5db' : weatherFoggy ? '#e5e7eb' : '#34d399'}">${weatherState || 'clear'}</text>` : ''}
            </g>` : ''}
            ${(c.pv1_power_sensor || c.pv2_power_sensor || c.pv3_power_sensor || c.pv4_power_sensor) ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(8, 8)}">
              <line x1="348" y1="62" x2="425" y2="165" stroke="#828282" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
            </g>
            <g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(7, 8)}">
              <line x1="270" y1="135" x2="488" y2="94" stroke="#828282" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
            </g>` : ''}
            ${c.pv1_power_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(7, 8)}">
              <g>
                <text x="280" y="77" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#fff">PV1 Power</text>
                <text x="280" y="95" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="15" fill="#ffffff">${pv1_power_kw.toFixed(2)}<tspan dx="2" font-size="10" font-weight="400" fill="#ffffff">kW</tspan></text>
                <text x="280" y="112" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="12" fill="#ffffff">${pv1_current}<tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">A</tspan><tspan dx="6" font-weight="700" font-size="12" fill="#ffffff">${pv1_voltage}</tspan><tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">V</tspan></text>
              </g>
            </g>` : ''}
            ${c.pv2_power_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(7, 8)}">
              <g>
                <text x="390" y="61" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#fff">PV2 Power</text>
                <text x="390" y="79" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="15" fill="#ffffff">${pv2_power_kw.toFixed(2)}<tspan dx="2" font-size="10" font-weight="400" fill="#ffffff">kW</tspan></text>
                <text x="390" y="96" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="12" fill="#ffffff">${pv2_current}<tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">A</tspan><tspan dx="6" font-weight="700" font-size="12" fill="#ffffff">${pv2_voltage}</tspan><tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">V</tspan></text>
              </g>
            </g>` : ''}
            ${c.pv3_power_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(9, 8)}">
              <g>
                <text x="330" y="136" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#fff">PV3 Power</text>
                <text x="330" y="154" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="15" fill="#ffffff">${pv3_power_kw.toFixed(2)}<tspan dx="2" font-size="10" font-weight="400" fill="#ffffff">kW</tspan></text>
                <text x="330" y="172" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="12" fill="#ffffff">${pv3_current}<tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">A</tspan><tspan dx="6" font-weight="700" font-size="12" fill="#ffffff">${pv3_voltage}</tspan><tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">V</tspan></text>
              </g>
            </g>` : ''}
            ${c.pv4_power_sensor ? `<g opacity="${overlayVisible ? '1' : '0'}" style="${_dAnim(10, 8)}">
              <g>
                <text x="430" y="116" text-anchor="start" font-family="sans-serif" font-size="10" letter-spacing="1.2" fill="#fff">PV4 Power</text>
                <text x="430" y="134" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="15" fill="#ffffff">${pv4_power_kw.toFixed(2)}<tspan dx="2" font-size="10" font-weight="400" fill="#ffffff">kW</tspan></text>
                <text x="430" y="152" text-anchor="start" font-family="sans-serif" font-weight="700" font-size="12" fill="#ffffff">${pv4_current}<tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">A</tspan><tspan dx="6" font-weight="700" font-size="12" fill="#ffffff">${pv4_voltage}</tspan><tspan dx="1" font-size="10" font-weight="400" fill="#ffffff">V</tspan></text>
              </g>
            </g>` : ''}

            ${evcVisible ? `<g class="evc-metrics">
              <line x1="${EVC_LINE_X}" y1="15" x2="${EVC_LINE_X}" y2="166" stroke="${SLINE_COLOR}" stroke-width="1" stroke-linecap="butt" vector-effect="non-scaling-stroke"/>
              <text x="${EVC_TEXT_X}" y="${EVC_LABEL_Y}" text-anchor="left" font-family="sans-serif" font-size="10" letter-spacing="1.5" fill="${weatherActive ? '#9ca3af' : '#6b7280'}">EVC</text>
              ${evcPowerConfigured ? `<text x="${EVC_TEXT_X}" y="${EVC_POWER_Y}" text-anchor="left" font-family="sans-serif" font-weight="700" font-size="18" fill="#ffffff">${evc_power_kw !== null ? fmtVal(evc_power_w) : '--'}<tspan dx="3" font-size="10" font-weight="400" fill="#ffffff">${evc_power_kw !== null ? fmtUnit(evc_power_w) : 'kW'}</tspan></text>` : ''}
              ${evcStatusConfigured ? `<text x="${EVC_TEXT_X}" y="${evcPowerConfigured ? EVC_STATUS_Y : EVC_POWER_Y}" text-anchor="left" font-family="sans-serif" font-weight="700" font-size="12" fill="#34d399">${evc_status || 'N/A'}</text>` : ''}
            </g>` : ''}

            <!-- Solar label -->
            <text x="${SOL_X + 10}" y="30" text-anchor="left" font-family="sans-serif" font-size="10" letter-spacing="1.5" fill="${weatherActive ? '#9ca3af' : '#6b7280'}">${solarLabel}</text>
            <text x="${SOL_X + 10}" y="50" text-anchor="left" font-family="sans-serif" font-weight="700" font-size="19" fill="#ffffff">${fmtVal(solar_w)}<tspan dx="3" font-size="11" font-weight="400" fill="#ffffff">${fmtUnit(solar_w)}</tspan></text>

            ${_dollarSvg}

            <!-- Stat accent lines -->
            <line x1="${GRD_LINE_X}" y1="${430 - GRD_LINE_LEN}" x2="${GRD_LINE_X}" y2="440" stroke="${SLINE_COLOR}" stroke-width="1" stroke-linecap="butt" vector-effect="non-scaling-stroke"/>
            <line x1="${BAT_LINE_X}" y1="${420 - BAT_LINE_LEN}" x2="${BAT_LINE_X}" y2="440" stroke="${SLINE_COLOR}" stroke-width="1" stroke-linecap="butt" vector-effect="non-scaling-stroke"/>
            <line x1="${HOM_LINE_X}" y1="${420 - HOM_LINE_LEN}" x2="${HOM_LINE_X}" y2="440" stroke="${SLINE_COLOR}" stroke-width="1" stroke-linecap="butt" vector-effect="non-scaling-stroke"/>
            <line x1="230" y1="70" x2="230" y2="15" stroke="${SLINE_COLOR}" stroke-width="1" stroke-linecap="butt" vector-effect="non-scaling-stroke"/>

            <!-- Stats strip -->
            <foreignObject x="20" y="380" width="600" height="110">
              <div xmlns="http://www.w3.org/1999/xhtml"
                   style="display:grid;grid-template-columns:1fr 1fr 1fr;height:100%;box-sizing:border-box;font-family:sans-serif;color:white;">
                <div style="padding:12px 0 0 12px;box-sizing:border-box;">
                  <div style="text-align:left;font-size:12px;color:#6b7280;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px;">Grid ${importing ? 'Importing' : exporting ? 'Exporting' : 'Idle'}</div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;line-height:1;">${fmtVal(importing ? grid_imp_w : exporting ? grid_exp_w : 0)}</span>
                    <span style="font-size:11px;color:#ffffff;">${fmtUnit(importing ? grid_imp_w : exporting ? grid_exp_w : 0)}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${C_GRD}" style="width:18px;height:18px;flex-shrink:0;">
                      ${importing
                        ? '<path d="M5.18 5.45L3.4 4.55L4.66 2H13.13L14.4 4.55L12.62 5.44L11.9 4H5.9L5.18 5.45M15.5 8H11L10.2 5H7.6L6.81 8H2.28L1 10.55L2.79 11.44L3.5 10H14.28L15 11.45L16.79 10.56L15.5 8M14.67 22H12.6L12.36 21.1L8.9 15.9L5.43 21.1L5.2 22H3.13L6 11H8.09L7.73 12.35L8.9 14.1L10.06 12.35L9.71 11H11.78L14.67 22M8.3 15L7.4 13.65L6.22 18.13L8.3 15M11.58 18.12L10.4 13.64L9.5 15L11.58 18.12M23 16L19 12V15H15V17H19V20L23 16Z"/>'
                        : '<path d="M11.39 5.45L9.61 4.55L10.87 2H19.34L20.61 4.55L18.83 5.44L18.11 4H12.11L11.39 5.45M21.73 8H17.2L16.41 5H13.81L13 8H8.5L7.21 10.55L9 11.44L9.73 10H20.5L21.21 11.45L23 10.56L21.73 8M20.88 22H18.81L18.57 21.1L15.11 15.9L11.64 21.1L11.41 22H9.34L12.23 11H14.3L13.94 12.35L15.11 14.1L16.27 12.35L15.92 11H18L20.88 22M14.5 15L13.61 13.65L12.43 18.13L14.5 15M17.79 18.12L16.61 13.64L15.71 15L17.79 18.12M9 16L5 12V15H1V17H5V20L9 16Z"/>'}
                    </svg>
                  </div>
                </div>
                <div style="padding:12px 0 0 12px;box-sizing:border-box;">
                  <div style="text-align:left;font-size:12px;color:#6b7280;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px;">Battery ${charging ? 'Charging' : discharge ? 'Discharging' : 'Idle'}</div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:22px;font-weight:700;color:${forceCharge ? '#93c5fd' : solarCharging ? '#86efac' : '#ffffff'};line-height:1;${forceCharge ? 'animation:pulseBlue 2.5s ease-in-out infinite;' : solarCharging ? 'animation:pulseGreen 2.5s ease-in-out infinite;' : ''}">${fmtVal(charging ? bat_chg_w : discharge ? bat_dis_w : 0)}</span>
                    <span style="font-size:11px;color:${forceCharge ? '#93c5fd' : solarCharging ? '#86efac' : '#ffffff'};">${fmtUnit(charging ? bat_chg_w : discharge ? bat_dis_w : 0)}</span>
                    <span style="padding-left:5px;font-size:15px;color:#374151;font-weight:300;margin:0 1px;"> | </span>
                    <span style="padding-left:5px;font-size:20px;font-weight:700;color:${forceCharge ? '#93c5fd' : '#34d399'};line-height:1;">${bPct}%</span>
                  </div>
                </div>
                <div style="padding:12px 0 0 12px;box-sizing:border-box;">
                  <div style="text-align:left;font-size:12px;color:#6b7280;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px;">Home - ${inv_state}</div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;line-height:1;">${fmtVal(home_w)}</span>
                    <span style="font-size:11px;color:#ffffff;">${fmtUnit(home_w)}</span>
                  </div>
                </div>
                <div style="grid-column:1/-1;margin-top:6px;padding:6px 0 0 12px;display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:#6b7280;letter-spacing:1.2px;text-transform:uppercase;">Inverter Mode</span>
                  <span style="font-size:13px;font-weight:600;color:${forceCharge ? '#93c5fd' : '#34d399'};${forceCharge ? 'animation:pulseBlue 2.5s ease-in-out infinite;' : solarCharging ? 'animation:pulseGreen 2.5s ease-in-out infinite;' : ''}">${workMode}</span>
                </div>
              </div>
            </foreignObject>

            <!-- Effects button -->
            <g data-action="toggle-effects" role="button" tabindex="0" aria-label="Toggle visual effects"
               style="cursor:pointer;outline:none;">
              <title>Toggle visual effects</title>
              <rect x="443" y="470" width="72" height="18" rx="4"
                fill="rgba(255,255,255,0.07)"
                stroke="${dayCycleOn ? 'rgba(133,133,133,0.4)' : 'rgba(255,255,255,0.1)'}"/>
              <circle cx="454" cy="479" r="3" fill="${dayCycleOn ? '#ccc' : 'rgba(255,255,255,0.2)'}"/>
              <text x="462" y="483" font-family="sans-serif" font-size="9" letter-spacing="1" fill="${dayCycleOn ? '#ccc' : 'rgba(255,255,255,0.3)'}">EFFECTS</text>
            </g>

            <!-- Details button -->
            <g data-action="toggle-details" role="button" tabindex="0" aria-label="Toggle details overlay"
               style="cursor:pointer;outline:none;">
              <title>Toggle details overlay</title>
              <rect x="523" y="470" width="72" height="18" rx="4"
                fill="rgba(255,255,255,0.07)"
                stroke="${overlayVisible ? 'rgba(133,133,133,0.4)' : 'rgba(255,255,255,0.1)'}"/>
              <circle cx="534" cy="479" r="3" fill="${overlayVisible ? '#ccc' : 'rgba(255,255,255,0.2)'}"/>
              <text x="542" y="483" font-family="sans-serif" font-size="9" letter-spacing="1" fill="${overlayVisible ? '#ccc' : 'rgba(255,255,255,0.3)'}">DETAILS</text>
            </g>

          </svg>
        </div>
      </ha-card>
    `;

    this.shadowRoot.innerHTML = html;
    this._bindControls(dayCycleOn, overlayVisible);
  }
}

customElements.define('energy-flow-card', EnergyFlowCard);

// Register with HA's custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-flow-card',
  name: 'Fox ESS Energy Card',
  description: 'Animated solar, battery and grid energy flow dashboard for FoxESS and compatible inverters.',
  preview: true,
  documentationURL: 'https://github.com/YOUR_USERNAME/energy-flow-card',
});
