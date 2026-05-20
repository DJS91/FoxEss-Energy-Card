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
- Day/night sky gradient linked to current time with sun rise/set
- Live weather clouds and rain overlay (sunny/Rainy/Cloudy states)
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

### Required Helper Entities - YOU NEED TO CREATE THESE SEPERATELY

<img width="531" height="51" alt="toggles" src="https://github.com/user-attachments/assets/95abc188-6067-479d-b9af-f83092291a96" />

Create these two helpers in HA (**Settings → Helpers → + Create Helper → Toggle**):

| Entity ID | Purpose |
|-----------|---------|
| `input_boolean.energy_house_image_day_cycle` | Enables the day/night sky gradient and weather effects |
| `input_boolean.energy_vision_details` | Shows the detail overlay (PV strings, temps, fault codes) |

You can then add these to your dashboard as toggles using the "Entities" card to control the card Details and Weather overlays.

---


## Card Configuration

Add the card to a dashboard and use the **visual editor** to map each sensor. All fields are optional — unmapped sensors default to `0` / `'N/A'`.

### Manual YAML example (FoxESS defaults)

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
# Overlay Toggles
weather_entity: weather.alexandra_hills_hourly
day_cycle_boolean: input_boolean.energy_house_image_day_cycle
details_overlay_boolean: input_boolean.energy_vision_details
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

**Overlay Toggles**

| Key | Description | Domain |
|-----|-------------|--------|
| `weather_entity` | Weather entity for cloud/rain effects | `weather` |
| `day_cycle_boolean` | Toggle day/night sky cycle | `input_boolean` |
| `details_overlay_boolean` | Toggle detail overlay | `input_boolean` |


---

## License
MIT

## Disclaimer
This card is is not affiliated with Fox ESS brand or company and is a custom fan creation.
