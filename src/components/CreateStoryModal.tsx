import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStories } from '@/hooks/useStories';
import { toast } from 'sonner';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStoryModal = ({ isOpen, onClose }: CreateStoryModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Please select an image or video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setUploadProgress(0);

    // Simulate progress
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 18, 90);
      setUploadProgress(Math.round(fakeProgress));
    }, 200);

    try {
      await createStory.mutateAsync(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.success('Story posted!');
      setTimeout(() => handleClose(), 400);
    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      toast.error(error.message || 'Failed to post story');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
    onClose();
  };

  const isUploading = createStory.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Your Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <motion.div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Click to upload photo or video</p>
              <p className="text-xs text-muted-foreground">Stories disappear after 24 hours</p>
            </motion.div>
          ) : (
            <div className="relative aspect-[9/16] max-h-80 mx-auto rounded-lg overflow-hidden bg-black">
              {selectedFile?.type.startsWith('video/') ? (
                <video src={preview} className="w-full h-full object-contain" controls />
              ) : (
                <img src={preview} alt="Story preview" className="w-full h-full object-contain" />
              )}
              {!isUploading && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload progress */}
          {isUploading && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Uploading story...</span>
                </div>
                <motion.span
                  className="font-bold text-primary text-base tabular-nums"
                  key={uploadProgress}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {uploadProgress}%
                </motion.span>
              </div>
              <Progress value={uploadProgress} className="h-2.5 bg-secondary" />
            </motion.div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className="flex-1 instagram-gradient text-white"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}%
                </span>
              ) : (
                'Share Story'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
