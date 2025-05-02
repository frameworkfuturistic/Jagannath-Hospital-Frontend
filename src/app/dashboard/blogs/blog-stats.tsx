import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Blog } from './blog';

interface BlogStatsProps {
  blogs: Blog[];
}

export function BlogStats({ blogs }: BlogStatsProps) {
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(
    (blog) => blog.status === 'published'
  ).length;
  const draftBlogs = blogs.filter((blog) => blog.status === 'draft').length;

  const publishedPercentage =
    totalBlogs > 0 ? (publishedBlogs / totalBlogs) * 100 : 0;
  const draftPercentage = totalBlogs > 0 ? (draftBlogs / totalBlogs) * 100 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              Total Blogs
            </p>
            <p className="text-3xl font-bold mt-2 text-slate-700 dark:text-slate-200">
              {totalBlogs}
            </p>
            <Progress value={100} className="mt-2" />
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <p className="text-base font-medium text-emerald-600 dark:text-emerald-300">
              Published Blogs
            </p>
            <p className="text-3xl font-bold mt-2 text-emerald-700 dark:text-emerald-200">
              {publishedBlogs}
            </p>
            <Progress value={publishedPercentage} className="mt-2" />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <p className="text-base font-medium text-amber-600 dark:text-amber-300">
              Draft Blogs
            </p>
            <p className="text-3xl font-bold mt-2 text-amber-700 dark:text-amber-200">
              {draftBlogs}
            </p>
            <Progress value={draftPercentage} className="mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
