# Praeco

I worked as part of a team to design and build this IoT application. The code included in this repository are the parts of the application I contributed to.

This repo contains the back end for the api.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Purpose](#purpose)
- [Technology](#technology)
  - [Api](#api)
  - [FE](#fe)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Purpose

The purpose of this app was to allow people managing industrial spaces to interact with custom IoT hardware specifically designed for this platform.

The devices were built on [particle.io](http://particle.io) and could track things like humidity, temperature, or light. When a predetermined trigger was met, the device would send a webhook to this api.

This application gave users a mobile interface to interact with the devices from. It could also handle the request and send custom notifications through text, email, and text-to-voice phone calls to as many people as necessary.

## Technology

### Api
- Node
- Express
- Nodemailer
- Twilio voice and text
- Particle.io

### FE
- Angular
- Gulp
- Sass

## Credits

[Lab651](http://lab651.com/products)
[Erin Black](https://github.com/ErinBlack)
[Corey Sader](https://github.com/sader17761)
[lindsey Olson](https://github.com/lindseyolson)
