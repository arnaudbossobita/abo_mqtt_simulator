import Paho from 'paho-mqtt'

/**
 * This class is a wrapper for the Paho MQTT class to provide extra
 * functionality to the publish, subscribe unsubscribe and onMessage methods.
 * Paho is a Javascript library that enables MQTT browser-based client to connect to MQTT broker through WebSockets.
 * For more details on the Paho pr oject:
 * 
 * Paho JS MQTT Docs: https://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html
 */
export default class ABO_MQTT {

  /** 
   * Creates a new instance on the ABO_MQTT class.
   * @param {string} host the hostname of the MQTT broker.
   * @param {int} port the port of the MQTT broker.
   */
  constructor(host, port) {
    this.host = host
    this.port = port
    this.connected = false
    this.client = new Paho.Client(host, port, "clientjs");
    this.client.onMessageArrived = this.handleMessage.bind(this)
    this.callbackMap = new Map()  // This is to store the pairs <topic, callback> representing callback function to be executed for each topic the client has subscribed to.
    this.onMessage = null
    this.subbedTopics = []  // This is to store the list all the topics the client has subscribted to
  }

  /**
   * Defaults the connected flag of the MQTT client to true.
   */
  _defaultConnect() {
    this.connected = true
    console.log('Connected!')
  }

  /**
   * Connect the current client to the MQTT server
   * @param {function} callbackFn The callback function to execute upon successfull connection when the connect acknowledgement has been received from the server.
   */
  connect(callbackFn = null) {
    console.log(`Connecting to ws://${this.host}:${this.port}`);
    let successCallbackFn = this._defaultConnect
    if (callbackFn) {
      successCallbackFn = () => {
        this._defaultConnect()
        callbackFn()
      }
    }
    let options = {
      timeout: 3,
      onSuccess: successCallbackFn
    }
    this.client.connect(options)
  }

  /**
   * Subscribe for a message on the MQTT broker.
   * @param {string} topic The topic the client is subscribing for.
   * @param {int} qos The maiximum qos of any publications sent as a result of making this subscription
   * @param {function} callbackFn The callback function to execute unpon successfull subscription when the subscribe acknowledgement has been received from the server.
   */
  sub(topic, qos = 0, callbackFn = null) {
    this.client.subscribe(topic, { qos: qos })
    this.subbedTopics.push(topic)
    if (callbackFn) {
      this.callbackMap.set(topic, callbackFn)
    }
  }

  /**
   * Unsubscribe for a message on the MQTT broker.
   * @param {string} topic The topic the client is unsubscribing for.
   * @param {function} callbackFn The callback function to execute unpon successfull subscription when the subscribe acknowledgement has been received from the server.
   */
   unsub(topic, callbackFn = null) {
    this.client.unsubscribe(topic, {})
    if (this.subbedTopics.indexOf(topic) != -1) {
      this.subbedTopics.splice(this.subbedTopics.indexOf(topic), 1)
      this.callbackMap.delete(topic)
    }
  }

  /**
   * Add a call back function to a topic the client has subscribed to.
   * @param {string} topic A topic the client has subscribing for.
   * @param {function} callbackFn A callback function to be added to a subscribed toppic
   */
  addSubCallback(topic, callbackFn) {
    if (this.subbedTopics.indexOf(topic) != -1) {
      this.callbackMap.set(topic, callbackFn)
    } else {
      console.log(`Callback cannot be added to topic:
      '${topic}'
      because it does not exist.`)
    }
  }

  /**
   * Publish a message to the MQTT broker.
   * @param {string} topic The name of the topic to which the message is to be published.
   * @param {string} payload The message data to be published.
   * @param {int} qos The Quality of Service used to deliver the message.
   * @param {boolean} retain The flag that determines whether the message is saved by the MQTT broker as the last known good value for the specified topic.
   */
  pub(topic, payload, qos = 0, retain = false) {
    if (this.connected) {
      this.client.publish(topic, payload, qos, retain)
    } else {
      console.log(`MQTT not connected. Failed to publish:
      topic: ${topic}
      payload: ${payload}`)
    }
  }

  /**
   * Handler for processing subscribed message receive by the client.
   * When a subscribe message is received, we either execute the call back function if provided at the time of subscription
   * or we execute the onMessage handler.
   * @param {string} message The subscribed message to be process.
   */
  handleMessage(message) {
    try {
      const callbackFn = this.callbackMap.get(message.destinationName)
      if (callbackFn) {
        callbackFn(message.destinationName, message.payloadString)
      } else if (this.onMessage) {
        this.onMessage(message.destinationName, message.payloadString)
      }
    } catch (e) {
      console.log(`Handler for topic ${message.destinationName} failed. Error: `, e)
    }
  }
}