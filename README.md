# Fox ESS Energy Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/DJS91/FoxEss-Energy-Card.svg)](https://github.com/DJS91/FoxEss-Energy-Card/releases)

An animated solar/battery/grid energy flow dashboard for Home Assistant, based on Fox ESS app visuals but better — all sensors are configurable via the visual editor.

Best used if you are using the [FoxESS - Modbus](https://github.com/nathanmarlor/foxess_modbus) integration's available sensors, but not required.

<p float="left">
<img src="docs/Demo.gif" width="65%"/>
<img src="docs/Demo-forceCharge.gif" width="34%"/>
</p>

## Features
- Keep it clean or enable optional overlays for detailed monitoring.
- Animated energy flow on solar, battery, grid and home wires
- Day/night sky gradient linked to Home Assistant's `sun.sun` entity
- Live weather clouds and rain overlay (sunny/Rainy/Cloudy states)
- Optional EV charger power and status metrics above the garage
- Built-in day/night and EV plugged/unplugged background variants
- Detail overlay: MPPT/PV data, system temps, fault codes, battery health and more
- Force Charge / Force Discharge work mode indicators and unique animations
- Fully configurable — map any sensor to any field in the visual editor

---

## Installation

### Via HACS (recommended)

1. In HACS → **⋮** (three dots top right) → Custom Repositories
2. paste in **https://github.com/DJS91/FoxEss-Energy-Card** as Repository and select **Dashboard** Type and click **Add**
3. Search for **Fox ESS Energy Card** and install
4. Hard Refresh Browser and the card is now available.

<!--
1. In HACS → **Frontend** → **+ Explore & Download Repositories**
2. Search for **Fox ESS Energy Card** and install
3. Add the resource in **Settings → Dashboards → Resources** (HACS does this automatically)
-->

### Manual

1. Copy `dist/energy-flow-card.js` to `/config/www/energy-flow-card.js`
2. In HA: **Settings → Dashboards → Resources → Add Resource**
   - URL: `/local/energy-flow-card.js`
   - Type: `JavaScript module`

### Built-in Controls

The card toggles visual effects and the details overlay from the built-in buttons at the bottom right of the card. No Home Assistant helper toggles are required.

---

## Development

The source file at the repository root stays readable and references the PNG assets in `images/`. Build the minified HACS artifact with:

```bash
npm install
npm run build
```

The build writes `dist/energy-flow-card.js` and bakes the background images into that single distributable file.

---


## Card Configuration

Add the card to a dashboard and use the **visual editor** to map each sensor. All fields are optional — unmapped sensors default to `0` / `'N/A'`.

### Manual YAML example

```yaml
type: custom:energy-flow-card
# Base Energy Sensors
grid_feed_in_sensor: sensor.foxessinverter_feed_in
grid_consumption_sensor: sensor.foxessinverter_grid_consumption
battery_charge_sensor: sensor.foxessinverter_battery_charge
battery_discharge_sensor: sensor.foxessinverter_rpower
battery_soc_sensor: sensor.foxessinverter_battery_soc
load_power_sensor: sensor.foxessinverter_load_power
inverter_state_sensor: sensor.foxessinverter_inverter_state
work_mode_select: select.foxessinverter_work_mode
solar_label: GEN LOAD  # optional label override
solar_generation_sensor: sensor.foxessinverter_genload
# EV Charger
evc_power_sensor: sensor.ev_charger_power
evc_status_sensor: sensor.ev_charger_status
evc_unplugged_status: Unplugged
# Inverter Details
inverter_temp_sensor: sensor.foxessinverter_invtemp
ambient_temp_sensor: sensor.foxessinverter_ambtemp
battery_temp_sensor: sensor.foxessinverter_battery_temp
cell_temp_low_sensor: sensor.foxessinverter_bms_cell_temp_low
cell_temp_high_sensor: sensor.foxessinverter_bms_cell_temp_high
# Grid Details
grid_voltage_sensor: sensor.foxessinverter_rvolt
grid_current_sensor: sensor.foxessinverter_rcurrent
# Top Right Details
battery_soh_sensor: sensor.foxessinverter_battery_soh
inverter_fault_sensor: sensor.foxessinverter_inverter_fault_code
# Solar / PV Details
pv1_power_sensor: sensor.foxessinverter_pv1_power
pv1_current_sensor: sensor.foxessinverter_pv1_current
pv1_voltage_sensor: sensor.foxessinverter_pv1_voltage
pv2_power_sensor: sensor.foxessinverter_pv2_power
pv2_current_sensor: sensor.foxessinverter_pv2_current
pv2_voltage_sensor: sensor.foxessinverter_pv2_voltage
pv3_power_sensor: sensor.foxessinverter_pv3_power
pv3_current_sensor: sensor.foxessinverter_pv3_current
pv3_voltage_sensor: sensor.foxessinverter_pv3_voltage
pv4_power_sensor: sensor.foxessinverter_pv4_power
pv4_current_sensor: sensor.foxessinverter_pv4_current
pv4_voltage_sensor: sensor.foxessinverter_pv4_voltage
# Visual Effects
weather_entity: weather.alexandra_hills_hourly
sun_entity: sun.sun
```

### Config options reference

**Base Energy Sensors**

| Key | Description | Domain |
|-----|-------------|--------|
| `grid_feed_in_sensor` | Grid export / feed-in in **kW** | `sensor` |
| `grid_consumption_sensor` | Grid import / consumption in **kW** | `sensor` |
| `battery_charge_sensor` | Battery charge power in **kW** | `sensor` |
| `battery_discharge_sensor` | Battery discharge power in **kW** | `sensor` |
| `battery_soc_sensor` | Battery state of charge **%** | `sensor` |
| `load_power_sensor` | Home load power in **kW** | `sensor` |
| `inverter_state_sensor` | Inverter state string | `sensor` |
| `work_mode_select` | Work mode select entity | `select` |
| `solar_label` | Label shown above the solar node (default: `GEN LOAD`) | string |
| `solar_generation_sensor` | Solar generation in **kW** | `sensor` |

**EV Charger**

| Key | Description | Domain |
|-----|-------------|--------|
| `evc_power_sensor` | EV charger power in **kW** | `sensor` |
| `evc_status_sensor` | EV charger status string | `sensor` |
| `evc_unplugged_status` | Status value that means no EV is plugged in (default: `Unplugged`) | string |

**Inverter Details**

| Key | Description | Domain |
|-----|-------------|--------|
| `inverter_temp_sensor` | Inverter temperature °C | `sensor` |
| `ambient_temp_sensor` | Ambient temperature °C | `sensor` |
| `battery_temp_sensor` | Battery temperature °C | `sensor` |
| `cell_temp_low_sensor` | Battery cell low temp °C | `sensor` |
| `cell_temp_high_sensor` | Battery cell high temp °C | `sensor` |

**Grid Details**

| Key | Description | Domain |
|-----|-------------|--------|
| `grid_voltage_sensor` | Grid voltage V | `sensor` |
| `grid_current_sensor` | Grid current A | `sensor` |

**Top Right Details**

| Key | Description | Domain |
|-----|-------------|--------|
| `battery_soh_sensor` | Battery state of health % | `sensor` |
| `inverter_fault_sensor` | Inverter fault code | `sensor` |

**Solar / PV Details**

| Key | Description | Domain |
|-----|-------------|--------|
| `pv1_power_sensor` … `pv4_power_sensor` | PV string power kW | `sensor` |
| `pv1_current_sensor` … `pv4_current_sensor` | PV string current A | `sensor` |
| `pv1_voltage_sensor` … `pv4_voltage_sensor` | PV string voltage V | `sensor` |

**Visual Effects**

| Key | Description | Domain |
|-----|-------------|--------|
| `weather_entity` | Weather entity for cloud/rain effects. I use the BOM integration. it just needs to be a sensor that returns "Sunny" or "rainy" or "cloudy" keywords | `weather` |
| `sun_entity` | Home Assistant sun entity used for day/night sky cycle | `sun` |
| `background_image` | Optional static background URL. If set, it overrides the built-in day/night and EV background variants. | string |


---

## License
MIT

## Disclaimer
This card is is not affiliated with Fox ESS brand or company and is a custom fan creation.
