import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Download, Globe, Library } from "lucide-react";
import Link from "next/link";
import { SetTopbar } from "@/components/base/SetTopbar";

export default function HomePage() {
  const features = [
    {
      title: "Library Management",
      description: "Organize your fanfics into custom sections and collections",
      icon: <Library className="h-6 w-6" />,
    },
    {
      title: "Kindle Integration",
      description: "Send fanfics directly to your Kindle device",
      icon: <Download className="h-6 w-6" />,
    },
    {
      title: "Translation Support",
      description:
        "Read fanfics in your preferred language with automatic translation",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "Advanced Search",
      description:
        "Find exactly what you want to read with powerful search filters",
      icon: <BookOpen className="h-6 w-6" />,
    },
  ];

  return (
    <>
      <SetTopbar segments={[{ label: "Home", href: "/home" }]} />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="flex flex-col justify-center relative items-center text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome to Penio Fanfic
              </h1>
            </div>
            <h3 className="text-xl md:text-2xl text-muted-foreground font-semibold max-w-3xl mx-auto">
              Your personal fanfiction library manager.
            </h3>
          </div>
          <p className="text-lg text-muted-foreground mx-auto max-w-3xl mb-10">
            Save your frequent searches, organize your library, and send your
            favorite stories to your devices with ease.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/explore">Start Exploring</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/library">My Library</Link>
            </Button>
          </div>
        </div>

      <Separator className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-primary transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Supported Sites</h2>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-card/80 to-muted/80 backdrop-blur-sm border border-border/50 shadow-md">
            <span className="text-sm font-medium">Archive of Our Own (AO3)</span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">
              Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            More sites coming soon!
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
