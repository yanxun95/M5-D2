import express from "express" // 3RD PARTY MODULE
import fs from "fs" // CORE MODULE
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" // 3RD PARTY MODULE

const authorRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)
console.log("IMPORT META URL: ", import.meta.url)
console.log("CURRENT FILE PATH: ", currentFilePath)
const currentDirPath = dirname(currentFilePath)
console.log("CURRENT DIRECTORY: ", currentDirPath)
const authorsJSONFilePath = join(currentDirPath, "authors.json")
console.log("AUTHOR.JSON PATH: ", authorsJSONFilePath)

authorRouter.get("/", (req, res) => {
    // 1. Read students.json file content to get back an array of students

    const fileContent = fs.readFileSync(authorsJSONFilePath) // we get back a BUFFER which is the content of the file (Machine Readable)
    console.log(JSON.parse(fileContent))

    const authors = JSON.parse(fileContent)

    // 2. Send back as a response the array of students
    res.send(authors)
})

authorRouter.post("/", (req, res) => {
    // 1. Read the request body obtaining the new student's data

    console.log("REQUEST BODY: ", req.body.email)

    if (checkEmail(req.body.email) === false) {
        res.send("Email already exist!")
    } else {
        const newAuthor = { ...req.body, id: uniqid(), createdAt: new Date() }
        console.log(newAuthor)

        // 2. Read students.json file content to get back an array of students
        const authors = JSON.parse(fs.readFileSync(authorsJSONFilePath))

        // 3. Add new student to the array
        authors.push(newAuthor)

        // 4. Write the array back to the file
        fs.writeFileSync(authorsJSONFilePath, JSON.stringify(authors))

        // 5. Send back a proper response

        res.status(201).send({ id: newAuthor.id })
    }
})

authorRouter.get("/:authorID", (req, res) => {
    console.log("User ID : ", req.params.authorID)
    // 1. Read students.json file content to get back an array of students
    const authors = JSON.parse(fs.readFileSync(authorsJSONFilePath))

    // 2. Find the specified student by id

    const author = authors.find(author => author.id === req.params.authorID)
    // 3. Send him back as response
    if (author) {
        res.send(author)
    } else {
        res.send("Not found!")
    }
})

authorRouter.put("/:authorID", (req, res) => {
    // 1. Read students.json file content to get back an array of students
    const authors = JSON.parse(fs.readFileSync(authorsJSONFilePath))

    // 2. Modify the specified student
    // const remainingStudents = students.filter(student => student.id !== req.params.studentID)

    // const updatedStudent = { ...req.body, id: req.params.studentID }

    // remainingStudents.push(updatedStudent)

    const index = authors.findIndex(author => author.id === req.params.authorID)

    const updateAuthor = { ...authors[index], ...req.body }

    authors[index] = updateAuthor

    // 3. Save the file with the updated list of students
    fs.writeFileSync(authorsJSONFilePath, JSON.stringify(authors))

    // 4. Send back a proper response
    res.send(updateAuthor)
})

authorRouter.delete("/:authorID", (req, res) => {
    // 1. Read students.json file content to get back an array of students
    const authors = JSON.parse(fs.readFileSync(authorsJSONFilePath))

    // 2. Filter out the specified studentID from the array
    const remainingAuthor = authors.filter(author => author.id !== req.params.authorID)

    // 3. Write the remaining students into the file
    fs.writeFileSync(authorsJSONFilePath, JSON.stringify(remainingAuthor))

    // 4. Send back a proper response
    res.status(204).send()
})

const checkEmail = (email) => {
    console.log("This is the email", email)
    const authors = JSON.parse(fs.readFileSync(authorsJSONFilePath))
    const sameEmailAddress = authors.find(author => (author.email === email))
    if (sameEmailAddress === undefined) {
        return true
    } else {
        return false
    }
    // sameEmailAddress === [] ? true : false
}

export default authorRouter