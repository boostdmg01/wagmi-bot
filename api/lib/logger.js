const { createLogger, transports, format } = require('winston');

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.splat(),
    format.printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      })
)

const fileFormat = format.combine(
    format.timestamp(),
    format.splat(),
    format.printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
    })
)

const logger = createLogger({
    exitOnError: false,
    level: process.env.ENVIRONMENT !== 'production' ? 'debug' : 'info',
    transports: [
        new transports.File({ filename: process.cwd() + '/log/error.log', level: 'error', format: fileFormat, handleExceptions: true, handleRejections: true }),
        new transports.File({ filename: process.cwd() + '/log/combined.log', format: fileFormat, handleExceptions: true, handleRejections: true })
    ]
})

if (process.env.ENVIRONMENT !== 'production') {
    logger.add(new transports.Console({ format: consoleFormat, handleExceptions: true, handleRejections: true }))
}

module.exports = logger