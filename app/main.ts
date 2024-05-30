import * as net from "net"
import { Buffer } from "buffer"

const OK_200_RESPONSE: string = "HTTP/1.1 200 OK\r\n";
const NotFound_400_RESPONSE: string = "HTTP/1.1 404 Not Found\r\n\r\n"

const ContentType_TextPlain_RESPONSE = "Content-Type: text/plain\r\n"

const server = net.createServer((socket: Buffer) => {
    socket.on("data", (data: Buffer) => {
        const request = data.toString()
        const path = request.split(" ")[1]
        const echoRequest = path.split("/echo/")
        const ContentLength_REPONSE = `Content-Length: ${echoRequest[1].length}\r\n`
        const response = `${OK_200_RESPONSE}${ContentType_TextPlain_RESPONSE}${ContentLength_REPONSE}\r\n${echoRequest[1]}`
        socket.write(response)
        socket.end()
    })
})

const PORT = 4221
server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`)
})
