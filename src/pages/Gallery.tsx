import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import clbcLogo from "@/assets/clbc-logo.png";

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  file_path: string;
  created_at: string;
  album_id: string | null;
}

interface Album {
  id: string;
  name: string;
  description: string | null;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");

  useEffect(() => {
    fetchAlbums();
    fetchImages();
  }, []);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

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

  const filteredImages = selectedAlbum === "all" 
    ? images 
    : images.filter(img => img.album_id === selectedAlbum);

  const currentIndex = selectedImage 
    ? filteredImages.findIndex(img => img.id === selectedImage.id) 
    : -1;

  const goToNext = () => {
    if (currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1]);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1]);
    }
  };

  const getAlbumName = (albumId: string | null) => {
    if (!albumId) return null;
    const album = albums.find(a => a.id === albumId);
    return album?.name || null;
  };

  return (
    <div className="min-h-screen bg-background">
      {Navigation /
      </header>

      {/* Album Filter */}
      <div className="bg-card/50 border-b border-border/50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button
              variant={selectedAlbum === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAlbum("all")}
              className="text-xs sm:text-sm"
            >
              All Photos
            </Button>
            {albums.map((album) => (
              <Button
                key={album.id}
                variant={selectedAlbum === album.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAlbum(album.id)}
                className="text-xs sm:text-sm"
              >
                {album.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
            <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">No Photos Yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Check back soon for photos from our church events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={getImageUrl(image.file_path)}
                  alt={image.title || "Gallery image"}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                  loading="lazy"
                />
                {(image.title || getAlbumName(image.album_id)) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.title && (
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{image.title}</p>
                    )}
                    {getAlbumName(image.album_id) && (
                      <p className="text-white/70 text-xs truncate">{getAlbumName(image.album_id)}</p>
                    )}
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
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </button>
          )}
          
          {currentIndex < filteredImages.length - 1 && (
            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </button>
          )}

          {/* Image */}
          <div 
            className="relative max-w-[95vw] max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(selectedImage.file_path)}
              alt={selectedImage.title || "Gallery image"}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg">
                {selectedImage.title && (
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-1">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-white/80 text-sm">{selectedImage.description}</p>
                )}
                <p className="text-white/50 text-xs mt-2">
                  {currentIndex + 1} of {filteredImages.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;