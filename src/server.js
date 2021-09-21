import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import path from "path"

import postsRouter from "./services/posts/index.js"
import authorsRouter from "./services/authors/index.js"
import { badRequestErrorHandler, notFoundErrorHandler, forbiddenErrorHandler, genericServerErrorHandler } from "./services/errorHandlers.js"

const server = express()
const port = process.env.PORT
// const publicFolderPath = path.join(__dirname, "public")
// console.log("process", __dirname)



// ***************** CORS ***********************

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOpts = {
    origin: function (origin, next) {
        console.log("CURRENT ORIGIN: ", origin)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            // if received origin is in the whitelist we are going to allow that request
            next(null, true)
        } else {
            // if it is not, we are going to reject that request
            next(new Error(`Origin ${origin} not allowed!`))
        }
    },
}

// ***************** GLOBAL MIDDLEWARES ***********************

server.use('/public', express.static('public'))
server.use(cors(corsOpts))

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