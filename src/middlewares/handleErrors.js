function handleError (err, req, res, next) {
    console.error(err)
    res.status(err.statusCode).send({ error: err.message })
}

module.exports = handleError