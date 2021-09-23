import fs from "fs-extra"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")

const postsJSONPath = join(dataFolderPath, "posts.json")
const authorsJSONPath = join(dataFolderPath, "authors.json")
export const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors")
export const postCoversPublicFolderPath = join(process.cwd(), "./public/img/postCovers")

export const getPosts = () => readJSON(postsJSONPath)
export const writePosts = content => writeJSON(postsJSONPath, content)
export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = content => writeJSON(authorsJSONPath, content)

export const saveAuthorPicture = (name, contentAsBuffer) => writeFile(join(authorsPublicFolderPath, name), contentAsBuffer)
export const savePostCover = (name, contentAsBuffer) => writeFile(join(postCoversPublicFolderPath, name), contentAsBuffer)

export const getAuthorReadableStream = () => fs.createReadStream(authorsJSONPath)