import board
import busio

while not spi.try_lock():
    pass
spi.configure(baudrate=16000000)
spi.unlock()

while True:
    spi.write(bytes(range(64)))
    time.sleep(0.1)


class GPIO64():
    DIR_INPUT = 1
    DIR_OUTPUT = 0
    PULLUP_ENABLED = 1
    PULLUP_DISABLED = 0

    IOCON_UNUSED = 0x01
    IOCON_INTPOL = 0x02
    IOCON_ODR = 0x04
    IOCON_HAEN = 0x08
    IOCON_DISSLW = 0x10
    IOCON_SEQOP = 0x20
    IOCON_MIRROR = 0x40
    IOCON_BANK_MODE = 0x80

    BANK = [0x40, 0x42, 0x44, 0x46]
    IODIR = [0x00, 0x01]
    OLAT = [0x14, 0x15]
    GPPU = [0x0C, 0x0D]
    GPIO = [0x12, 0x13]
    IOCON = 0x0A

    def __init__(self):
        self.__spi = busio.SPI(board.SCLK, board.MOSI, board.MISO)
        while not self.__spi.try_lock():
            pass
        self.__spi.configure(baudrate=16000000)
        self.__spi.unlock()

    def __sendSPI(self, value):
        self.__spi.write(bytes(value))

    def __setReg(self, cmd, reg, level):
        data = self.getSPI(cmd.getBank(), reg)
        bank = self.BANK[cmd.getBank()]
        if (level == 1):
            data |= (1 << cmd.getPin())
        else:
            data &= (~(1 << cmd.getPin()))
        self.setSPI(bank, reg, data)

    def setSPI(self, bank, reg, data):
        GPIO.output(self.__CS, GPIO.LOW)
        self.__sendSPI(bank | self.__SPI_SLAVE_WRITE)
        self.__sendSPI(reg)
        self.__sendSPI(data)
        GPIO.output(self.__CS, GPIO.HIGH)

    def getSPI(self, bank, reg):
        GPIO.output(self.__CS, GPIO.LOW)
        self.__sendSPI(bank | self.__SPI_SLAVE_READ)
        self.__sendSPI(reg)
        value = 0
        for i in range(8):
            value <<= 1
            if(GPIO.input(self.__MISO)):
                value |= 0x01
            GPIO.output(self.__SCLK, GPIO.HIGH)
            GPIO.output(self.__SCLK, GPIO.LOW)
        GPIO.output(self.__CS, GPIO.HIGH)
        return value

    def toggleIO(self, cmdStr):
        cmd = GPIO64Cmd.GPIO64Cmd(cmdStr)
        if (cmd.isValid() == True):
            addressGPIO = self.GPIO[cmd.getPort()]
            addressOLAT = self.OLAT[cmd.getPort()]
            bank = self.BANK[cmd.getBank()]
            data = self.getSPI(bank, addressGPIO)
            data ^= (1 << cmd.getPin())
            self.setSPI(bank, addressOLAT, data)

    def getIO(self, cmdStr):
        cmd = GPIO64Cmd.GPIO64Cmd(cmdStr)
        if (cmd.isValid() == True):
            address = self.GPIO[cmd.getPort()]
            bank = self.BANK[cmd.getBank()]
            data = self.getSPI(bank, address)
            if ((data & (1 << cmd.getPin())) != 0):
                return 1
            else:
                return 0
        else:
            return -1

    def setIO(self, cmdStr, level):
        cmd = GPIO64Cmd.GPIO64Cmd(cmdStr)
        if (cmd.isValid() == True):
            addressGPIO = self.GPIO[cmd.getPort()]
            addressOLAT = self.OLAT[cmd.getPort()]
            bank = self.BANK[cmd.getBank()]
            data = self.getSPI(bank, addressGPIO)
            if (level == 1):
                data |= (1 << cmd.getPin())
            else:
                data &= (~(1 << cmd.getPin()))
            self.setSPI(bank, addressOLAT, data)

    def setDirection(self, cmdStr, direction):
        # direction: 1 means input
        # direction: 0 means output
        cmd = GPIO64Cmd.GPIO64Cmd(cmdStr)
        if (cmd.isValid() == True):
            address = self.IODIR[cmd.getPort()]
            self.__setReg(cmd, address, direction)

    def setPullupMode(self, cmdStr, mode):
        # mode: 1 means pullup enable
        # mode: 0 means pullup disable
        cmd = GPIO64Cmd.GPIO64Cmd(cmdStr)
        if (cmd.isValid() == True):
            address = self.GPPU[cmd.getPort()]
            self.__setReg(cmd, address, mode)

    def init(self):
        for bank in self.BANK:
            self.setSPI(bank, self.IOCON, self.IOCON_HAEN)
            self.setSPI(bank, self.IODIR[0], 0)
            self.setSPI(bank, self.IODIR[1], 0xFF)
            self.setSPI(bank, self.GPPU[1], 0xFF)

    def clear(self):
        for bank in self.BANK:
            for reg in self.GPIO:
                self.setSPI(bank, reg, 0)
