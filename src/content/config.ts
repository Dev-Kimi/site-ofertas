import { defineCollection, z } from 'astro:content';

const reviewsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('TechOffers Team'),
    image: z.string(),
    rating: z.number().min(0).max(10),
    summary: z.string(),
    price: z.string(),
    affiliateLink: z.string(),
    category: z.enum(['Teclado', 'Monitor', 'GPU', 'Outros']),
    specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  }),
});

export const collections = {
  'reviews': reviewsCollection,
};
