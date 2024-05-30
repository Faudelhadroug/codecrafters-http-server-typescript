import * as net from "net"
import { Buffer } from "buffer"

const OK_200_RESPONSE: string = "HTTP/1.1 200 OK"
const NotFound_400_RESPONSE: string = "HTTP/1.1 404 Not Found"
const ContentType_TextPlain_RESPONSE = "Content-Type: text/plain\r\n"

const server = net.createServer((socket: Buffer) => {
    socket.on("data", (data: Buffer) => {
        const request = data.toString()
        const path = request.split(" ")[1]
        const echoRequest = path.split("/echo/")[1]
        if(echoRequest){
            const ContentLength_REPONSE = `Content-Length: ${echoRequest.length}`
            const response = `${OK_200_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}${ContentLength_REPONSE}\r\n\r\n${echoRequest}`
            socket.write(response)
            socket.end()
            return;
        }
        console.log(path)
        if(path === "/"){
            socket.write(`${OK_200_RESPONSE}\r\n\r\n`)
            socket.end()
            return;
        }
        if(path === '/user-agent'){
            const userAgentRequest = request.split("User-Agent: ")[1]
            const ContentLength_REPONSE = `Content-Length: ${userAgentRequest.trim().length}`
            const response = `${OK_200_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}${ContentLength_REPONSE}\r\n\r\n${userAgentRequest}`
            socket.write(response)
        }
        socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`)
        socket.end()
    })
})

const PORT = 4221
server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`)
})
