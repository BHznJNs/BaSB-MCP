import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { MCP_SERVER_INSTRUCTION, BLOG_RESOURCE_INSTRUCTION, NEWEST_RESOURCE_INSTRUCTION, DIRECTORY_RESOURCE_INSTRUCTION } from "./instructions.js"

function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/")
}
function pathToIndexFilename(path, index) {
    const normalizedPath = normalizePath(path)
    const removedTailSlash = normalizedPath.replace(/\/$/, "")
    const filename = removedTailSlash.split("/").join("+")
    return filename + "_" + index
}

// --- --- --- --- --- ---

const mcpGlobalStates = {
    targetEndpoint: null,
}

export function setTargetEndpoint(targetEndpoint) {
    mcpGlobalStates.targetEndpoint = targetEndpoint
}

export function mcpServerFactory() {
    /**
     * @param {string | string[]} path 
     * @returns {Promise<string>} The target blog content in Markdown format
     */
    async function blogContentHandler(path /** @type {string} */) {
        const targetResourceUrl = new URL("static/" + path, mcpGlobalStates.targetEndpoint)
        console.log("Target blog url: ", targetResourceUrl.href)
        const response = await fetch(targetResourceUrl)
        return await response.text()
    }

    /**
     * @param {string | string[]} page 
     * @returns {Promise<object>}
     */
    async function newestContentHandler(page) {
        const resolvedPath = "newest_" + page
        const targetResourceUrl = new URL(`.index/${resolvedPath}`, mcpGlobalStates.targetEndpoint)
        console.log("Target newest index url: ", targetResourceUrl.href)
        const response = await fetch(targetResourceUrl)
        return await response.json()
    }

    /**
     * @param {string | string[]} path 
     * @param {string | string[]} page 
     * @returns {Promise<object>}
     */
    async function directoryHandler(path, page) {
        path = path === "root"
            ? "static"
            : "static/" + path
        const resolvedPath = pathToIndexFilename(path, page)
        const targetResourceUrl = new URL(`.index/${resolvedPath}`, mcpGlobalStates.targetEndpoint)
        console.log("Target directory index url: ", targetResourceUrl.href)
        const response = await fetch(targetResourceUrl)
        return await response.json()
    }

    const server = new McpServer({
        name: "BaSB-MCP",
        version: "1.0.3",
    }, {
        instructions: MCP_SERVER_INSTRUCTION
    })

    server.registerResource(
        "blog",
        new ResourceTemplate("blog://{+path}", { list: undefined }),
        {
            title: "Blog Content",
            description: BLOG_RESOURCE_INSTRUCTION,
        },
        async (uri, { path }) => {
            const result = await blogContentHandler(path)
            return {
                contents: [{
                    uri: uri.href,
                    text: result,
                    mimeType: "text/markdown",
                }]
            }
        }
    )

    server.registerResource(
        "newest",
        new ResourceTemplate("newest://?page={page}", { list: undefined }),
        {
            title: "Newest Content",
            description: NEWEST_RESOURCE_INSTRUCTION,
        },
        async (uri, { page }) => {
            const result = await newestContentHandler(page)
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify(result),
                    mimeType: "application/json",
                }]
            }
        }
    )

    server.registerResource(
        "directory",
        new ResourceTemplate("directory://{path}/?page={page}", { list: undefined }),
        {
            title: "Directory Content",
            description: DIRECTORY_RESOURCE_INSTRUCTION,
        },
        async (uri, { path, page }) => {
            const result = await directoryHandler(path, page)
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify(result),
                    mimeType: "application/json",
                }]
            }
        }
    )

    return server
}
