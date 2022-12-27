<template>
  <div class="hello">
    <h1>HelloWorld status: {{ msg }}</h1>
    <h1 :class="isInputLessThan4 ? 'inputLessThan4' : 'default'">input: {{ rawActual }}</h1>
    <h1 :class="isInputInTop25 ? 'inputInTop25' : (isInputInBottom25 ? 'inputInBottom25' : 'default')">output: {{ engActual }}</h1>

    <div>

      <table class="customTable">
        <tr>
          <th colspan="2">Configure 4-20mA scaling settings</th>
        </tr>        
        <tr>
          <td>Raw Low (default: 4mA)</td>
          <td><input v-model="rawLow" /></td>
        </tr>
        <tr>
          <td>Raw High (default: 20 mA)</td>
          <td><input v-model="rawHigh" /></td>
        </tr>
        <tr>
          <td>Engineering Low (default: -70 deg C)</td>
          <td><input v-model="engLow" /></td>
        </tr>
        <tr>
          <td>Engineering High (default: 70 deg C)</td>
          <td><input v-model="engHigh" /></td>
        </tr>
        <tr>
          <td colspan="2" class="linkArea">For more details about 4-20mA scaling, please refer to the <a href="https://www.divize.com/techinfo/4-20ma-calculator.html" target="_blank">link</a> </td>
        </tr>
      </table>

      <br />

      <div>
        <button @click="unsubscribe" :disabled="!isTopicSubscribed">Unsubscribe topic</button> &nbsp;
        <button @click="subscribe" :disabled="isTopicSubscribed">Subscribe topic</button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "init",
      rawActual: 0, // Received raw sensor value, mA
      rawLow: 4, // Minimum sensor reading, mA
      rawHigh: 20, // Maximum sensor readin, mA
      engActual: 0, // Current thermometer reading, deg C
      engLow: -70, // Minimum temperature of thermometer, deg C
      engHigh: 70, // Maximum temperature of thermometer, deg C

      isTopicSubscribed: false,

      isInputLessThan4: false,
      isInputInTop25: false,
      isInputInBottom25: false,
    };
  },
  mounted() {
    console.log("Component HelloWorld mounted");
    this.$root.$on("mqtt-connected", () => {

      // Defines how message topic is subscribed, with callback function or not, 
      // by default I'm passing a callback function parameter

      // If message is subscribed with a callback function, then that function executes upon receipt of the message
      this.$root.mqtt.sub("abo_arnaud", 0, this.onAboArnaud);
      this.isTopicSubscribed = true;

      // If message is subscribed without callback function, then the this.$root.mqtt.onMessage handler executes upon receipt of the message
      // this.$root.mqtt.sub("abo_arnaud", 0, null);

      this.$root.mqtt.onMessage = (topic, payload) => {
        console.log(topic, payload)
        this.processMessageReceivedFromMqtt(payload)
      }
    });
  },
  methods: {
    onAboArnaud(topic, payload) {
      console.log(`Arnaud subscribed - topic: ${topic} payload: ${payload}`);
      this.msg = payload;
      this.processMessageReceivedFromMqtt(payload)
    },
    processMessageReceivedFromMqtt(payload){
      console.log(`Message received: ${payload}`)

      var payloadJSON = JSON.parse(payload)
      console.log(`Message value received: ${payloadJSON.value}`)

      this.rawActual = Number(payloadJSON.value)
      this.engActual = this.getPhysicalValueFromCurrent(this.rawActual)

      // Refresh the flags that define the color-based warnngs
      this.isInputLessThan4 = this.getIsInputLessThan4()
      this.isInputInTop25 = this.getIsInputInTop25()
      this.isInputInBottom25 = this.getIsInputInBottom25()

      console.log(`isInputLessThan4: ${this.isInputLessThan4}`)
      console.log(`isInputInTop25: ${this.isInputInTop25}`)
      console.log(`isInputInBottom25: ${this.isInputInBottom25}`)
    },
    getPhysicalValueFromCurrent(current){
      // This function scales a current signal value into a physical value. 
      // The conversion is performed using the 4-20mA scaling calculator formula below:
      // For more details on the scaling calculatore, please refer to the link https://www.divize.com/techinfo/4-20ma-calculator.html
      // Pv = ((Pvhigh - Pvlow)/(Ihigh - Ilow))*(I - Ilow) + Pvlow

      var result = ((Number(this.engHigh) - Number(this.engLow))/(Number(this.rawHigh) - Number(this.rawLow)))*(current - Number(this.rawLow)) + Number(this.engLow)
      result = Number(result.toFixed(2))

      if (current < Number(this.rawLow) || current > Number(this.rawHigh))
        result += " (Current out of range)"

      return result
    },
    getIsInputLessThan4(){
      return (this.rawActual < 4)
    },
    getIsInputInTop25(){
      var percentile75 = 0.75 * (Number(this.rawHigh) - Number(this.rawLow)) + Number(this.rawLow)
      percentile75 = Number(percentile75.toFixed(1))
      return (this.rawActual >= percentile75)
    },
    getIsInputInBottom25(){
      var percentile25 = 0.25 * (Number(this.rawHigh) - Number(this.rawLow)) + Number(this.rawLow)
      percentile25 = Number(percentile25.toFixed(1))
      return (this.rawActual < percentile25)
    },
    subscribe(){
      this.$root.mqtt.sub("abo_arnaud", 0, this.onAboArnaud);
      this.isTopicSubscribed = true;
    },
    unsubscribe(){
      this.$root.mqtt.unsub("abo_arnaud", 0, this.onAboArnaudUnsub);
      this.isTopicSubscribed = false;
    },
    onAboArnaudUnsub(topic) {
      console.log(`Arnaud - unsubscribed topic: ${topic}`);
      this.msg = payload;
    },
  },
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.inputLessThan4 {
  color: red;
}

.inputInTop25 {
  background-color: red;
}

.inputInBottom25 {
  background-color: blue;
  color: white;
}

.default {
  background-color:transparent;
  color: black;
}

.center {
  margin-left: auto;
  margin-right: auto;
}

.customTable {
  margin-left: auto;
  margin-right: auto;
}

.customTable th {
  height: 25px;
}

.customTable tr td {
  text-align: left;
}

.linkArea {
  height: 25px;
  font-style: italic;
  font-size: small;
}

</style>
