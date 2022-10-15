const TelegramAPI = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '5794343045:AAFS3144mR6xrwHbTLIRwRHXDfSTg6vMcFM'

const bot = new TelegramAPI(token, { polling: true })

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'Отгадай!', gameOptions)
}

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (err) {
        console.log('Подключение к БД сломалось.', err)
    }

    bot.setMyCommands([
        { command: '/start', description: 'Начальное приветствие' },
        { command: '/info', description: 'Получить информацию  о пользователе' },
        { command: '/game', description: 'Игра угадай цифру' },
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        try {
            if (text === '/start') {
                await UserModel.create({ chatId })
                await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/192/7.webp')
                return bot.sendMessage(chatId, `Добро пожаловать!`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({ chatId })
                return bot.sendMessage(chatId, `Тебя зовут ${ msg.from.first_name } ${ msg.from.last_name }. В игре у тебя правильных ответов ${ user.right }, неправильных ${ user.wrong }.`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю!')
        } catch (err) {
            return bot.sendMessage(chatId, 'Произошла какая-то ошибка!')
            console.log(err)
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id

        if (data === '/again') {
            return startGame(chatId)
        }

        const user = await UserModel.findOne({ chatId })

        if (+data === +chats[chatId]) {
            user.right += 1
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${ chats[chatId] }.`, againOptions)
        } else {
            user.wrong += 1
            await bot.sendMessage(chatId, `К сожалению, ты не отгадал, бот загадал цифру ${ chats[chatId] }.`, againOptions)
        }
        await user.save()
    })
}

start()