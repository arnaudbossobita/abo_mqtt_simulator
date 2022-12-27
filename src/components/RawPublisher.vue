<template>
  <div>
    <p>Publisher: {{ rawActual }}</p>

    <table class="customTable">
      <tr>
        <th colspan="2">Configure 4-20mA transmiter settings</th>
      </tr>
      <tr>
        <td>Oscillation speed  of raw publisher (default: 0.1 mA/s)</td>
        <td><input v-model="changeRate" /></td>
      </tr>
    </table>

  </div>
</template>

<script>
export default {
  name: "RawPublisher",
  data() {
    return {
      rawActual: 0,
      changeRate: 0.1,
      rawLow: 0, // Minimum sensor reading value to be generated, mA
      rawHigh: 20, // Maximum sensor reading value to be generated, mA
    };
  },
  mounted() {
    console.log("Component RawPublisher mounted");
    this.rawPublisher()  
  },
  methods: {
    rawPublisher() {
      // This function oscillates rawActual between 0 & 20 and publishes result to mqtt.
                  
      this.rawActual = this.getRandomIntInclusive(this.rawLow, this.rawHigh)
      console.log("Publishing...");
      console.log(`rawActual initial: ${this.rawActual}`)

      setInterval(() => {
        var changeRateSign = this.getRandomIntInclusive(0, 1)
      
        this.rawActual += (changeRateSign == 1) ? Number(this.changeRate) : -Number(this.changeRate)
        this.rawActual = Number(this.rawActual.toFixed(1))
        console.log(`rawActual refreshed: ${this.rawActual}`)

        var payload = JSON.stringify({"value": this.rawActual})
        this.$root.mqtt.pub('abo_arnaud', payload)
      }, 1000);

    },
    getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    },
  },
};
</script>

<style>
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

</style>
