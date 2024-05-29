import * as net from "net"
import { Buffer } from "buffer"

const server = net.createServer((socket: Buffer) => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n")
    socket.end()
})

const PORT = 4221
server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`)
})
