const { stripe } = require('./stripe')

async function getDefaultPaymentMethodId  (idcustomer) {
    const customer = await stripe.customers.retrieve(idcustomer)
    const { invoice_settings: { default_payment_method } } = customer
    return default_payment_method
}

async function setDefaultPaymentMethod (idcustomer, idPaymentMethod) {
    const customer = await stripe.customers.update(
        idcustomer,
        { invoice_settings: { default_payment_method: idPaymentMethod } }
    )
}

async function updatePaymentMethod (idPaymentMethod, { name, postal_code }) {
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

module.exports = {
    getDefaultPaymentMethodId,
    setDefaultPaymentMethod,
    updatePaymentMethod
}