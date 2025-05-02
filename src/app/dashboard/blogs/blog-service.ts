
import type { Blog } from "./blog"
import axiosInstance from "@/lib/axiosInstance"

// Create an axios instance with base URL and default headers


// Get all blogs
export async function getBlogs(): Promise<Blog[]> {
  try {
    const response = await axiosInstance.get("/blogs")
    return response.data?.data?.blogs || []
  } catch (error) {
    console.error("Error fetching blogs:", error)
    throw error
  }
}

// Get a single blog by ID
export async function getBlog(id: string): Promise<Blog> {
  try {
    const response = await axiosInstance.get(`/blogs/${id}`)
    return response.data?.data || null
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error)
    throw error
  }
}

// Create a new blog
export async function createBlog(blogData: Partial<Blog>): Promise<Blog> {
  try {
    // Handle form data if there's a file upload
    if (blogData.blogImageUrl instanceof File) {
      const formData = new FormData()

      Object.entries(blogData).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (key === "blogImageUrl" && value instanceof File) {
          formData.append("image", value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      return response.data?.data || null
    } else {
      // Regular JSON request
      const response = await axiosInstance.post("/blogs", blogData)
      return response.data?.data || null
    }
  } catch (error) {
    console.error("Error creating blog:", error)
    throw error
  }
}

// Update an existing blog
export async function updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog> {
  try {
    // Handle form data if there's a file upload
    if (blogData.blogImageUrl instanceof File) {
      const formData = new FormData()

      Object.entries(blogData).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (key === "blogImageUrl") {
          if (value instanceof File) {
            formData.append("image", value)
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.put(`/blogs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      return response.data?.data?.data || null
    } else {
      // Regular JSON request
      const response = await axiosInstance.put(`/blogs/${id}`, blogData)
      return response.data?.data?.data || null
    }
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error)
    throw error
  }
}

// Delete a blog
export async function deleteBlog(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/blogs/${id}`)
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error)
    throw error
  }
}
