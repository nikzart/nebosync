import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = () => {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}
