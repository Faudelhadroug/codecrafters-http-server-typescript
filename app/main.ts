import * as net from "net"
import { Buffer } from "buffer"

const server = net.createServer((socket: Buffer) => {
    const OK_200_RESPONSE: string = "HTTP/1.1 200 OK\r\n\r\n";
    const NotFound_400_RESPONSE: string = "HTTP/1.1 404 Not Found\r\n\r\n"
    socket.on("data", (data: Buffer) => {
        const request = data.toString()
        const path = request.split(" ")[1]
        const response = path === "/"
            ? OK_200_RESPONSE
            : NotFound_400_RESPONSE
        socket.write(response)
        socket.end()
    })
})

const PORT = 4221
server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`)
})
