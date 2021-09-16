import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"

import postsRouter from "./services/posts/index.js"
import authorsRouter from "./services/authors/index.js"
import { badRequestErrorHandler, notFoundErrorHandler, forbiddenErrorHandler, genericServerErrorHandler } from "./services/errorHandlers.js"

const server = express()

const port = 3001

// ***************** GLOBAL MIDDLEWARES ***********************

server.use(cors())
server.use(express.json())


// ***************** ENDPOINTS *********************

server.use("/blogPosts", postsRouter)
server.use("/authors", authorsRouter)


// *********************** ERROR MIDDLEWARES *************************

server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(genericServerErrorHandler)
console.table(listEndpoints(server))

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})