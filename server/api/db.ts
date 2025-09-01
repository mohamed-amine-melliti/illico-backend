import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@5.135.246.80:5432/illico_pizza_db'
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { query, params } = body
    
    // Execute the query
    const result = await pool.query(query, params || [])
    
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