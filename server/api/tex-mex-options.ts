import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/illico_pizza_db'
})

export default defineEventHandler(async (event) => {
  try {
    // Execute the query to get all tex_mex_options
    const result = await pool.query('SELECT * FROM tex_mex_options')
    
    return {
      data: result.rows,
      error: null
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      data: null,
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint
      }
    }
  }
})