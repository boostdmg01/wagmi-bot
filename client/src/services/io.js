import { io } from 'socket.io-client'
import config from '@/config'

class IOService {
  socket;
  constructor() {
    this.socket = io(config.WEBSOCKET_API_URL, { path: "/socket.io" })
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