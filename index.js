const env = require("dotenv").config()
const express = require("express")

const { createSetupIntentAndCustomer, createSetupIntentForCustomer } = require('./src/middlewares/setupIntent.js')
const { getPaymentMethodsForCostumer, updatePaymentMethodForCustomer, deletePaymentMethod } = require('./src/middlewares/paymentMethod.js')
const handleNotFound = require('./src/middlewares/handleNotFound.js')
const handleError = require("./src/middlewares/handleErrors.js")
const getPublishableKey = require("./src/middlewares/getPublishableKey.js")

const app = express()

app.use(express.json())

app.post("/create-setup-intent", createSetupIntentAndCustomer)

app.post("/create-setup-intent/:idcustomer", createSetupIntentForCustomer)

app.get("/customers/:idcustomer/payment-methods", getPaymentMethodsForCostumer)

app.patch("/customers/:idcustomer/payment-methods/:paymentMethodId", updatePaymentMethodForCustomer)

app.delete("/customers/:idcustomer/payment-methods/:paymentMethodId", deletePaymentMethod )

app.get("/public-key", getPublishableKey)

app.use(handleNotFound)
app.use(handleError)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));