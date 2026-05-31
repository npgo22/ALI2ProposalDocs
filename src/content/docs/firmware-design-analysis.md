---
title: Firmware Design and Analysis
description: Rationale for a proper Embassy + RTIC firmware stack, complete with PTP.
---

Unlike the electronics for the previous test stand (called "ALI"), we are no longer limited by the Arduino framework and/or crippled by the substandard development experience of the STM32Cube ecosystem (see [stm32cube-and-embassy.md](stm32cube-and-embassy.md)).

The decisions for firmware is driven by three big concepts:
1. Understandability - First and foremost, we need to have code that people can actually read and understand. This stuff should be easier to read than Arduino code, and documented well enough to reproduce a whole library just from the rendered rustdoc.
2. Maintainability - 
3. Homogeneity - Part of the other two above, but generally, all APRL embedded firmware should be able to share the same software stacks.

## Requirements
### Vertical Test Stand (the first DPF)
The vertical test stand exists as a superset of the ALI, and thus this platform must have the same electronics set.

### Ground Station
The ground station is the portion of the vertical test stand which must remain on the ground. Typically, we place electronics on the ground because A. the vehicle needs to talk to *something* and B. we can get away with moving parts of the vehicle onto the ground, thus saving weight and increasing the amount of space available within the vehicle.

This includes:
1. Thermocouples to detect the temperatures of relevant surfaces, such as behind the injector
2. Pressure transducers to monitor all the propulsion system lines
3. Valve drivers + an igniter board to control the actual state of the propulsion system
4. Load cell inputs to monitor the force applied by the firing engine

In addition, we would like to have an accelerometer on the engine to characterize the vibration behaviors of the engine, with a specific focus on frequencies below 5 kHz (it is possible to experience aliasing within the stand itself as well as the electronics but we will pass our data through a low-pass filter in post to remove the undesired frequencies).

Finally, we will also need a LoRa transceiver subsystem to actually communicate to the vehicle once it has been untethered. 

In this system, the main computer is an actual desktop machine running OpenC3, which collects data from our modules over ethernet.

#### Vehicle
The vehicle is a subset of the ground system electronics, with a particular emphasis on a "watch it burn" mentality: once the vehicle leaves the ground station, that's it. We have no control. If something happens, we will make no attempt at saving things. We do this because in the worst-case scenario, we can easily make a bad situation worse. For example, if we try to abort the launch while its in the air, and the system successfully delights itself, then we will have a 20 foot rocket falling to earth full of exceptionally angry liquid oxygen and kerosene raining down directly onto us at an unknown location, which is not exactly desirable although interesting.

That being said, the vehicle itself must also have tracking capabilities. This means an additional accelerometer away from the engine to track motion, and an additional GPS module to correct accelerometer data as needed. We may consider additional data, however, we have to weight the additional complexity of not only hardware but software implementation too (see the next section).

Generally speaking, by "subset", we mean the vehicle electronics will take the existing ground station electronics frontends and adapt them with lighter backends which use CAN-FD for communication instead of  Ethernet, which means we can get away with a far smaller microcontroller and we won't have to dedicate half of each board to the ethernet PHY + connector. This allows us to avoid a complete redesign of the electronics, and recycles an earlier trick with the ground station where we did something similar (i.e. members designed the frontends and a lead adapted them to work on a backend with the STM32H5, LAN8742A, and TCAN1462V + power distribution).

Every time we make a new iteration of DPF, we may have to re-engineer several modules to meet our new requirements as the DPF rocket will change between each and every attempt.

##### Recovery
Recovery refers to the techniques used to recover the rocket after launch. This means successfully encoding each state of a rocket flight using whatever sensors we have available, properly responding at apogee (with whatever parachute firing sequence we want) within 100ms (or whichever amount we calculate, this number is based on how fast the rocket can be falling before the parachute system would simply fail from the energy required to stop the rocket), and showing us where the rocket lands. Because of these strict timing and sensor requirements, we will need a hard RTOS and we will need t implement our own form of sensor fusion, although not necessarily a Kalman filter.

### Lander
<!-- I BELIEVE -->
It must be possible for this test platform to be extended to lander. This means being able to work with a regenerating engine, which can require upwards of 20 thermocouples and many more pressure transducers. In addition, we will need actuators to move the engine around, and low enough response times to sustain the several control loops required to keep the lander off the ground. 

For spring and fall of 2026, we will not be focusing on the potential requirements for lander at this time, however, our extensible architecture should be adaptable to it without severe difficultly.

## Stacks
In terms of software stacks, we want to prioritize owning code that we can actually understand and control the quality of. This means forking the (relatively simple) driver parts while leaving the actual complexity to competent people (i.e. we will not be forking embassy or RTIC or Statime for this stand). That being said, Rust does provide nice tools for making small patches as needed.

### Embassy
Embassy is the first and largest piece of the pie. They will provide:
* The peripheral access crates (PACs) which map the raw registers to known-good, safe objects in Rust. While we won't be using the PAC directly, it is still nice that they are putting so much effort into maintaining stable crates which are well-maintained specifically for the stm32. Compared to stm32-rs, which just uses svd files, they actually pull data from the svd, STM32CubeMX, and from real-world observations. Note that a lot of the STM32's registers are, to this day, still undocumented, but we wont need any of those. 
* The HAL which takes the PAC and makes it easy to use. This is what we mean by Embassy provides an Arduino-like experience. We don't have to do anything which would normally be expected out of bare-metal programming, like writing arbitrary data into random registers.
* The USB drivers so that we can stream logs during debugging.
* The ethernet drivers for the LAN8742A which is currently implemented as a generic driver but they literally just wrote a driver for the 8742A and re-branded it for generic use.
* The full TCP/IP networking stack, sans PTP support which we will actually need to fork off of and edit in this repo eventually.

#### The Cooperative Multitasking Async Executor
Embassy itself provides this thing, which essentially breaks down our individual methods into tasks which yield to each other using async programming. It is highly ergonomic, far easier to debug than a normal RTOS, and performs far better, too. We will not be using this because it is impossible to schedule hard deadlines for tasks. What they call "real-time" is really just using an interrupt to relabel tasks, but it will not drop its current task to get a higher-priority one done. Thus, we will need to use RTIC.

### RTIC


### defmt

### PTP (Statime)

### Drivers

### Timers