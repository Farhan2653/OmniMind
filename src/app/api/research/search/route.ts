import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { query, page = 1 } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // OpenAlex API Endpoint
    // We search by query, sort by cited_by_count descending, get 10 items per page
    const apiUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&sort=cited_by_count:desc&per-page=10&page=${page}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'mailto:test@example.com' 
      }
    })

    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.status}`)
    }

    const data = await response.json()

    const results = data.results.map((work: any) => {
      const authorList = work.authorships ? work.authorships.map((a: any) => a.author.display_name) : [];
      const authors = authorList.length > 0 
        ? authorList.slice(0, 3).join(", ") + (authorList.length > 3 ? " et al." : "") 
        : "Unknown Author";

      return {
        id: work.id,
        title: work.title || "Untitled Paper",
        authors,
        journal: work.primary_location?.source?.display_name || "Unknown Journal",
        year: work.publication_year,
        citations: work.cited_by_count || 0,
        url: work.doi || work.id,
        summary: work.abstract_inverted_index 
          ? "Abstract available on source page. Click the paper link to read more." 
          : "No abstract available."
      };
    })

    return NextResponse.json({
      results,
      meta: data.meta // contains count, page, per_page
    })

  } catch (error: any) {
    console.error("Research search error:", error)
    return NextResponse.json({ error: error.message || "Failed to search research papers" }, { status: 500 })
  }
}
