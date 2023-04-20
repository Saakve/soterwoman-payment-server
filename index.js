const env = require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT || 8080

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

app.post("/create-setup-intent", async (req, res) => {
    const { id } = await stripe.customers.create()

    const { client_secret } = await stripe.setupIntents.create({ customer: id })

    res.send({ id, client_secret })
})

app.get("/public-key", (req, res) => {
    res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));