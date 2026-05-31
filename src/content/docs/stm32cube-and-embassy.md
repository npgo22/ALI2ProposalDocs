---
title: Comparing STM32Cube and Embassy-rs
description: Why APRL moved from the Arduino/STM32Cube workflow to a Rust + Embassy embedded toolchain.
---

## Embedded Toolchain Comparison

# Introduction

In Aerospace, you are often only given a single chance to get something right. A single segfault, use after free, or any other bug can easily end with a very catastrophic, expensive, and potentially fatal accident. Because of this, correctness comes above all.

At the time of writing, we are planning to move from Teensy development boards to fully integrated STM32 boards. That is, we will be taking individual chips and creating full solutions instead of simple carrier boards which you might see in other clubs. This offers us complete control over both our hardware and software, and allows us to outgrow the existing increasingly outdated Arduino code. For our purposes, Arduino is a bad fit because it trades performance and safety for ease of use and beginner-friendliness. We can work around some of these limitations (see: [FastIO](https://github.com/bitbank2/FastIO)), but not others (indeterministic timing being a big one). While the STM32duino port is excellent, the Arduino framework itself has many, many shortcomings from decades of being built off ancient 8-bit AVR microcontrollers. These include, but are not limited to:

- Incomplete peripheral exposure
- No clock configuration
- No HAL-level debugging
- Limited control over memory layout
- Wasted CPU cycles due to runtime checks for IO
- Slow SPI/I2C
- Limited options for DMA
- Little control over power states
- Tools within toolchain are locked to weird forks and old versions

Even *one* of these would be enough to disqualify the prospect of using Arduino. All of them combined makes it a truly awful choice for our application.

That leaves us with two options: use the vendor-provided tooling to fully utilize the chips, or turn to other solutions which are perhaps a little more arcane. We *cannot* mix toolchains across projects. What we choose is what we choose, likely forever. 

## STM32Cube

### Key terms:

- STM32Cube describes the open-source framework released by STM for their microcontrollers
- STM32CubeMX is the program used to select and customize a skeleton STM32 project. It is how you would generate pinouts, configure clocks, and choose middlewares.
- STM32CubeIDE is the software used to develop STM32 firmware. It comes in two forms:
    - An Eclipse fork - The existing IDE STM has had for awhile. It is stable, robust, and likely what we would use if given the chance.
    - A VSCode extension - This is the direction STM appears to be moving. It is, at this time, incomplete and mostly undocumented. The author of this document was unable to get basic debugging operational with it, for example.
- ST-Link is the proprietary debugger that you must use with ST’s toolchain.
- PyOCD the “Python on-chip debugger”. It is the software we use to connect our probes to program our microcontrollers by using the CMSIS-DAP framework. It is a better form of OpenOCD, which is what STM32CubeIDE uses.

ST provides a complete software toolchain which covers every step of the development process. It is complete, mature, and well-supported. There are decades of documentations and forums recording how people solved issues they faced. Putting it on your resume will probably get you a job. It is something you will probably need to know eventually, given STM32’s popularity within hobby projects.

It is not, however, well-documented. A lot of the time you’re on your own when it comes to implementing something. There will be times when a peripheral will be offered in a datasheet, but there will be literally no software support for it, and you’ll have to either write it from scratch or hack something together. On the updated thermocouple data acquisition board for the test stand, for example, [we tried to hack together LwIP support for the STM32H5 based on a blog post](https://community.st.com/t5/stm32-mcus/how-to-use-the-lwip-ethernet-middleware-on-the-stm32h5-series/ta-p/691100), which greatly contributed to the failure of the project (it failed to ship in time for hotfire, costing the club hundreds and wasting days of effort while later complicating the root failure analysis for YF, the injector we were testing, as we had incomplete data). 

In addition, Eclipse has rapidly fallen out of favor compared to VSCode for very good reasons, and the lock-in to ST’s tooling can be catastrophic if they were to ever make a change we disagreed with. 

To complicate things further, most of our gear is centered around PyOCD instead of ST-Link, which has poorer integration with STM32CubeIDE.

## Rust

### Key terms

- Rustup - The rust toolchain installer.
- Rustc - The rust compiler. We will never invoke it directly, as we will be using:
- Cargo - The fully integrated rust toolchain. It is how you compile your software and add packages.

While this is a document that aims to draw comparisons between embedded software toolchains, it is still important to cover Rust itself. Rust is a modern, memory-safe systems programming language which aims to directly compete with C++. Large parts of it are still built on C (i.e. every binary still links against your system’s libc), however, because of compiler analysis tools such as the borrow checker, code written in Rust is often nearly completely free of common memory bugs, and because of the rapidly improving ecosystem, Rust’s embedded software libraries are often way easier to understand and interpret than their C equivalents. We can still use C code with rust-bindgen, however, this is a huge headache in most cases.  

For comparison, here’s the UDP socket implementation in embassy compared to LwIP:

- [smol-tcp (Embassy wraps this)](https://github.com/smoltcp-rs/smoltcp/blob/main/src/socket/udp.rs)
- [LwIP udp.c](https://github.com/STMicroelectronics/stm32-mw-lwip/blob/master/src/core/udp.c)

Neither of them are that bad, to be honest, but the real difference comes in the form of documentation and the ability to simply ctrl+click and find whatever you need in code that really feels like something you would actually write. Rust does have a lot “syntactic sugar”, but it doesn’t really get in the way of interpreting code, [versus something like C++](https://github.com/gcc-mirror/gcc/blob/master/libstdc%2B%2B-v3/include/bits/stl_algo.h).

The tooling is also excellent. Just install cargo and probe-rs, and you’re good to go. As far as VSCode extensions go, you’ll want:

- rust-analyzer
- Debugger for probe-rs
- dependi
- Even Better TOML

From there, just use a template project and away you go. Clocks and I/O are configured alongside source code, so there is no generating skeleton projects, which is error-prone and can lead to odd bugs as with STM32Cube.

It is important to note that while Rust helps track entire classes of bugs, it does not make them impossible. No amount of compiler checks can prevent logic errors, and [memory safety can easily become a problem](https://github.com/Speykious/cve-rs). It also provides a lot of potential [easy-outs which can easily lead to program crashes and real problems if mishandled](https://github.com/bearcove/loona/security/advisories/GHSA-7vm6-qwh5-9x44). For these reasons, it is not the end-all of safety, and you still need constant vigilance throughout the entire software development process. **In APRL, unless there is a showstopper bug, we will not ship new versions of firmware after a module has been completed, as the relative risk of introducing a major bug while trying to fix a minor bug is simply too great.**

The language itself does has some really big oddities, too. The borrow checker is a common one, but it also lacks structures such as classes as a design decision (instead, you write structs and give them impls). The borrow checker also enforces safety to an excruciating extent. Oftentimes, developers find themselves wrapping their pins in mutexes in case an ISR needs them, for example, which is correct but also incredibly annoying. This looks like: 

```rust
#![no_std]
#![no_main]

use embassy_executor::Spawner;
use embassy_stm32::gpio::{Level, Output, Pin};
use embassy_stm32::interrupt;
use embassy_sync::mutex::CriticalSectionMutex;
use core::cell::RefCell;

static LED: CriticalSectionMutex<RefCell<Option<Output<'static, Pin>>>> =
    CriticalSectionMutex::new(RefCell::new(None));

#[embassy_executor::main]
async fn main(spawner: Spawner) {
    let p = embassy_stm32::init(Default::default());

    // Create the pin
    let led = Output::new(p.PA5, Level::Low);

    // Store it globally
    LED.lock(|cell| {
        *cell.borrow_mut() = Some(led);
    });

    // Enable interrupt
    interrupt::EXTI0.unpend();
    interrupt::EXTI0.enable();

    // Main task toggling LED
    loop {
        LED.lock(|cell| {
            if let Some(ref mut led) = *cell.borrow_mut() {
                led.set_high();
            }
        });

        embassy_time::Delay.delay_ms(200).await;

        LED.lock(|cell| {
            if let Some(ref mut led) = *cell.borrow_mut() {
                led.set_low();
            }
        });

        embassy_time::Delay.delay_ms(200).await;
    }
}

// ISR that also touches the same pin
#[interrupt]
fn EXTI0() {
    LED.lock(|cell| {
        if let Some(ref mut led) = *cell.borrow_mut() {
            led.toggle();
        }
    });
}
```

*NOTE1: This is something Rust requires you to handle, and still exists in the C/C++ world, too. Its just that most developers incidentally choose not to handle this as they do not know/do not care about the undefined behavior not handling it causes. Very often, instead of using a mutex, people will wrap these in an ISR-safe function:*

```rust
fn set_flag() {
    cortex_m::interrupt::free(|cs| {
        MY_SHARED.borrow(cs).set(true);
    });
}

#[interrupt]
fn EXTI0() {
    set_flag();
}
```

*NOTE2: Rust does have some sharp edges when it comes to no-std code, which do need to be worked around. They’re often not too big of a problem. Notably, you’ll want the following in your per-project `.vscode/settings.json`:*

```jsx
{
    "rust-analyzer.cargo.allTargets": false // silences the weird lib test warning on no-std
}
```

There’s a lot of other initially confusing concepts that could make it hard to adopt Rust in our club too, such as:

1. Ownership
2. Borrowing
3. Lifetimes
4. Trait objects vs. generics
5. The module system
6. Error handling with `Result` and `?`
7. Enums as sum types
8. Iterator laziness
9. Mutability rules for values vs. references (including interior mutability)

Most other languages have these too (lifetimes are big one), Rust just formalizes them and forces you to pay attention to them properly instead of letting it come back to bite you.

I also said that the ecosystem for Rust is *rapidly maturing*, which is very different from *mature*. For example, on the thermocouple DAQ board, the driver for the chip we were using to get temperature readings is [abandoned, dysfunctional, and incomplete](https://github.com/idheepan/max31856-rs), so we had to write our own. Note that the APIs offered by Rust made the process fast and easy, however, as we were literally able to rewrite the entire project in just four hours.

It is also worth noting that Rust is getting rapidly adopted by industries in the automotive space and aerospace. Schools like CalPoly have also adopted it for the same reasons we want to. Like STM32Cube, you will also probably have to know it eventually. A lot of the mental models enforced by Rust are applicable to C/C++ too, so learning Rust does make you a better C/C++ programmer, too.

[For this club, this is probably the main reason we wouldn’t use Rust](https://www.reddit.com/r/embedded/comments/1jd0uuc/comment/mi7t7vi/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button). In industry, Rust is a “future” thing, not a “current” thing.

## Embassy-rs

Taken from their README.md: `Embassy is the next-generation framework for embedded applications. Write safe, correct, and energy-efficient embedded code faster, using the Rust programming language, its async facilities, and the Embassy libraries.` 

Embassy is like STM32Cube + STM32CubeMX as far as purpose goes. It warps several other Rust libraries, and has quickly become the standard in the Rust ecosystem for embedded development. It has non-blocking event loops, and abstracts away a lot of the more painful parts of the development experience. Paired with `probe-rs`, you can have a completely functional development environment within minutes which is nearly guaranteed to be identical to what others have, down to the Cargo toolchain used.

It is, however, `async` , which has [been under fire since its conception](https://bitbashing.io/async-rust.html). Some people go as far as to say async Rust is completely different from non-async Rust, which is distinct from sync unsafe rust and async unsafe Rust. Luckily, we will probably not have to deal with these, however, the overhead introduced by the embassy scheduler is non-zero.

Also, Embassy is not an RTOS, it just provides a nice scheduler. This can be a good thing in some cases, as [Embassy has drastically better performance than both RTIC and FreeRTOS](https://tweedegolf.nl/en/blog/65/async-rust-vs-rtos-showdown). Nevertheless, it still does mean that we can’t have hard deadlines in our code if we ever needed them. 

For a difference between embassy vs any other RTOS, **TL;DR: embassy completes a task in full before switching to another. A real RTOS interrupts itself at a given rate, then switches to another task depending on their priority to meet timing requirements. Embassy does have the ability to preempt other tasks, but if that task never yields, then the timing requirement will never be met.** Likewise, unless carefully handled, an exception within one task can take the system down. This has the advantage of being simpler to debug and far more performant, since a microcontroller incurs a fixed performance penalty during every interrupt.

*NOTE: [Ariel-OS](https://github.com/ariel-os/ariel-os) is an RTOS built on embassy, although we’d probably never need it.*

**For a full description of everything it does differently, just read their README.md. It is some seriously good stuff.** [Look at their examples too, as they are also absolutely excellent and just go to show how much simpler an Embassy project is to set up and develop on compared to their competition](https://github.com/embassy-rs/embassy/tree/main/examples/stm32g4/src/bin)**.**

### Ferrocene

Ferrocene is an open-source, verified toolchain for safety-critical rust. You have to pay for certified versions of their binaries, however, we are free to compile their open-source toolchain at any time in case we decide we want a route to go for something which has been certified. It is $25/month per seat. The company which maintains Ferrocene, Ferrous Systems, ****also manages a lot of the embedded rust ecosystem, too.

At this time is is important to note that **Ferrocene is currently not certified for aerospace use (DO-178C)**, and we would be mostly paying for extended software support for a given Rust toolchain version. As the software is mostly upstream-first, there will likely never be a time when a given Ferrocene toolchain will have an additional feature for us to use over the standard toolchain.

### Flip Link

(NOTE: I am not sure if STM32Cube does this by default)

The Ferrocene developers released [flip-link](https://github.com/knurling-rs/flip-link), which changes the direction the stack grows in our embedded binaries. It does this because it is possible for the stack to overwrite the data section by default. By flipping the direction in which the stack grows, stack exhaustion will cause an exception instead of undefined behavior. We can than send a flag over CAN-FD and have the module reset itself in the worst case, logging the failure in the process.

### Defmt

Deferred formatting (defmt) is yet another tool by the Ferrocene guys. It uses RTT to do structured logging over USB. [We can also make it send logs over ethernet (or any other interface) with `global_logger`](https://defmt.ferrous-systems.com/global-logger), although at this time this has not been fully decided, as we would have to roll our own log recorder (which, to be honest, would take maybe an hour to write), as defmt has some very strange logging requirements. 

### Embedded-test

                                   As far as I know there is no real equivalent for this in the C/C++ world, as C/C++ does not have a standard test interface like Rust, although tools such as micro exist. [Embedded-test allows us to use the default Rust testing framework for our embedded targets](https://github.com/probe-rs/embedded-test). This means you can leverage the normal Rust testing framework, but run the tests directly on-chip over probe-rs.

### Cool links

[AeroRust](https://aerorust.org/catalogue/)

[ethercrab](https://github.com/ethercrab-rs/ethercrab)

[awesome embedded rust](https://github.com/rust-embedded/awesome-embedded-rust)

[drive-rs](https://tweedegolf.github.io/drive-rs/)

[heapless](https://docs.rs/heapless/latest/heapless/)

## RTIC + stm32-rs

RTIC is the common interrupt-driven RTOS used in Rust. stm32-rs is a different set of community projects for stm32 HALs for Rust. Typically they are paired together to get the same experience as Embassy, however, as they lack commercial support/usage, their development and supported hardware is limited. It does give us hard deadlines, however, should we ever need them. We are hesitant to say much about it since our experience with it is so limited. 

[They do have their own docs on comparisons between RTIC, Embassy, and “the world”.](https://rtic.rs/2/book/en/rtic_vs.html)