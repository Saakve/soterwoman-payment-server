const { stripe } = require('../helpers/stripe')

async function createSetupIntentAndCustomer (req, res, next) {
    try {
        const { id } = await stripe.customers.create()

        const { client_secret } = await stripe.setupIntents.create({
            customer: id,
            usage: "on_session"
        })

        res.send({ idcustomer: id, client_secret })
    } catch (e) { next(e) }
}

async function createSetupIntentForCustomer (req, res, next) {
    const { idcustomer } = req.params

    try {
        const { client_secret } = await stripe.setupIntents.create({
            customer: idcustomer,
            usage: "on_session"
        })

        res.send({ client_secret })
    } catch (e) { next(e) }
}

module.exports = {
    createSetupIntentAndCustomer,
    createSetupIntentForCustomer
}