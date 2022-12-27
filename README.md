# MQTT Simulator
## Project setup
```
npm install
```
### Compiles and hot-reloads for development
```
npm run serve
```
## Overview
The purpose of this app is to read a raw value, supplied by a 4-20 mA sensor publishing over an mqtt network, and then scale it into a useful output value.

For this context, we assume the input is coming from a thermometer and thus the output value is a temperature.


---
## Task#1:
Understand MQTT and how it can be used in the browser.

You can learn more about MQTT here: https://www.hivemq.com/mqtt-essentials/

For this app you will only need to understand how to publish and subscribe to messages.

For this app we are connecting to a publicly hosted mqtt broker: test.mosquitto.org so be aware subscribing to all topics ('#') is not recommended.
### Requirements
- See the `mqtt.js` file to understand the MQTT wrapper class and underlying Paho class.
- Add meaningful comments to the file to help the next dev understand what you've learnt.
- Create an unsubscribe function.
---
## Task #2:
Create a Vue component which publishes a value over an MQTT network. This will simulate the 4-20mA sensor with an expected range of values.
### Requirements
- For this task, the `RawPublisher.vue` file should be modified.
- The value should only publish once per second.
- The value should oscillate continuously between 0 and 20, at a configurable rate of change (default to 0.1/second).
- Set a publish topic: `identifier_<your first name>`
- The payload should be a JSON of format: `{"value": <number> }`
   - Example: `{"value": 5}`
---
## Task #3:
Create a Vue component which reads a raw sensor value from the network and scales it to the desired output value, and indicates the value with color-based warnings.

You can read more about 4-20 mA sensors and how to scale to an output value here: https://www.divize.com/techinfo/4-20ma-calculator.html
### Requirements
- For this task, the `HelloWorld.vue` file should be modified.
- Display two float-value indicator boxes labelled:
   - Input
   - Output
- The input value should be received via mqtt (published by the RawPublisher component)
- The output value should display the scaled value.
- if the input value is less than 4, the input indicator text color should be red.
- If the input value is in the top 25% of the value range, the output indicator box background colour should be red.
- if the input value is in the bottom 25% of the value range, the output indicactor box background colour should be blue.
- A form should allow the following values to be adjusted:
	- Raw Low (default: 4mA)
	- Raw High (default: 20 mA)
	- Engineering Low (default: -70 deg C)
	- Engineering High (default: 70 deg C)
  - Oscillation speed  of raw publisher (default: 0.1 mA/s) 
