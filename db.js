const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
    'test_tg_bot',
    'root',
    'root',
    {
        host: '185.91.55.154',
        port: '6432',
        dialect: 'postgres',
    },
)