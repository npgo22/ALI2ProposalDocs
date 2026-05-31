---
title: Thermocouple DAQ (2A)
description: Ground-station thermocouple data-acquisition board.
sidebar:
  order: 2
---

Measures thermocouple temperatures across the engine and propellant system.

**Status:** pending review. &nbsp; [Board source ↗](https://github.com/npgo22/ALI2Proposal/tree/main/ground-station-thermocouples-2A)

This is an incremental improvement over v1. It features fixed ethernet routing, and an isolated 5 V power supply so it no longer requires the original external wall wart to get it working properly.

## Key components

- [MAX31856](../components/max31856.md) — thermocouple-to-digital converter
- [STM32H563](../components/stm32h563.md) — microcontroller
- [LAN8742A](../components/lan8742a.md) — Ethernet PHY

See the [Isolation Setup](../isolation.md) notes for why the module is galvanically isolated.
