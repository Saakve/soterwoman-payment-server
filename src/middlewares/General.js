const { stripe } = require('../helpers/stripe')

async function payoffDebt(req, res, next) {
    const { idCustomer, amount, idAccount } = req.body

    try {

        const charge = await stripe.charges.create({
            amount,
            currency: 'usd',
            customer: idCustomer,
            source: idAccount,
        })

        res.send(charge)

    } catch (error) { next(error) }
}

module.exports = {
    payoffDebt
}