import { Server } from 'socket.io'
import "dotenv/config.js"


let io;

export const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL
        } 
    })

    return io
}

export const getIo = () => {
    if(!io) return
    return io;
}

let socketClientId;
export const socketId = (id) => {
    socketClientId = id
    return socketClientId;
}

export const getSocketClientId = () => {
    if(!socketClientId) {
        throw new Error(`Client Socket id is ${socketClientId}`)
    }
    return socketClientId;
}
