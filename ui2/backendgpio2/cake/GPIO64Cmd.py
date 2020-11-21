# cake gpio 64 cmd parser python module


class GPIO64Cmd():
    def __init__(self, cmdStr):
        self.__bank = 0
        self.__port = 0
        self.__pin = 0
        self.__isValid = False
        if len(cmdStr) == 3:
            self.__bank = self.__parseBank(cmdStr[0])
            self.__port = self.__parsePort(cmdStr[1])
            self.__pin = self.__parsePin(cmdStr[2])
            if self.__bank < 0 or self.__port < 0 or self.__pin < 0:
                self.__isValid = False
            else:
                self.__isValid = True
        else:
            assert(len(cmdStr) != 3)

    def __parseBank(self, cmd):
        result = 0
        cmd = cmd.upper()
        if cmd == "A":
            result = 0
        elif cmd == "B":
            result = 1
        elif cmd == "C":
            result = 2
        elif cmd == "D":
            result = 3
        else:
            result = -1
        return result

    def __parsePort(self, cmd):
        result = int(cmd) - 1
        if result >= 2 or result < 0:
            result = -1
        return result

    def __parsePin(self, cmd):
        result = int(cmd) - 1
        if result >= 8 or result < 0:
            result = -1
        return result

    def isValid(self):
        return self.__isValid

    def getBank(self):
        return self.__bank

    def getPort(self):
        return self.__port

    def getPin(self):
        return self.__pin
