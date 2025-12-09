import { useLocation, Link } from "react-router-dom"; // Use Link for internal navigation
import { useEffect } from "react";
import { TriangleAlert, Home } from "lucide-react"; // Import a relevant icon
import { Button } from "@/components/ui/button"; // Assuming Button component is available
import { Card, CardContent } from "@/components/ui/card"; // Using Card for a contained look

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // This logs the error attempt for monitoring/debugging
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/50 to-secondary/10 p-4">
      <Card className="max-w-md w-full p-8 shadow-2xl border-border/60 backdrop-blur-sm bg-background/80">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-6 p-0">
          
          {/* Icon */}
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 border-2 border-destructive/30">
            <TriangleAlert className="h-8 w-8 text-destructive" />
          </div>

          {/* Error Code */}
          <h1 className="text-8xl font-extrabold text-primary tracking-tighter drop-shadow-lg">
            404
          </h1>
          
          {/* Message */}
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-xs">
            The page you are looking for ({location.pathname}) doesn't exist or has been moved.
          </p>

          {/* Call to Action */}
          <Button 
            asChild // Use asChild to render the Button as a Link
            variant="default"
            size="lg"
            className="mt-6 text-base px-8 py-6 gap-2 shadow-lg hover:shadow-primary/30 transition-shadow"
          >
            <Link to="/">
              <Home className="h-5 w-5" />
              Return to Home
            </Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
