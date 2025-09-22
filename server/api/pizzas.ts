import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/illico_pizza_db'
})

export default defineEventHandler(async () => {
  try {
    const result = await pool.query('SELECT * FROM pizzas')
    return {
      data: result.rows
    }
  } catch (err) {
    console.error('Database error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Database query failed',
      data: { message: err.message }
    })
  }
})
