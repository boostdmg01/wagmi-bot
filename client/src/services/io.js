import { io } from 'socket.io-client'

class IOService {
  socket;
  constructor() {
    this.socket = io(process.env.VUE_APP_WEBSOCKET_URL, { path: "/ws" })
  }

  getSocket() {
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

export default IOService;