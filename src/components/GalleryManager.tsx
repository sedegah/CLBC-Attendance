import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Trash2, Loader2, Image as ImageIcon, FolderPlus, Folder, X } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  file_path: string;
  file_name: string;
  created_at: string;
  album_id: string | null;
}

interface Album {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const GalleryManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");

  // Upload form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadAlbumId, setUploadAlbumId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // New album form state
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);

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
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery images.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !user) return;

    setIsCreatingAlbum(true);
    try {
      const { error } = await supabase.from("gallery_albums").insert({
        name: newAlbumName.trim(),
        description: newAlbumDescription.trim() || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Album created successfully" });
      setNewAlbumName("");
      setNewAlbumDescription("");
      setAlbumDialogOpen(false);
      fetchAlbums();
    } catch (error: any) {
      console.error("Error creating album:", error);
      toast({
        title: "Failed to create album",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setUploadAlbumId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("gallery_images").insert({
        uploaded_by: user.id,
        file_name: selectedFile.name,
        file_path: filePath,
        title: title.trim() || null,
        description: description.trim() || null,
        album_id: uploadAlbumId || null,
      });

      if (insertError) throw insertError;

      toast({ title: "Image uploaded successfully" });
      clearSelection();
      fetchImages();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await supabase.storage.from("gallery").remove([image.file_path]);
      const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
      if (error) throw error;

      toast({ title: "Image deleted" });
      fetchImages();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm("Are you sure you want to delete this album? Images will be moved to Uncategorized.")) return;

    try {
      const { error } = await supabase.from("gallery_albums").delete().eq("id", albumId);
      if (error) throw error;

      toast({ title: "Album deleted" });
      if (selectedAlbum === albumId) setSelectedAlbum("all");
      fetchAlbums();
    } catch (error: any) {
      console.error("Delete album error:", error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from("gallery").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const filteredImages = selectedAlbum === "all" 
    ? images 
    : selectedAlbum === "uncategorized"
    ? images.filter(img => !img.album_id)
    : images.filter(img => img.album_id === selectedAlbum);

  const getAlbumName = (albumId: string | null) => {
    if (!albumId) return "Uncategorized";
    const album = albums.find(a => a.id === albumId);
    return album?.name || "Unknown";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Albums Management */}
      <Card className="border-border/40">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl">Albums</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Organize photos by category</CardDescription>
              </div>
            </div>
            <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <FolderPlus className="h-4 w-4" />
                  New Album
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Album</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="albumName">Album Name</Label>
                    <Input
                      id="albumName"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="e.g., Sunday Service"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="albumDesc">Description (Optional)</Label>
                    <Textarea
                      id="albumDesc"
                      value={newAlbumDescription}
                      onChange={(e) => setNewAlbumDescription(e.target.value)}
                      placeholder="Brief description of this album..."
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleCreateAlbum}
                    disabled={!newAlbumName.trim() || isCreatingAlbum}
                    className="w-full"
                  >
                    {isCreatingAlbum ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Album"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button
              variant={selectedAlbum === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAlbum("all")}
              className="text-xs"
            >
              All ({images.length})
            </Button>
            <Button
              variant={selectedAlbum === "uncategorized" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAlbum("uncategorized")}
              className="text-xs"
            >
              Uncategorized ({images.filter(i => !i.album_id).length})
            </Button>
            {albums.map((album) => (
              <div key={album.id} className="relative group">
                <Button
                  variant={selectedAlbum === album.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAlbum(album.id)}
                  className="text-xs pr-6"
                >
                  {album.name} ({images.filter(i => i.album_id === album.id).length})
                </Button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album.id);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete album"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-border/40">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Add New Image</h3>
          
          <div className="grid gap-4 lg:grid-cols-2">
            {/* File Selection */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">Click to select an image</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-foreground">Title (optional)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter image title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-foreground">Album</Label>
                <Select value={uploadAlbumId} onValueChange={setUploadAlbumId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select album (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Album</SelectItem>
                    {albums.map((album) => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-foreground">Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter image description"
                  className="mt-1"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload Image"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card className="border-border/40">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-xl">
                {selectedAlbum === "all" 
                  ? "All Gallery Images" 
                  : selectedAlbum === "uncategorized"
                  ? "Uncategorized Images"
                  : albums.find(a => a.id === selectedAlbum)?.name || "Gallery Images"}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{filteredImages.length} images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No images in this album yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={getImageUrl(image.file_path)}
                    alt={image.title || "Gallery image"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      {image.title && (
                        <p className="text-white text-xs font-medium truncate">{image.title}</p>
                      )}
                      <p className="text-white/70 text-xs truncate">
                        {getAlbumName(image.album_id)}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1.5 right-1.5 h-6 w-6 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(image)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};