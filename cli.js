#!/usr/bin/env node
import mcpMain from "./src/server.js"

const commandLineArgs = process.argv.slice(2)
const [ targetEndpoint, mcpPort ] = commandLineArgs
mcpMain(targetEndpoint, mcpPort)
