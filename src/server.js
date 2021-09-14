import express from "express"
import listEndpoints from "express-list-endpoints"

import userRouter from "./services/authors/index.js"

const server = express()

const port = 3001

server.use(express.json())

server.use("/author", userRouter)
console.table(listEndpoints(server))

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})