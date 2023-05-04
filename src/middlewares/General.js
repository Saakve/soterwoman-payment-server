const { getDefaultPaymentMethodId } = require('../helpers/paymentMethod')
const { stripe } = require('../helpers/stripe')

async function payoffDebt(req, res, next) {
    const { idCustomer, amount, idAccount } = req.body

    try {

        if (idCustomer) {

            const payment_method = await getDefaultPaymentMethodId(idCustomer) 

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'usd',
                customer: idCustomer,
                confirm: true,
                payment_method
            })

            res.send(paymentIntent)
            return
        }

        if (idAccount) {
            const charge = await stripe.charges.create({
                amount,
                currency: 'usd',
                source: idAccount,
            })

            res.send(charge)
            return
        }

    } catch (error) { next(error) }
}

module.exports = {
    payoffDebt
}