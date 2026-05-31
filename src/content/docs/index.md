---
title: Overview
description: Design notes, component rationale, and reference datasheets for the APRL ALI-2 instrumentation monorepo.
---

Each of the projects will have project-specific notes, but we wanted a place to store the datasheets we referenced, so we put them here and store them via git lfs. Additionally, we will document why we use specific chips here, too.

## Design Documents

| Document | Description |
|----------|-------------|
| [STM32Cube vs Embassy](stm32cube-and-embassy.md) | Original comparison doc — kept for reference. |
| [Load Cell Unit Log](load-cell-log.md) | Just a log of the load cells we have on hand. |
| [Firmware Design and Analysis](firmware-design-analysis.md) | Outlines the rationale for a proper Embassy+RTIC stack complete with PTP. |
| [Isolation Setup](isolation.md) | Galvanic isolation strategy for the ground station and vehicle. |
| [Valve FSM](fsm.md) | Finite-state-machine design for the valve driver. |

## Modules

The DPF instrumentation is split into ground-station and vehicle modules. Each board gets its own page.

### Ground Station

| Board | Role |
|-------|------|
| [Valve Driver (1A)](ground-station/valve-driver.md) | Drives the engine's solenoid valves. |
| [Thermocouple DAQ (2A)](ground-station/thermocouples-2a.md) | Thermocouple temperatures across the engine/propellant system. |
| [Load Cell DAQ (1A)](ground-station/load-cells.md) | Bridge-type load cells (thrust, weight). |
| [Pressure Transducer DAQ (1B)](ground-station/pressure-transducers-1b.md) | Pressure transducers across the propellant/pressurant system. |
| [Injector Accelerometer (1A)](ground-station/injector-accelerometer.md) | Engine vibration / shock (WIP). |
| [Thermocouple Board (1A)](ground-station/thermocouples-1a.md) | Original ALI thermocouple board (in service). |
| [Thermocouple Board (1B)](ground-station/thermocouples-1b.md) | Archived revision (never built). |
| [Pressure Transducer DAQ (1A)](ground-station/pressure-transducers-1a.md) | Early 4-PT design (superseded). |

### Vehicle

| Board | Role |
|-------|------|
| [Flight Computer / GPS (1A)](vehicle/flight-computer-gps.md) | Flight computer with GPS for tracking. |
| [Chickenstick Locator (1A)](vehicle/chickenstick-locator.md) | LoRa locator for recovery (prototype). |

## Components

Each major component gets its own page covering why we picked it and links to its datasheets.

| Component | Role |
|-----------|------|
| [STM32G431](components/stm32g431.md) | Flight (vehicle) microcontroller — cheap, modern, CAN-FD. |
| [STM32H563](components/stm32h563.md) | Ground-station microcontroller — Ethernet + CAN-FD. |
| [TCAN1462V](components/tcan1462v.md) | CAN-FD transceiver with 3.3 V I/O. |
| [LAN8742A](components/lan8742a.md) | Ethernet PHY. |
| [MAX31856](components/max31856.md) | Thermocouple-to-digital converter. |
| [ADS124S08](components/ads124s08.md) | 24-bit ADC for the load cells. |
| [ADS131A04](components/ads131a04.md) | Simultaneously sampling ADC for the pressure transducers. |
| [IPS4140HQ](components/ips4140hq.md) | High-side switch for the valve drivers. |
| [LR2021](components/lr2021.md) | Long-range LoRa transceiver for telemetry. |