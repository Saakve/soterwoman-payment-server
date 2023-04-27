const { stripe } = require('../helpers/stripe')

async function addCardForNewAccount(req, res, next) {
    const ip = req.socket.remoteAddress
    const { tokenCard, id_number, name, email, address, dob } = req.body

    // address : {line1,city,state,postal_code}
    // dob: {day, month, year}

    try {

        const account = await stripe.accounts.create({
            type: 'custom',
            email,
            capabilities: {
                transfers: { requested: true },
            },
            business_profile: {
                product_description: "Conductora",
            },
            business_type: "individual",
            individual: {
                id_number,
                first_name: name,
                last_name: name,
                address,
                dob
            },
            tos_acceptance: {
                date: Math.trunc(Date.now() / 1000),
                ip,
                user_agent: null
            },
            settings: {
                payouts: {
                    schedule: {
                        delay_days: 7,
                        interval: "daily"
                    }
                }
            },
        })

        const card = await stripe.accounts.createExternalAccount(
            account.id,
            { external_account: tokenCard }
        )

        console.log("Account: ", account)
        console.log("Card: ", card)

        res.send({ idaccount: account.id })
    } catch (e) { next(e) }
}

async function addCardForAccount(req, res, next) {
    const { idaccount } = req.params
    const { tokenCard } = req.body

    try {
        const card = await stripe.accounts.createExternalAccount(
            idaccount,
            {
                external_account: tokenCard,
                default_for_currency: true 
            }
        )

        res.send(card)

    } catch (error) { next(error) }

}

async function getCardsForAccount(req, res, next) {
    const { idaccount } = req.params

    try {
        const { data } = await stripe.accounts.listExternalAccounts(
            idaccount,
            { object: 'card' }
        )

        const cards = data.map(({ id, brand, last4, name, address_zip, default_for_currency }) => {
            return {
                id,
                brand,
                last4,
                name,
                postal_code: address_zip,
                isDefault: default_for_currency
            }
        })

        res.send(cards)

    } catch (error) { next(error) }
}

async function updateCardForAccount(req, res, next) {
    const { idaccount, idcard } = req.params
    const { name, postal_code, isDefault } = req.body

    try {
        const card = await stripe.accounts.updateExternalAccount(
            idaccount,
            idcard,
            { name, address_zip: postal_code, default_for_currency: isDefault }
        )

        res.send(card)

    } catch (error) { next(error) }
}

async function deleteCardForAccount(req, res, next) {
    const { idaccount, idcard } = req.params

    try {
        await stripe.accounts.deleteExternalAccount( idaccount, idcard)
        res.sendStatus(204)

    } catch (error) { next(error) }
}

module.exports = {
    addCardForAccount,
    addCardForNewAccount,
    getCardsForAccount,
    updateCardForAccount,
    deleteCardForAccount
}