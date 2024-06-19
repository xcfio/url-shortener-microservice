import { json, urlencoded } from "express"
import { lookup } from "dns"
import express from "express"
import cors from "cors"

const app = express().use(json(), urlencoded({ extended: false }), cors({ optionsSuccessStatus: 200 }))

const map = new Map<number, string>()
let current_count = 0

app.get("/", (_req, res) => res.send("Hello World"))

app.post("/api/shorturl", async (req, res) => {
    const url = (req.body.url_input as string | undefined) ?? (req.body.url as string | undefined) ?? ""

    lookup(url, (error) => {
        if (error) return res.status(400).json({ error: "Invalid URL" })
        const url_map = new Map(Array.from(map.entries()).map((value) => [value[1], value[0]]))

        if (url_map.has(url)) {
            res.json({ original_url: url, short_url: url_map.get(url) })
        } else {
            const short_url = current_count++
            map.set(short_url, url)
            res.json({ original_url: url, short_url })
        }
    })
})

app.get("/api/shorturl/:code?", (req, res) => {
    const code = parseInt(req.params.code ?? "")
    if (isNaN(code)) return res.status(400).json({ error: "Wrong format" })

    const original_url = map.get(code)
    if (!original_url) return res.status(400).json({ error: "No short URL found for the given input" })

    res.redirect(original_url)
})

app.listen(3000, () => console.log("Server is running"))
