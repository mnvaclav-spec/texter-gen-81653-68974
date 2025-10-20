import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Share2, Users, FileText, MessageSquare } from "lucide-react";

type SharedDoc = {
  id: string;
  title: string;
  author: string;
  timestamp: string;
  comments: number;
};

export default function Collaboration() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for shared documents
  const sharedDocs: SharedDoc[] = [
    {
      id: "1",
      title: "Python Installation Guide",
      author: "John Doe",
      timestamp: "2 hours ago",
      comments: 3,
    },
    {
      id: "2",
      title: "API Authentication Guide",
      author: "Jane Smith",
      timestamp: "5 hours ago",
      comments: 7,
    },
    {
      id: "3",
      title: "Database Setup Instructions",
      author: "Mike Johnson",
      timestamp: "1 day ago",
      comments: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Collaboration</h1>
            <p className="text-muted-foreground">Work together on documentation</p>
          </div>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Share New Doc
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Docs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active collaborations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Contributing users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shared Workspace</CardTitle>
            <CardDescription>View and manage shared documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search shared documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {sharedDocs.map((doc) => (
                  <Card key={doc.id} className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            By {doc.author} • {doc.timestamp}
                          </p>
                          <Badge variant="secondary">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {doc.comments} comments
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <footer className="mt-12 text-center text-sm text-muted-foreground border-t pt-6">
          <p>Powered by Capaciti | Developed by the Digital Pioneers Team, 2025</p>
          <p className="mt-1">Empowering learners through smart, inclusive tech documentation</p>
        </footer>
      </div>
    </div>
  );
}
