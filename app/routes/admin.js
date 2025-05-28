const express = require('express')
const router = express.Router()



//ROTA RAIZ

router.get('/', (req, res) => {
    //res.send('deu certo')
    res.render('admin', { url: req.hostname })
})
module.exports = router