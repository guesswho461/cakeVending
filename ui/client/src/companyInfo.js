import demoQRCode from "./imgs/demoQRCode.svg";
import lineLogo from "./imgs/lineLogo.svg";
import fbLogo from "./imgs/fbLogo.svg";
import igLogo from "./imgs/igLogo.svg";
import twitterLogo from "./imgs/twitterLogo.svg";

const companyInfo = {
  title: "老闆不在雞蛋糕",
  currency: "NT",
  // backendURL: "http://" + window.location.hostname + ":8081",
  // brokerURL: "ws://" + window.location.hostname + ":8000",
  // brokerURL: "ws://localhost:8000",
  backendURL: "http://192.168.1.99:8081",
  brokerURL: "ws://192.168.1.99:8000",
  footers: [
    {
      title: "LINE",
      description: "LINE QR code",
      logo: [lineLogo],
      qrCode: [demoQRCode]
    },
    {
      title: "FB",
      description: "FB QR code",
      logo: [fbLogo],
      qrCode: [demoQRCode]
    },
    {
      title: "IG",
      description: "IG QR code",
      logo: [igLogo],
      qrCode: [demoQRCode]
    },
    {
      title: "Twitter",
      description: "Twitter QR code",
      logo: [twitterLogo],
      qrCode: [demoQRCode]
    }
  ],
  topics: {
    gate: {
      root: "gate",
      cmd: {
        open: "gate/cmd/open"
      }
    },
    recipe: {
      root: "recipe",
      done: "recipe/done",
      takeIt: "recipe/takeIt"
    },
    coin: {
      root: "coin",
      status: {
        inc: "coin/status/inc"
      },
      cmd: {
        enable: "coin/cmd/enable"
      }
    },
    bucket: {
      root: "bucket",
      cmd: {
        jog: {
          vol: "bucket/cmd/jog/vol",
          vel: "bucket/cmd/jog/vel"
        },
        stop: "bucket/cmd/stop",
        par: {
          jog: {
            calibration: "bucket/cmd/par/jog/calibration",
            microStepPerStep: "bucket/cmd/par/jog/microStepPerStep"
          },
          vol: {
            calibrationA: "bucket/cmd/par/vol/calibrationA",
            calibrationB: "bucket/cmd/par/vol/calibrationB"
          }
        }
      },
      status: {
        alarm: "bucket/status/alarm",
        vol: "bucket/status/vol",
        mode: "bucket/status/mode",
        jog: {
          vol: "bucket/status/jog/vol",
          vel: "bucket/status/jog/vel"
        },
        stop: "bucket/status/stop",
        par: {
          jog: {
            calibration: "bucket/status/par/jog/calibration",
            microStepPerStep: "bucket/status/par/jog/microStepPerStep"
          },
          vol: {
            calibrationA: "bucket/status/par/vol/calibrationA",
            calibrationB: "bucket/status/par/vol/calibrationB"
          }
        }
      }
    },
    latch: {
      root: "latch",
      cmd: {
        openDoor: "latch/cmd/openDoor",
        vibration: "latch/cmd/vibration",
        openGate: "latch/cmd/openGate",
        openFan: "latch/cmd/openFan",
        rArm: {
          pos: "latch/cmd/rArm/pos",
          home: "latch/cmd/rArm/home",
          len: "latch/cmd/rArm/len",
          suck: "latch/cmd/rArm/suck"
        },
        lArm: {
          pos: "latch/cmd/lArm/pos",
          home: "latch/cmd/lArm/home",
          len: "latch/cmd/lArm/len",
          suck: "latch/cmd/lArm/suck"
        },
        par: {
          rArm: {
            pitch: "latch/cmd/par/rArm/pitch"
          },
          lArm: {
            pitch: "latch/cmd/par/lArm/pitch"
          }
        }
      },
      status: {
        bowl: {
          ready: "latch/status/bowl/ready"
        },
        alarm: "latch/status/alarm",
        bagCnt: "latch/status/bagCnt",
        openDoor: "latch/status/openDoor",
        vibration: "latch/status/vibration",
        openGate: "latch/status/openGate",
        openFan: "latch/status/openFan",
        rArm: {
          pos: "latch/status/rArm/pos",
          home: "latch/status/rArm/home",
          len: "latch/status/rArm/len",
          suck: "latch/status/rArm/suck"
        },
        lArm: {
          pos: "latch/status/lArm/pos",
          home: "latch/status/lArm/home",
          len: "latch/status/lArm/len",
          suck: "latch/status/lArm/suck"
        },
        par: {
          rArm: {
            pitch: "latch/status/par/rArm/pitch"
          },
          lArm: {
            pitch: "latch/status/par/lArm/pitch"
          }
        }
      }
    },
    robot: {
      root: "robot",
      cmd: {
        jog: {
          x: "robot/cmd/jog/x",
          y: "robot/cmd/jog/y",
          z: "robot/cmd/jog/z",
          fork: "robot/cmd/jog/fork",
          vel: "robot/cmd/jog/vel"
        },
        stop: "robot/cmd/stop",
        home: {
          x: "robot/cmd/home/x",
          y: "robot/cmd/home/y",
          z: "robot/cmd/home/z",
          fork: "robot/cmd/home/fork"
        },
        par: {
          x: {
            stepPerMM: "robot/cmd/par/x/stepPerMM"
          },
          y: {
            stepPerMM: "robot/cmd/par/y/stepPerMM"
          },
          z: {
            stepPerMM: "robot/cmd/par/z/stepPerMM"
          }
        }
      },
      status: {
        alarm: "robot/status/alarm",
        mode: "robot/status/mode",
        vol: "robot/status/vol",
        jog: {
          x: "robot/status/jog/x",
          y: "robot/status/jog/y",
          z: "robot/status/jog/z",
          fork: "robot/status/jog/fork",
          vel: "robot/status/jog/vel"
        },
        stop: "robot/status/stop",
        home: {
          x: "robot/status/home/x",
          y: "robot/status/home/y",
          z: "robot/status/home/z",
          fork: "robot/status/home/fork"
        },
        par: {
          x: {
            stepPerMM: "robot/status/par/x/stepPerMM"
          },
          y: {
            stepPerMM: "robot/status/par/y/stepPerMM"
          },
          z: {
            stepPerMM: "robot/status/par/z/stepPerMM"
          }
        }
      }
    },
    oven: {
      root: "oven",
      cmd: {
        flip: "oven/cmd/flip",
        open: "oven/cmd/open",
        home: {
          flip: "oven/cmd/home/flip",
          open: "oven/cmd/home/open"
        },
        stop: "oven/cmd/stop",
        tempature: "oven/cmd/tempature",
        par: {
          flip: {
            gearRatio: "oven/cmd/par/flip/gearRatio"
          },
          open: {
            gearRatio: "oven/cmd/par/open/gearRatio"
          }
        }
      },
      status: {
        alarm: "oven/status/alarm",
        tempature: "oven/status/tempature",
        flip: "oven/status/flip",
        open: "oven/status/open",
        home: {
          flip: "oven/status/home/flip",
          open: "oven/status/home/open"
        },
        stop: "oven/status/stop",
        par: {
          flip: {
            gearRatio: "oven/status/par/flip/gearRatio"
          },
          open: {
            gearRatio: "oven/status/par/open/gearRatio"
          }
        }
      }
    }
  }
};

export default companyInfo;
