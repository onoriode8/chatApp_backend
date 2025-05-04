import { Server } from 'socket.io'

let io;

//initialization of socket.io
export const init = (httpServer) => {
    io = new Server({
        origin: ["GET", "POST"]   
    })
    return io
}


//getting or rendering socket.io
export const getIo = () => {
    if(!io) return
    return io;
}