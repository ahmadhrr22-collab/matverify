module.exports = (err, req, res, next) => {
  console.error('Unhandled Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    path: req.path,
    method: req.method
  })

  // Prisma unique constraint violation or search error
  if (err.code && err.code.startsWith('P20')) {
    return res.status(400).json({
      message: 'Database operation failed due to a constraint or data validation error.',
      detail: process.env.NODE_ENV === 'production' ? null : err.message
    })
  }

  // General server error
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
    detail: process.env.NODE_ENV === 'production' ? null : err.stack
  })
}
