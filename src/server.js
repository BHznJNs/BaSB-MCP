import express from "express"
import cors from "cors"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { mcpServerFactory } from "./index.js"

const app = express()
const globalStates = {
    targetEndpoint: null,
}

app.use(express.json())
app.use(cors({
    origin: "*",
    exposedHeaders: ["Mcp-Session-Id"],
    allowedHeaders: ["Content-Type", "mcp-session-id"],
}))

function notAllowedHandler(_req, res) {
    console.log('Received DELETE MCP request')
    res.writeHead(405).end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed."
        },
        id: null
    }))
}
app.get("/mcp", notAllowedHandler)
app.delete("/mcp", notAllowedHandler)

app.post("/mcp", async (req, res) => {
    const server = mcpServerFactory(globalStates.targetEndpoint)
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,  
    })

    res.on("close", () => {
        transport.close()
        server.close()
    })

    try {
        await server.connect(transport)
        await transport.handleRequest(req, res, req.body)
    } catch(e) {
        console.error("Error handling MCP request:", e)
        if (res.headersSent) return
        res.status(500).json({
            jsonrpc: "2.0",
            error: {
            code: -32603,
                message: "Internal server error",
            },
            id: null,
        })
    }
})

/**
 * @param {string} targetEndpoint
 * @param {number} port
 */
export default function mcpMain(targetEndpoint, port) {
    globalStates.targetEndpoint = targetEndpoint
    app.listen(port, "0.0.0.0", () => {
        console.log(`MCP server listening on 0.0.0.0:${port}, target endpoint: ${targetEndpoint}.`)
    })
}
