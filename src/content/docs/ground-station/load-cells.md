---
title: Load Cell DAQ (1A)
description: Reads bridge-type load cells (thrust, weight).
sidebar:
  order: 3
---

4-layer PCB. Reads bridge-type load cells (thrust, weight).

**Status:** pending review. &nbsp; [Board source ↗](https://github.com/npgo22/ALI2Proposal/tree/main/ground-station-loadcells-1A)

## Microcontroller

[STM32H563RIV6](../components/stm32h563.md) — Cortex-M33, 250 MHz, 2 MB flash, 640 KB SRAM, VFQFPN68 package.

## Key ICs

| Part | Function |
|------|----------|
| [ADS124S08](../components/ads124s08.md) | 12-ch 24-bit precision delta-sigma ADC with integrated PGA and excitation current sources |

The ADS124S08 supports up to 12 single-ended or 6 differential channels, PGA gain 1–128, and built-in excitation current sources (IDAC1/IDAC2) for bridge sensor excitation. SPI Mode 1. Data rate 2.5 SPS – 4 kSPS.

## Firmware

`crates/load-cell` — Embassy async firmware, uses the `ads124s08` driver crate.

See also the [Load Cell Unit Log](../load-cell-log.md) for per-unit calibration and inventory.
