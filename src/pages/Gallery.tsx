import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import clbcLogo from "@/assets/clbc-logo.png";

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  file_path: string;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from("gallery").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="CLBC Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Photo Gallery</h1>
                <p className="text-sm text-muted-foreground">Changed Life Baptist Church</p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Gallery Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Photos Yet</h2>
            <p className="text-muted-foreground">Check back soon for photos from our church events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={getImageUrl(image.file_path)}
                  alt={image.title || "Gallery image"}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                />
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-medium truncate">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={getImageUrl(selectedImage.file_path)}
              alt={selectedImage.title || "Gallery image"}
              className="w-full h-full object-contain rounded-lg"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                {selectedImage.title && (
                  <h3 className="text-white text-xl font-semibold mb-1">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-white/80">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
