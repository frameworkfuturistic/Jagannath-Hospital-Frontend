import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Session storage utilities
export const saveToSessionStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(data))
  }
}

export const getFromSessionStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  return null
}

export const removeFromSessionStorage = (key: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(key)
  }
}

// Date and time utilities
export const formatDate = (dateString: string) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatTime = (timeString: string) => {
  if (!timeString) return ""

  try {
    // Try to parse time in different formats
    const timeParts = timeString.split(":")
    const hours = Number.parseInt(timeParts[0], 10)
    const minutes = Number.parseInt(timeParts[1], 10)

    if (isNaN(hours) || isNaN(minutes)) {
      return timeString
    }

    const ampm = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, "0")

    return `${formattedHours}:${formattedMinutes} ${ampm}`
  } catch (error) {
    return timeString
  }
}

// Error handling utility
export const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data?.message || "Server error"
  } else if (error.request) {
    // The request was made but no response was received
    return "No response from server"
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || "Unknown error"
  }
}

export function formatCurrency(value: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}