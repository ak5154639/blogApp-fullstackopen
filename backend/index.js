const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')
const mongoose = require('mongoose')


const start = async () => {
    try {
        logger.info('connecting to MongoDB')

        await mongoose.connect(config.MONGODB_URL, { family: 4 })

        logger.info('connected to MongoDB')

        app.listen(config.PORT, () => {
            logger.info(`Server running on port ${config.PORT}`)
        })
    } catch (error) {
        logger.error('error connecting to MongoDB:', error.message)
    }
}

start()