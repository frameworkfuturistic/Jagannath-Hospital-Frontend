export type BlogStatus = "draft" | "published"

export interface Blog {
  _id: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  status: BlogStatus
  blogImageUrl?: string | File
  readTime?: number
  publishDate: string
  createdAt?: string
  updatedAt?: string
  slug?: string
}
