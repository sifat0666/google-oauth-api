// import logger from "pino";
import dayjs from "dayjs";

import pino from "pino";

const log = pino({
  transport: {
    target: 'pino-pretty'
  },
  base:{
        pid: false
    },
timestamp: ()=> `,"time":"${dayjs().format()}"`
})

// log.info('hi')

export default log