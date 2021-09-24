import express from "express"
import multer from "multer"
import uniqid from "uniqid"
import { join } from "path"


import { getAuthors, writeAuthors, saveAuthorPicture, authorsPublicFolderPath } from "../../lib/fs-tools.js"

const authorsRouter = express.Router() // authorsRouter is going to have /students as a prefix

// 1.
authorsRouter.post("/", async (req, res, next) => {

    try {
        const newAuthor = { id: uniqid(), ...req.body, createdAt: new Date() }

        const authors = await getAuthors()

        authors.push(newAuthor)

        writeAuthors(authors)

        res.status(201).send({ id: newAuthor.id })
    } catch (error) {
        next(error) // If I use next here I'll send the error to the error handlers
    }

})

// 2.
authorsRouter.get("/", async (req, res, next) => {
    try {
        const authors = await getAuthors()
        if (req.query && req.query.title) {
            const filteredAuthors = authors.filter(author => author.title === req.query.title)
            res.send(filteredAuthors)
        } else {
            res.send(authors)
        }
    } catch (error) {
        next(error) // If I use next here I'll send the error to the error handlers
    }
})

// 3.
authorsRouter.get("/:authorID", async (req, res, next) => {
    try {
        const authors = await getAuthors()
        const author = authors.find(author => author.id === req.params.authorID)
        if (author) {
            res.send(author)
        } else {
            next(createHttpError(404, `author with ID ${req.params.authorID} not found!`)) // we want to trigger 404 error handler
        }
    } catch (error) {
        next(error)
    }
})

// 4.
authorsRouter.put("/:authorID", async (req, res, next) => {
    try {
        const authors = await getAuthors()

        const index = authors.findIndex(author => author.id === req.params.authorID)

        const authorToModify = authors[index]
        const updatedFields = req.body

        const updatedauthor = { ...authorToModify, ...updatedFields }

        authors[index] = updatedauthor

        writeAuthors(authors)

        res.send(updatedauthor)
    } catch (error) {
        next(error)
    }
})

// 5.
authorsRouter.delete("/:authorID", async (req, res, next) => {
    try {
        const authors = await getAuthors()

        const filteredAuthors = authors.filter(author => author.id !== req.params.authorID)

        writeAuthors(filteredAuthors)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

authorsRouter.post("/:authorID/uploadAvatar", multer().single("profilePic"), async (req, res, next) => {
    try {
        console.log(req.file)

        const authors = await getAuthors()

        await saveAuthorPicture(`${req.params.authorID}.png`, req.file.buffer)

        const index = authors.findIndex(author => author.id === req.params.authorID)

        const authorToModify = authors[index]
        const authorImgPath = join(authorsPublicFolderPath, `./${req.params.authorID}.png`)
        console.log(authorImgPath)

        const updatedAuthor = { ...authorToModify, authorImgPath }

        authors[index] = updatedAuthor

        writeAuthors(authors)

        res.send(updatedAuthor)
    } catch (error) {
        next(error) // If I use next here I'll send the error to the error handlers
    }

})




export default authorsRouter