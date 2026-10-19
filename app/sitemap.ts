import { MetadataRoute } from 'next'
import { getPublicJobs } from '@/lib/career-api'

async function getCareerRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    // API caps `limit` at 50, so walk the pages.
    const jobs = []
    for (let page = 1; page <= 20; page++) {
      const res = await getPublicJobs({ page, limit: 50 })
      jobs.push(...res.data)
      if (!res.meta.hasNextPage) break
    }
    return jobs.map((job) => ({
      url: `https://rudraas.com/career/${job.slug}`,
      lastModified: new Date(job.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const careerRoutes = await getCareerRoutes()

  return [
    {
      url: 'https://rudraas.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://rudraas.com/#capability',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://rudraas.com/#doctrine',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://rudraas.com/#sovereign',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://rudraas.com/#careers',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://rudraas.com/career',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://rudraas.com/#contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...careerRoutes,
  ]
}
