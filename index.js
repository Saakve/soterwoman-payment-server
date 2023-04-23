const env = require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT || 8080

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const getDefaultPaymentMethodId = async (idcustomer) => {
    const customer = await stripe.customers.retrieve(idcustomer)
    const { invoice_settings: { default_payment_method } } = customer
    return default_payment_method
}

const setDefaultPaymentMethod = async (idcustomer, idcard) => {
    const customer = await stripe.customers.update(
        idcustomer,
        { invoice_settings: { default_payment_method: idcard } }
    )
}

const updatePaymentMethod = async (idPaymentMethod, { name, postal_code }) => {
    const paymentMethod = await stripe.paymentMethods.update(idPaymentMethod,
        {
            billing_details: {
                name,
                address: { postal_code }
            }
        }
    )

    return paymentMethod
}

app.use(express.json())

app.post("/create-setup-intent", async (req, res, next) => {
    try {
        const { id } = await stripe.customers.create()

        const { client_secret } = await stripe.setupIntents.create({
            customer: id,
            usage: "on_session"
        })

        res.send({ customerid: id, client_secret })
    } catch (e) { next(e) }
})

app.post("/create-setup-intent/:id", async (req, res, next) => {
    const { id } = req.params

    try {
        const { client_secret } = await stripe.setupIntents.create({
            customer: id,
            usage: "on_session"
        })
        res.send({ client_secret })
    } catch (e) { next(e) }
})

app.get("/customers/:idcustomer/cards", async (req, res, next) => {
    const { idcustomer } = req.params
    try {
        const { data } = await stripe.customers.listPaymentMethods(idcustomer, { type: 'card' })
        const defaultPaymentMethodId = await getDefaultPaymentMethodId(idcustomer)

        const paymentMethods = data.map(({ id, billing_details, card }) => {
            return {
                id,
                brand: card.brand,
                last4: card.last4,
                name: billing_details.name,
                postal_code: billing_details.address.postal_code,
                isDefault: id === defaultPaymentMethodId
            }
        })

        res.send(paymentMethods)
    } catch (e) { next(e) }
})

app.patch("/customers/:idcustomer/cards/:paymentMethodId", async (req, res, next) => {
    const { paymentMethodId, idcustomer } = req.params
    const { name, postal_code, isDefault } = req.body
    try {
        await stripe.customers.retrieve(idcustomer)
        if (isDefault) await setDefaultPaymentMethod(idcustomer, paymentMethodId)

        const { billing_details, card } = await updatePaymentMethod(paymentMethodId, { name, postal_code })

        const response = {
            id: paymentMethodId,
            brand: card.brand,
            last4: card.last4,
            name: billing_details.name,
            postal_code: billing_details.address.postal_code,
            isDefault: isDefault ? isDefault : paymentMethodId === await getDefaultPaymentMethodId(idcustomer)
        }

        res.send(response)

    } catch (e) { next(e) }
})

app.delete("/customers/:idcustomer/cards/:paymentMethodId", async (req, res, next) => {
    const { idcustomer, paymentMethodId } = req.params

    try {
        await stripe.customers.retrieve(idcustomer)
        const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)
        console.log(paymentMethod)
        res.sendStatus(204)
    } catch (e) { next(e) }
})

app.get("/public-key", (req, res) => {
    res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
})

app.use((req, res) => { res.sendStatus(404) })

app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.statusCode).send({ error: err.message })
})

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));