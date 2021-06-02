const { Buffer } = require("buffer");
const SerialPort = require("serialport");

const bitRates = [1200, 4800, 9600, 14400, 19200, 38400, 57600, 115200];

const defaults = {
  bitRate: 9600,
};

const commands = {
  trigger: Buffer.from([0x7e, 0x00, 0x08, 0x01, 0x00, 0x02, 0x01, 0xab, 0xcd]),
  confirmation: Buffer.from([0x02, 0x00, 0x00, 0x01, 0x00, 0x33, 0x31]),
  set_to_25: Buffer.from([
    0x7e, 0x00, 0x08, 0x01, 0x00, 0x06, 0xff, 0xab, 0xcd,
  ]),
};

module.exports = (dev, logger, options = {}) => {
  this.dev = dev;
  this.port = null;

  this.bitRate =
    (options.bitRate && bitRates.includes(options.bitRate)) || defaults.bitRate;

  this.onScan =
    options.onScan && options.onScan instanceof Function
      ? options.onScan
      : null;

  this.port = new SerialPort(this.dev, {
    baudRate: this.bitRate,
    autoOpen: true,
  });

  // open errors will be emitted as an error event
  this.port.on("error", (err) => {
    logger.error(err.message);
  });

  this.port.on("open", () => {
    logger.trace("port is open");
    // this.port.write(commands.set_to_25);
  });

  this.port.on("data", (data) => {
    // Ignore the confirmation message
    if (data.equals(commands.confirmation)) return;

    // Ignore the debug info message thing at the beginning of a connection
    if (data.toString("ascii", 0, 2) === "<{") return;

    // Send data up until, but not including the first 0xd
    this.onScan(data.slice(0, data.indexOf(0xd)).toString());
  });

  this.trigger = () => {
    this.port.write(commands.trigger);
  };

  this.close = () => {
    this.port.close();
  };

  return this;
};
