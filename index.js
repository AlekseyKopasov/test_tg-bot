const TelegramAPI = require('node-telegram-bot-api')
const { BotToken } = require('./consts')

const token = BotToken

const bot = new TelegramAPI(token, { polling: true })

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Начальное приветствие' },
        { command: '/info', description: 'Получить информацию  о пользователе' },
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatID = msg.chat.id

        if (text === '/start') {
            await bot.sendSticker(chatID, 'https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/192/7.webp')
            return bot.sendMessage(chatID, `Добро пожаловать!`)
        }
        if (text === '/info') {
            return bot.sendMessage(chatID, `Тебя зовут ${ msg.from.first_name } ${ msg.from.last_name }.`)
        }
        return bot.sendMessage(chatID, 'Я тебя не понимаю!')
    })
}

start()