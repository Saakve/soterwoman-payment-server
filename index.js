const env = require("dotenv").config()
const express = require("express")

const Customer = require('./src/middlewares/Customer')
const Account = require('./src/middlewares/Account')
const General = require('./src/middlewares/General')

const handleNotFound = require('./src/middlewares/handleNotFound')
const handleError = require("./src/middlewares/handleErrors")
const getPublishableKey = require("./src/middlewares/getPublishableKey")

const app = express()

app.use(express.json())

app.get("/public-key", getPublishableKey)

// General middlewares
app.post("/payoff-debt", General.payoffDebt)

// Passenger middlewares
app.post("/create-tip-intent", Customer.createTipIntent)

app.post("/create-setup-intent", Customer.createSetupIntentForNewCustomer)

app.post("/create-setup-intent/:idcustomer", Customer.createSetupIntentForCustomer)

app.get("/customers/:idcustomer/payment-methods", Customer.getPaymentMethodsForCostumer)

app.patch("/customers/:idcustomer/payment-methods/:paymentMethodId", Customer.updatePaymentMethodForCustomer)

app.delete("/customers/:idcustomer/payment-methods/:paymentMethodId", Customer.deletePaymentMethod)

//Driver middlewares
app.post("/create-account-card", Account.addCardForNewAccount)

app.post("/create-account-card/:idaccount", Account.addCardForAccount)

app.get("/accounts/:idaccount/cards", Account.getCardsForAccount)

app.patch("/accounts/:idaccount/cards/:idcard", Account.updateCardForAccount)

app.delete("/accounts/:idaccount/cards/:idcard", Account.deleteCardForAccount)

app.use(handleNotFound)
app.use(handleError)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));