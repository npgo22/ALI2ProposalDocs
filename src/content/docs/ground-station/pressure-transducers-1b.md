---
title: Pressure Transducer DAQ (1B)
description: Reads pressure transducers across the propellant and pressurant system.
sidebar:
  order: 4
---

4-layer PCB. Reads pressure transducers across the propellant and pressurant system.

**Status:** pending review. &nbsp; [Board source ↗](https://github.com/npgo22/ALI2Proposal/tree/main/ground-station-pressure-transducers-1B)

## Microcontroller

[STM32H563RIV6](../components/stm32h563.md) — Cortex-M33, 250 MHz, 2 MB flash, 640 KB SRAM, VFQFPN68 package.

## Key ICs

| Part | Function |
|------|----------|
| [ADS131A04](../components/ads131a04.md) | 4-ch 24-bit simultaneous-sampling delta-sigma ADC |

The ADS131A04 samples all 4 channels simultaneously, which eliminates phase error between channels. PGA gain 1–128 per channel. Data rate up to 32 kSPS. SPI Mode 1.

## Firmware

`crates/pressure` — Embassy async firmware, uses the `ads131a04` driver crate.
