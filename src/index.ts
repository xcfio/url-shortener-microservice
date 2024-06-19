import express from "express"
import cors from "cors"
import { lookup } from "dns"

const app = express().use(cors({ optionsSuccessStatus: 200 }))

app.get("/", (_req, res) => res.send("Hello World"))
app.get("/api/whoami", async (req, res) => {
    lookup("xcf", (error, address) => {})
    res.json({
        ipaddress: req.ip,
        software: req.headers["user-agent"],
        language: req.headers["accept-language"]
    })
})

app.listen(3000, () => console.log("Server is running"))
