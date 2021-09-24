import express from "express"
import multer from "multer"
import { postsValidationMiddleware } from "./validations.js"
import { validationResult } from "express-validator"
import uniqid from "uniqid"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream" // Core module
import { sendEmail, sendEmailPdf } from "../../lib/email.js"
import json2csv from "json2csv"
import { getAuthorReadableStream } from "../../lib/fs-tools.js"
import createHttpError from "http-errors"

import { getPDFReadableStream } from "../../lib/pdf.js"


import { getPosts, writePosts, savePostCover, postCoversPublicFolderPath } from "../../lib/fs-tools.js"

const postsRouter = express.Router() // postsRouter is going to have /students as a prefix

const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "M5-D2",
    },
})
// 1.
postsRouter.post("/", postsValidationMiddleware, async (req, res, next) => {
    const errorsList = validationResult(req)
    if (!errorsList.isEmpty()) {
        next(createHttpError(400, { errorsList }))
    } else {
        try {
            const newPost = { id: uniqid(), ...req.body, createdAt: new Date() }

            const posts = await getPosts()

            posts.push(newPost)

            writePosts(posts)
            console.log("just create a new post")

            const newPosts = await getPosts()
            const post = await newPosts.find(post => post.id === newPost.id)
            if (post) {
                const source = await getPDFReadableStream(post)
                const destination = res

                pipeline(source, destination, err => {
                    if (err) next(err)
                })
            } else {
                next(createHttpError(404, `post with ID ${req.params.postID} not found!`)) // we want to trigger 404 error handler
            }

            const email = "yanxun951224@gmail.com"
            await sendEmailPdf(email, newPost.id)

            // res.status(201).send({ id: newPost.id })
        } catch (error) {
            next(error) // If I use next here I'll send the error to the error handlers
        }
    }
})

// 2.
postsRouter.get("/", async (req, res, next) => {
    try {
        const posts = await getPosts()
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
postsRouter.get("/:postID", async (req, res, next) => {
    try {
        const posts = await getPosts()
        const post = posts.find(post => post.id === req.params.postID)
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
postsRouter.put("/:postID", async (req, res, next) => {
    try {
        const posts = await getPosts()

        const index = posts.findIndex(post => post.id === req.params.postID)

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
postsRouter.delete("/:postID", async (req, res, next) => {
    try {
        const posts = await getPosts()

        const filteredPosts = posts.filter(post => post.id !== req.params.postID)

        writePosts(filteredPosts)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

postsRouter.get("/:postID/comments", async (req, res, next) => {
    try {
        const posts = await getPosts()
        const post = posts.find(post => post.id === req.params.postID)
        if (post) {
            res.send(post.comments)
        } else {
            next(createHttpError(404, `post with ID ${req.params.postID} not found!`)) // we want to trigger 404 error handler
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.post("/:postID/uploadCover", multer({ storage: cloudStorage }).single("postCover"), async (req, res, next) => {
    try {


        const posts = await getPosts()

        const coverImg = req.file.path

        const index = posts.findIndex(post => post.id === req.params.postID)

        const postToModify = posts[index]

        const updatedPost = { ...postToModify, coverImg }

        posts[index] = updatedPost

        writePosts(posts)

        res.send(updatedPost)

    } catch (error) {
        next(error) // If I use next here I'll send the error to the error handlers
    }

})

postsRouter.post("/:postID/comments", async (req, res, next) => {
    try {
        const posts = await getPosts()

        const index = posts.findIndex(post => post.id === req.params.postID)

        const postToModify = posts[index]
        const newCommant = { id: "Comment" + uniqid(), ...req.body, createdAt: new Date() }

        postToModify.comments.push(newCommant)

        // postToModify = { ...postToModify, comments: [...postToModify?.comments, newCommant] }

        posts[index] = postToModify

        writePosts(posts)

        res.send(postToModify)
    } catch (error) {
        next(error)
    }
})

postsRouter.get("/:postID/downloadPdf", async (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", `attachment; filename=example.pdf`)

        const posts = await getPosts()
        const post = posts.find(post => post.id === req.params.postID)
        if (post) {
            const source = await getPDFReadableStream(post)
            const destination = res

            pipeline(source, destination, err => {
                if (err) next(err)
            })
        } else {
            next(createHttpError(404, `post with ID ${req.params.postID} not found!`)) // we want to trigger 404 error handler
        }


    } catch (error) {
        next(error)
    }
})

postsRouter.get("/:postID/downloadCSV", async (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", `attachment; filename=example.csv`)

        const source = getAuthorReadableStream()
        const transform = new json2csv.Transform({ fields: ["id", "name", "email", "createdAt"] })
        const destination = res

        pipeline(source, transform, destination, err => {
            if (err) next(err)
        })
    } catch (error) {
        next(error)
    }
})

postsRouter.get("/:postID/sendEmail", async (req, res, next) => {
    try {
        // const { email } = req.body

        const email = "yanxun951224@gmail.com"
        await sendEmail(email)
        res.send("Email sent!")
    } catch (error) {
        next(error)
    }
})


export default postsRouter