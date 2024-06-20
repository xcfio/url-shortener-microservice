import { urlencoded } from "express"
import { lookup } from "node:dns"
import { URL } from "node:url"
import express from "express"
import cors from "cors"

const app = express().use(urlencoded({ extended: false }), cors({ optionsSuccessStatus: 200 }))

const map = new Map<number, string>()
let current_count = 0

app.get("/", (_req, res) => res.send("Hello World"))

app.post("/api/shorturl", (req, res) => {
    try {
        const url = new URL((req.body.url as string | undefined) ?? "")

        lookup(url.hostname, (error) => {
            if (error) return res.json({ error: "Invalid URL" })

            const url_map = new Map(Array.from(map.entries()).map((value) => [value[1], value[0]]))

            if (url_map.has(url.href)) {
                res.json({ original_url: url, short_url: url_map.get(url.href) })
            } else {
                const short_url = current_count++
                map.set(short_url, url.href)
                res.json({ original_url: url, short_url })
            }
        })
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid URL") {
            if (error) return res.json({ error: "Invalid URL" })
        } else {
            console.trace(error)
            res.sendStatus(500)
        }
    }
})

app.get("/api/shorturl/:code?", (req, res) => {
    const code = parseInt(req.params.code ?? "")
    if (isNaN(code)) return res.json({ error: "Wrong format" })

    const original_url = map.get(code)
    if (!original_url) return res.json({ error: "No short URL found for the given input" })

    res.redirect(original_url)
})

app.listen(3000, () => console.log("Server is running"))
