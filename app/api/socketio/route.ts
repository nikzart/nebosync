import { NextRequest } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

// Store the socket server instance
let io: SocketIOServer | null = null

export async function GET(req: NextRequest) {
  if (!io) {
    // Initialize Socket.IO server
    const httpServer = (req as any).socket?.server as HTTPServer

    if (httpServer) {
      io = new SocketIOServer(httpServer, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      })

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        // Join a room based on guest ID
        socket.on('join-room', (guestId: string) => {
          socket.join(`guest-${guestId}`)
          console.log(`Socket ${socket.id} joined room: guest-${guestId}`)
        })

        // Handle new messages
        socket.on('send-message', (data) => {
          // Broadcast to all clients in the guest's room
          io?.to(`guest-${data.guestId}`).emit('new-message', data)
        })

        // Handle order updates
        socket.on('order-update', (data) => {
          io?.to(`guest-${data.guestId}`).emit('order-updated', data)
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })
    }
  }

  return new Response('Socket.IO server running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
