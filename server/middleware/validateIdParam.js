// ========================================
// VALIDATE ID PARAM (applications :id)
// ========================================
// Ensures :id is a positive integer to avoid injection / bad data

function validateIdParam(req, res, next) {
  const id = req.params.id;
  const num = parseInt(id, 10);
  if (Number.isNaN(num) || num < 1 || String(num) !== String(id)) {
    return res.status(400).json({ message: 'Invalid application ID' });
  }
  req.params.id = String(num);
  next();
}

module.exports = validateIdParam;
