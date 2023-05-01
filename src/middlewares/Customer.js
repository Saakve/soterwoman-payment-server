const { stripe } = require('../helpers/stripe')
const { getDefaultPaymentMethodId, setDefaultPaymentMethod, updatePaymentMethod } = require('../helpers/paymentMethod')

async function createSetupIntentForNewCustomer(req, res, next) {
    try {
        const { id } = await stripe.customers.create()

        const { client_secret } = await stripe.setupIntents.create({
            customer: id,
            usage: "on_session"
        })

        res.send({ idcustomer: id, client_secret })
    } catch (e) { next(e) }
}

async function createSetupIntentForCustomer(req, res, next) {
    const { idcustomer } = req.params

    try {
        const { client_secret } = await stripe.setupIntents.create({
            customer: idcustomer,
            usage: "on_session"
        })

        res.send({ client_secret })
    } catch (e) { next(e) }
}

async function getPaymentMethodsForCostumer  (req, res, next) {
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
}

async function updatePaymentMethodForCustomer (req, res, next) {
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
}

async function deletePaymentMethod (req, res, next) {
    const { idcustomer, paymentMethodId } = req.params

    try {
        const defaultPaymentMethodId = await getDefaultPaymentMethodId(idcustomer)

        if (defaultPaymentMethodId === paymentMethodId) {
            const error = new Error('You cannot delete the default payment method')
            error.statusCode = 400
            throw error
        }

        await stripe.customers.retrieve(idcustomer)
        await stripe.paymentMethods.detach(paymentMethodId)

        res.sendStatus(204)

    } catch (e) { next(e) }
}

module.exports = {
    getPaymentMethodsForCostumer,
    updatePaymentMethodForCustomer,
    deletePaymentMethod,
    createSetupIntentForNewCustomer,
    createSetupIntentForCustomer,
}