// ============================================
// routes/investeringscaser.js
// HTTP-endpoints til investeringscaser
// ============================================

const express = require('express');
const router = express.Router();

// GET /investeringscaser/ny/køb
// Viser formularen for trin 3.1: Køb og renoveringsudgifter
router.get('/ny/koeb', function(req, res) {
    res.render('investeringscase-koeb');
});

module.exports = router;