const env = require("dotenv").config()
const express = require("express")
const app = express()

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

app.post("/create-setup-intent", async (req, res) => {
    const { id } = await stripe.costumers.create()

    const { client_secret } = await stripe.setupIntent.create({costumer: id})

    res.send({ id, client_secret })
})

app.get("/public-key", (req, res) => {
    res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));