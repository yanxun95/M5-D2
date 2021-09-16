import express from "express" // 3RD PARTY MODULE
import fs from "fs" // CORE MODULE
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" // 3RD PARTY MODULE
import createHttpError from "http-errors"
import { postsValidationMiddleware } from "./validations.js"
import { validationResult } from "express-validator"

const postsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "posts.json")

const getPosts = () => JSON.parse(fs.readFileSync(postsJSONPath))
const writePosts = content => fs.writeFileSync(postsJSONPath, JSON.stringify(content))

const postsRouter = express.Router() // postsRouter is going to have /students as a prefix

const anotherLoggerMiddleware = (req, res, next) => {
    console.log(`ojoijasodjosajdosjadoijaosidjasd`)
    next() // MANDATORY!!!! I need to execute this function to give the control to what is coming next (either another middleware or the request handler)
}

// 1.
postsRouter.post("/", postsValidationMiddleware, (req, res, next) => {
    const errorsList = validationResult(req)
    if (!errorsList.isEmpty()) {
        next(createHttpError(400, { errorsList }))
    } else {
        try {
            const newPost = { id: uniqid(), ...req.body, createdAt: new Date() }

            const posts = getPosts()

            posts.push(newPost)

            writePosts(posts)

            res.status(201).send({ id: newPost.id })
        } catch (error) {
            next(error) // If I use next here I'll send the error to the error handlers
        }
    }
})

// 2.
postsRouter.get("/", (req, res, next) => {
    try {
        const posts = getPosts()
        if (req.query && req.query.title) {
            const filteredPosts = posts.filter(post => post.title === req.query.title)
            res.send(filteredPosts)
        } else {
            res.send(posts)
        }
    } catch (error) {
        next(error) // If I use next here I'll send the error to the error handlers
    }
})

// 3.
postsRouter.get("/:postID", (req, res, next) => {
    try {
        const posts = getPosts()
        const post = posts.find(b => b.id === req.params.postID)
        if (post) {
            res.send(post)
        } else {
            next(createHttpError(404, `post with ID ${req.params.postID} not found!`)) // we want to trigger 404 error handler
        }
    } catch (error) {
        next(error)
    }
})

// 4.
postsRouter.put("/:postID", (req, res, next) => {
    try {
        const posts = getPosts()

        const index = posts.findIndex(b => b.id === req.params.postID)

        const postToModify = posts[index]
        const updatedFields = req.body

        const updatedpost = { ...postToModify, ...updatedFields }

        posts[index] = updatedpost

        writePosts(posts)

        res.send(updatedpost)
    } catch (error) {
        next(error)
    }
})

// 5.
postsRouter.delete("/:postID", (req, res, next) => {
    try {
        const posts = getPosts()

        const filteredPosts = posts.filter(post => post.id !== req.params.postID)

        writePosts(filteredPosts)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default postsRouter