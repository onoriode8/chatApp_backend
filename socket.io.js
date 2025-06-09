import { Server } from 'socket.io'
import "dotenv/config.js"



let io;

//initialization of socket.io
export const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [process.env.FRONTEND_PORT, "http://localhost:5000"]
        } 
    })

    return io
}


//getting or rendering socket.io
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