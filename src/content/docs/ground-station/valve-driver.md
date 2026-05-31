---
title: Valve Driver (1A)
description: IPS4140HQ valve driver board for the bipropellant engine solenoids.
sidebar:
  order: 1
---

4-layer PCB. Controls pneumatic solenoid valves for the APRL bipropellant engine.

**Status:** pending review. &nbsp; [Board source ↗](https://github.com/npgo22/ALI2Proposal/tree/main/ground-station-valve-driver-1A)

## Microcontroller

[STM32H563RIV6](../components/stm32h563.md) — Cortex-M33, 250 MHz, 2 MB flash, 640 KB SRAM, VFQFPN68 package. Peripherals in use: ETH, FDCAN1, I2C3, USB.

## Key ICs

| Part | Function |
|------|----------|
| [IPS4140HQ](../components/ips4140hq.md) | Smart quad high-side switch, drives solenoid coils |
| [ADS131A04](../components/ads131a04.md) | 4-ch 24-bit simultaneous ADC (current/voltage monitoring) |

The IPS4140HQ provides per-channel overcurrent, overtemperature, and open-load detection. Its fault status pins are **not read by the FSM** — they are forwarded to telemetry only. See the [Valve FSM](../fsm.md) design notes.

## Channel Map

The full channel table (G3, G5, A2, L1, K1, L2, K2, L3, K3, L5, K5, IGN) lives with the `crates/valve-fsm` firmware.

## Firmware

`crates/valve-driver` — Embassy async firmware, uses the `valve-fsm` and `ads131a04` driver crates.
