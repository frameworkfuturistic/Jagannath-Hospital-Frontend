import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, MessageCircle } from 'lucide-react';
import Link from "next/link";
import { Toggle } from "./ui/toggle";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Title from "./Title";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";

// Define a type for the blog object
type Blog = {
  _id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  author: string;
  publishDate: string;
};

const BlogCards = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Use the axiosInstance to fetch blogs
        const response = await axiosInstance.get("/blogs");

        // Format the blogs data
        const formattedBlogs = response.data.blogs.map((blog: Blog) => ({
          ...blog,
          // Construct the image URL
          image: blog.image
            ? `https://sjhrc.in/hospital-api/blogs/${blog.image.replace(/^uploads[\\/]/, "").replace(/\\/g, "/")}`
            : null,
        }));
        console.log("imageData", formattedBlogs);
        

        setBlogs(formattedBlogs.slice(0, 6)); // Limit to the first 6 blogs
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="section">
      <div className="min-h-fit">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <Title title={"LATEST BLOGS"} />
          </div>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="flex">
              {blogs.map((blog) => (
                <CarouselItem
                  key={blog._id}
                  className="md:basis-1/3 lg:basis-1/3 p-4"
                >
                  <Card className="flex flex-col h-full justify-between transition-transform duration-300 transform hover:-translate-y-2 hover:scale-105 hover:shadow-lg hover:border-b-8 hover:border-b-rose-200">
                    <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="rounded-t-lg object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <Toggle className="bg-sky-600 text-white place-self-end -mt-10 rounded-b-none rounded-r-none px-4 py-1">
                      {blog.category}
                    </Toggle>
                    <div className="flex-grow p-4 md:p-6">
                      <h1 className="text-lg font-semibold">{blog.title}</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        By {blog.author} | {new Date(blog.publishDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                        {blog.content.length > 200
                          ? `${blog.content.slice(0, 200)}...`
                          : blog.content}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                          <Link href="">
                            <Heart size={16} color="#1a1a1a" strokeWidth={1} />
                          </Link>
                          <Link href="">
                            <MessageCircle
                              size={16}
                              color="#141414"
                              strokeWidth={1}
                            />
                          </Link>
                        </div>
                        <Link href={`/blog/${blog._id}`}>
                          <Button
                            variant="gooeyLeft"
                            className="text-sm px-3 py-1"
                          >
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/blog">
              <Button
                size="lg"
                variant="link"
                className="text-gray-600 text-md hover:text-rose-900 px-8 py-6"
              >
                View All News & Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogCards;

