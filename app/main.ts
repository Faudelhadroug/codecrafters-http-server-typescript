import * as net from "net";
import { Buffer } from "buffer";
import fs from "fs";

const OK_200_RESPONSE: string = "HTTP/1.1 200 OK";
const OK_201_RESPONSE: string = "HTTP/1.1 201 Created";
const NotFound_400_RESPONSE: string = "HTTP/1.1 404 Not Found";
const ContentType_TextPlain_RESPONSE = "Content-Type: text/plain\r\n";
const ContentType_OctetStream_RESPONSE =
    "Content-Type: application/octet-stream\r\n";

const server = net.createServer((socket: Buffer) => {
    socket.on("data", (data: Buffer) => {
        const request = data.toString();
        const path = request.split(" ")[1];
        const echoRequest = path.split("/echo/")[1];
        if (echoRequest) {
            const ContentLength_RESPONSE = `Content-Length: ${echoRequest.length}`;
            const ContentEncoding_RESPONSE = "Content-Encoding: gzip";
            console.log(request)
            if(request.includes('gzip')){
                console.log('accept')
                const response = `${OK_200_RESPONSE}\r\n${ContentEncoding_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}${ContentLength_RESPONSE}\r\n\r\n${echoRequest}`;
                socket.write(response);
                socket.end();
                return
            }
            console.log('not accepted')
            const response = `${OK_200_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}${ContentLength_RESPONSE}\r\n\r\n${echoRequest}`;
            socket.write(response);
            socket.end();
            return
        }
        if (path === "/") {
            socket.write(`${OK_200_RESPONSE}\r\n\r\n`);
            socket.end();
            return
        }
        if (path === "/user-agent") {
            const userAgentRequest = request.split("User-Agent: ")[1];
            const ContentLength_RESPONSE = `Content-Length: ${
                userAgentRequest.trim().length
            }`;
            const response = `${OK_200_RESPONSE}\r\n${ContentType_TextPlain_RESPONSE}${ContentLength_RESPONSE}\r\n\r\n${userAgentRequest}`;
            socket.write(response);
            socket.end();
            return
        }
        if (path.substring(0, 7) === "/files/") {
            const fileDirectory = path.substring(7);
            const directoy = process.argv[3];
            const filePath = `${directoy}/${fileDirectory}`;
            if (request.includes("GET")) {
                try {
                    const contentFile = fs.readFileSync(filePath);
                    const ContentLength_RESPONSE = `Content-Length: ${
                        contentFile.toString().length
                    }`;
                    const response = `${OK_200_RESPONSE}\r\n${ContentType_OctetStream_RESPONSE}${ContentLength_RESPONSE}\r\n\r\n${contentFile}`;
                    socket.write(response);
                    socket.end();
                } catch (error) {
                    socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`);
                    socket.end();
                }
                return
            }
            if (request.includes("POST")) {
                const contentToSave = request.split("\r\n\r\n")[1];
                fs.writeFile(filePath, contentToSave, (err) => {
                    if (err) {
                        socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`);
                        socket.end();
                        return
                    }
                });
                const response = `${OK_201_RESPONSE}\r\n\r\n`;
                socket.write(response);
                socket.end();
            }
        }
        socket.write(`${NotFound_400_RESPONSE}\r\n\r\n`);
        socket.end();
    })
})

const PORT = 4221;
server.listen(PORT, "localhost", () => {
    console.log(`Server is running on port ${PORT}`);
})
