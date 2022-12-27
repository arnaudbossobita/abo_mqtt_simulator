import Vue from "vue";
import App from "./App.vue";
import ABO_MQTT from "./mqtt"

Vue.config.productionTip = false;
new Vue({
  render: function (h) {
    return h(App);
  },
  data() {
    return {
      mqtt: null
    }
  },
  created() {
    const HOST = 'test.mosquitto.org';
    const PORT = 8080;
    this.mqtt = new ABO_MQTT(HOST, PORT);
    this.mqtt.connect(() => {
      this.$emit('mqtt-connected', true)
    })

  }
}).$mount("#app");