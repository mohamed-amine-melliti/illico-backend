import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/illico_pizza_db'
})

export default defineEventHandler(async (event) => {
  try {
    // Test the database connection first
    const client = await pool.connect()
    
    try {
      // Execute the query to get all tortillas
      const result = await client.query('SELECT * FROM tortillas ORDER BY id ASC')
      
      // Return rows if any, else empty array
      return {
        data: result.rows || []
      }
    } finally {
      // Always release the client back to the pool
      client.release()
    }
  } catch (error) {
    console.error('Database error:', error)

    // Handle specific database errors
    if (error.code === 'ECONNREFUSED') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database Connection Failed',
        data: {
          message: 'Could not connect to the database. Please ensure PostgreSQL is running.',
          code: error.code
        }
      })
    }

    if (error.code === '42P01') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Table Not Found',
        data: {
          message: 'Table "tortillas" does not exist in the database.',
          code: error.code
        }
      })
    }

    // Generic database error
    throw createError({
      statusCode: 500,
      statusMessage: 'Database Query Failed',
      data: {
        message: error.message,
        code: error.code,
        details: error.detail || null,
        hint: error.hint || null
      }
    })
  }
})
