---
title: IPS4140HQ
description: High-side power switch used in the valve drivers.
---

This is the chip used in the valve drivers. It supports around half an amp continuously per channel (which cannot be placed in parallel unfortunately) and has active clamping. We used it primarily for its smaller footprint compared to a full h-bridge + driver arrangement, although we are conceding some granularity when it comes to setting up protection as a result, and severely limiting our potential current output which does not matter as we spec our own solenoids anyway.

## Datasheets

- [IPS4140HQ datasheet](/ALI2ProposalDocs/datasheets/IPS4140HQ/ips4140hq.pdf)
