import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Film, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isReel, setIsReel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { createPost } = usePosts();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isVideo = selectedFile.type.startsWith('video/');
    setIsReel(isVideo);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      await createPost.mutateAsync({
        mediaUrl: publicUrl,
        caption,
        isReel,
      });

      toast.success(isReel ? 'Reel posted!' : 'Post created!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setIsReel(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-card rounded-xl z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-50%' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Create new post</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {!preview ? (
                <div
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex justify-center gap-4 mb-4">
                    <Image className="w-12 h-12 text-muted-foreground" />
                    <Film className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg mb-2">Drag photos and videos here</p>
                  <Button variant="secondary" className="instagram-gradient text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Select from computer
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-black">
                    {isReel ? (
                      <video
                        src={preview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {isReel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Film className="w-4 h-4" />
                      This will be posted as a Reel
                    </div>
                  )}

                  <textarea
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-secondary rounded-lg p-3 text-sm outline-none resize-none h-24"
                  />

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={uploading}
                      className="flex-1 instagram-gradient text-white"
                    >
                      {uploading ? 'Posting...' : 'Share'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
