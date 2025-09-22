import { Pool } from 'pg'

// ---------- PostgreSQL connection ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@5.135.246.80:5432/illico_pizza_db'
})

export default defineEventHandler(async (event) => {
  try {
    // Try to read the body (for custom queries)
    let body = {}
    try {
      body = await readBody(event)
    } catch {
      body = {}
    }

    const { query: customQuery, params: customParams } = body as { query?: string, params?: any[] }

    let query = ''
    let params: any[] = []

    if (customQuery) {
      // If a custom query is provided in the body, use it
      query = customQuery
      params = customParams || []
    } else {
      // Otherwise, handle category query from URL
      const category = getQuery(event).category

      if (category) {
        switch (category) {
          case 'pizzas':
            query = 'SELECT * FROM pizzas'
            break
          case 'paninis':
            query = 'SELECT * FROM paninis'
            break
          case 'tex_mex_items':
            query = 'SELECT * FROM tex_mex_items'
            break
          case 'tex_mex_options':
            query = 'SELECT * FROM tex_mex_options'
            break
          case 'tortillas':
            query = 'SELECT * FROM tortillas'
            break
          case 'extra_items':
            query = 'SELECT * FROM extra_items'
            break
          default:
            throw new Error('Invalid category')
        }
      } else {
        // No category, select all tables
        query = `
          SELECT 'pizzas' as category, * FROM pizzas
          UNION ALL
          SELECT 'paninis' as category, * FROM paninis
          UNION ALL
          SELECT 'tex_mex_items' as category, * FROM tex_mex_items
          UNION ALL
          SELECT 'tex_mex_options' as category, * FROM tex_mex_options
          UNION ALL
          SELECT 'tortillas' as category, * FROM tortillas
          UNION ALL
          SELECT 'extra_items' as category, * FROM extra_items
        `
      }
    }

    const result = await pool.query(query, params)

    return {
      data: result.rows,
      error: null
    }

  } catch (error: any) {
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
