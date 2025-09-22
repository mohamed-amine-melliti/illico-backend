import { Pool } from 'pg'

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/illico_pizza_db'
})

export default defineEventHandler(async (event) => {
  try {
    const category = getQuery(event).category

    let query = ''
    let params: any[] = []

    // Sélectionner la table en fonction de la catégorie
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
          throw new Error('Catégorie non valide')
      }
    } else {
      // Si aucune catégorie n'est spécifiée, récupérer tous les produits
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

    const result = await pool.query(query, params)
    return { products: result.rows }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des produits'
    })
  }
})