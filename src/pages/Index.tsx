import Navbar from '@/components/Navbar';
import Stories from '@/components/Stories';
import Post from '@/components/Post';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { usePosts } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { posts, isLoading } = usePosts();

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8 max-w-5xl mx-auto px-2 sm:px-4">
        <div className="flex gap-4 lg:gap-8">
          {/* Main Feed */}
          <div className="flex-1 max-w-[470px] mx-auto lg:mx-0">
            <Stories />
            
            <div className="space-y-4 sm:space-y-6">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                      <div className="flex items-center gap-3 p-4">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                      <Skeleton className="aspect-square" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </>
              ) : posts?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet. Follow someone or create a post!</p>
                </div>
              ) : (
                posts?.map((post, index) => (
                  <Post key={post.id} post={post} index={index} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Index;
