import * as net from "net"
import { Buffer } from "buffer"
import fs from "fs"
import * as zlib from "zlib"

const OK_200_RESPONSE: string = "HTTP/1.1 200 OK"
const CREATED_201_RESPONSE: string = "HTTP/1.1 201 Created"
const NotFound_400_RESPONSE: string = "HTTP/1.1 404 Not Found"
const ContentType_TextPlain_RESPONSE: string = "Content-Type: text/plain"
const ContentType_OctetStream_RESPONSE: string =
    "Content-Type: application/octet-stream"

const server = net.createServer((socket) => {
    socket.on("data", (data: Buffer) => {
        const request: string = data.toString()
        const path = request.split(" ")[1]
        const echoRequest = path.split("/echo/")[1]
        if (echoRequest) handleEchoRequest(socket, request, echoRequest);
        if (path === "/") {
            socket.write(`${OK_200_RESPONSE}\r\n\r\n`)
        }
        if (path === "/user-agent") {
            const userAgentRequest = request.split("User-Agent: ")[1]
            const ContentLength_RESPONSE = `Content-Length: ${
                userAgentRequest.trim().length
            }`
            const response = `${OK_200_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}\r\n${ContentLength_RESPONSE}\r\n\r\n${userAgentRequest}`
            socket.write(response)
        }
        if (path.substring(0, 7) === "/files/") handleFile(socket, request, path)
        socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`)
    })
})

function handleEchoRequest(socket: net.Socket, request: string, echoRequest: string): void {

        const ContentLength_RESPONSE = `Content-Length: ${echoRequest.length}`
        const ContentEncoding_RESPONSE = "Content-Encoding: gzip"
        if (request.includes("gzip")) {
            const gzipEcho = zlib.gzipSync(echoRequest)
            const ContentLengthGZIP_RESPONSE = `Content-Length: ${gzipEcho.length}`
            const response = `${OK_200_RESPONSE}\r\n${ContentEncoding_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}\r\n${ContentLengthGZIP_RESPONSE}\r\n\r\n`
            socket.write(response)
            socket.write(gzipEcho)
        }

        const response = `${OK_200_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}\r\n${ContentLength_RESPONSE}\r\n\r\n${echoRequest}`
        socket.write(response)
}

function handleFile(socket: net.Socket, request: string, path: string) {
    const fileDirectory = path.substring(7)
    const directoy = process.argv[3]
    const filePath = `${directoy}/${fileDirectory}`
    if (request.includes("GET")) {
        try {
            const contentFile = fs.readFileSync(filePath)
            const ContentLength_RESPONSE = `Content-Length: ${
                contentFile.toString().length
            }`
            const response = `${OK_200_RESPONSE}\r\n${ContentType_OctetStream_RESPONSE}\r\n${ContentLength_RESPONSE}\r\n\r\n${contentFile}`
            socket.write(response)

        } catch (error: unknown) {
            socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`)

        }
    }
    if (request.includes("POST")) {
        const contentToSave = request.split("\r\n\r\n")[1]
        fs.writeFile(filePath, contentToSave, (err) => {
            if (err) {
                socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`)
            }
        })
        const response = `${CREATED_201_RESPONSE}\r\n\r\n`
        socket.write(response)
    }
}
const PORT = 4221
server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`)
})
