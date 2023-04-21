const env = require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT || 8080

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const setDefaultPaymentMethod = async () => {
    try {

        const customer = await stripe.customers.update(
            'cus_Nka0i1TlmlsEwt',
            { invoice_settings: { default_payment_method: 'pm_1Mz12KEDd0i4g3ymKyJl8wL2' } }
        )
        console.log(customer)
    } catch (error) {
        console.error(error.message)
    }
}

setDefaultPaymentMethod()

app.post("/create-setup-intent", async (req, res) => {
    const { id } = await stripe.customers.create()

    const { client_secret } = await stripe.setupIntents.create({ customer: id })

    res.send({ id, client_secret })
})

app.post("/add-card/:id", async (req, res) => {
    const { id } = req.params

    try {
        const { client_secret } = await stripe.setupIntents.create({ customer: id })
        res.send({ client_secret })
    } catch (error) {
        console.error(error)
        res.status(400).send({ error: error.message })
    }

})

app.get("/public-key", (req, res) => {
    res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));