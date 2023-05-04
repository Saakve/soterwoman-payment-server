function handleError(err, req, res, next) {
    console.error(err)

    if (err.type === "StripeCardError") {
        res.status(err.statusCode).json({
            error: {
                stripeErrorCode: err.code
            }
        })
        return
    }

    res.status(err.statusCode).send({ error: err.message })
}

module.exports = handleError