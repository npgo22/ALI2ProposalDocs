---
title: Thermocouple Board (1A)
description: First revision of the ALI thermocouple board — currently in service on the ALI.
sidebar:
  order: 6
  badge:
    text: On ALI
    variant: note
---

These are the board files for the first revision of the thermocouple board for ALI. As can be seen in the schematic, the layout for the ethernet PHY is wrong. This was corrected with some jumper wires and hot glue. Because of the very similar architecture to the new layout, this board may be used in lieu of the completion of a second revision of the original thermocouple board.

**Status:** currently in service on the ALI (hot glued). &nbsp; [Board source ↗](https://github.com/npgo22/ALI2Proposal/tree/main/ground-station-thermocouples-1A)

Superseded for new builds by the [Thermocouple DAQ (2A)](thermocouples-2a.md).

## Key components

- [MAX31856](../components/max31856.md) — thermocouple-to-digital converter
- [LAN8742A](../components/lan8742a.md) — Ethernet PHY (mislaid on this revision)
- [STM32H563](../components/stm32h563.md) — microcontroller
