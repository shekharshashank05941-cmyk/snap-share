import Navbar from '@/components/Navbar';
import Stories from '@/components/Stories';
import Post from '@/components/Post';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { posts } from '@/data/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      
      <main className="pt-20 pb-20 md:pb-8 max-w-5xl mx-auto px-4">
        <div className="flex gap-8">
          {/* Main Feed */}
          <div className="flex-1 max-w-[470px] mx-auto lg:mx-0">
            <Stories />
            
            <div className="space-y-6">
              {posts.map((post, index) => (
                <Post key={post.id} post={post} index={index} />
              ))}
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
