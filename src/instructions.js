export const MCP_SERVER_INSTRUCTION = `\
This is the MCP server for a BaSB workspace. The BaSB is short for "Blog as Second Brain",\
which is a personal knowledge management system.

You can use this MCP server to access the directories and blogs in the BaSB workspace.\
`

export const BLOG_RESOURCE_INSTRUCTION = `\
This resource template is used to get the content of an blog specified by the path.
The returned value is the content of target blog in Markdown format.\
`

export const DIRECTORY_RESOURCE_INSTRUCTION = `\
This resource template is used to get data for a directory specified by the path.
The data includes the blog metadatas in the directory, the subdirectories, and the description of the target directory.

Resource URI format: \`directory://{path}/?page={page}\`, the \`path\` and \`page\` parameter are both **NECESSARY**.
If the specified path is "root", the root directory of the BaSB workspace will be used.

The returned value is a JSON object with the following structure:
\`\`\`
{
  "total": number,              // Total number of pages
  "current": number,            // Current page number
  "content": [                  // Content list
    {
      "name": string,           // Name (folders end with /, files end with .md)
      "createTime": number,     // Creation timestamp
      "modifyTime": number      // Modification timestamp
    },
    // ... more content items
  ],
  "createTime": number,         // Directory creation timestamp
  "updateTime": number,         // Directory update timestamp
  "isReversed": boolean,        // Whether the order is reversed
  "dirDescription": string      // Directory description (Markdown format)
}
\`\`\``

export const NEWEST_RESOURCE_INSTRUCTION = `\
This resource template is used to get the newest blogs in the BaSB workspace.
The returned value is a JSON object with the following structure:
\`\`\`
{
  "total": number,              // Total number of pages
  "current": number,            // Current page number
  "content": [                  // Content list
    {
      "title": string,          // Blog title
      "link": string,           // Relative path to the blog
      "createTime": number      // Creation timestamp
    },
    // ... more content items
  ]
}
\`\`\``