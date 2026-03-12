import axios from 'axios'

export async function checkDemand(keyword: string) {
  try {
    const params = {
      q: keyword,
      api_key: process.env.SERPAPI_KEY,
      engine: 'google',
      num: 5,
    }
    const { data } = await axios.get('https://serpapi.com/search', { params })
    return {
      totalResults: data.search_information?.total_results,
      relatedQuestions: data.related_questions?.map((q: any) => q.question) || [],
    }
  } catch (error) {
    console.error('SerpAPI error:', error)
    return null
  }
}
