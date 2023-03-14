import Room from './lib/Room.js'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import blessed from 'neo-blessed'

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('nickname', {
    alias: 'n',
    description: 'Nickname',
    type: 'string'
  })
  .option('room', {
    alias: 'r',
    description: 'Room ID',
    type: 'string'
  })
  .demandOption(['nickname', 'room'])
  .argv

async function view () {
  const room = new Room(argv.room, argv.nickname)
  // Create a screen object.
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Chat'
  })

  // Create a message list box
  const messageList = blessed.list({
    align: 'left',
    mouse: true,
    keys: true,
    width: '100%',
    height: '90%',
    top: 0,
    left: 0,
    scrollbar: {
      ch: ' ',
      inverse: true
    },
    items: []
  })

  // Create a message input box
  const messageInput = blessed.textbox({
    bottom: 0,
    height: '10%',
    inputOnFocus: true,
    padding: {
      left: 2,
      top: 1,
      bottom: 1,
      right: 2
    },
    style: {
      fg: '#787878',
      bg: '#454545',
      focus: {
        fg: '#f6f6f6',
        bg: '#353535'
      }
    }
  })

  // Add input handler and exit handler
  messageInput.key('enter', async () => {
    const message = messageInput.getValue()
    try {
      await room.sendMessage(message)
    } catch (e) {
      console.error(e)
    } finally {
      messageInput.clearValue()
      screen.render()
      messageInput.focus()
    }
  })
  screen.key(['escape'], function () {
    return process.exit(0)
  })

  // Add the message list and input to the screen
  screen.append(messageList)
  screen.append(messageInput)

  // Focus our element.
  messageInput.focus()

  // Render the screen.
  screen.render()

  // Add event listeners
  room.on('chat', (message) => {
    // console.log(message)
    messageList.addItem(message.nickname + ': ' + message.text)
    messageList.scrollTo(100)
    screen.render()
  })
  room.on('join', (message) => {
    // console.log(message)
    messageList.addItem(message.nickname + ' joined the chat!')
    messageList.scrollTo(100)
    screen.render()
  })
}

view()
