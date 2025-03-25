import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Download, Globe, Library } from "lucide-react";
import Link from "next/link";

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
    <div className=" mx-auto px-4 py-16 w-fit">
      <div className="flex flex-col justify-center relative items-center text-center">
        <div className="mb-3">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Penio Fanfic
            </h1>
          </div>
          <h3 className="text-xl text-muted-foreground font-semibold max-w-2xl mx-auto">
            Your personal fanfiction library manager.
          </h3>
        </div>
        <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
          Save your frequent searches, organize your library, and send your
          favorite stories to your devices with ease.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/explore">Start Exploring</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/library">My Library</Link>
          </Button>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-9">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {feature.icon}
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Supported Sites</h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
          <span className="text-sm font-medium">Archive of Our Own (AO3)</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
            Active
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          More sites coming soon!
        </p>
      </div>
    </div>
  );
}
