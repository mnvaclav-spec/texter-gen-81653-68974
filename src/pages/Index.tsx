import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Copy, Download, Loader2, Volume2, Mic, ThumbsUp, ThumbsDown, Settings, MessageCircle, Users, LogOut, Moon, Sun, Home, Menu, Mail, ExternalLink, Sparkles, Code, Wrench, BookOpen, Accessibility, Languages, Contrast, ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";
import ChatBot from "@/components/ChatBot";
import VersionHistory from "@/components/VersionHistory";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Template = {
  id: string;
  name: string;
  placeholder: string;
};

const templates: Template[] = [
  { id: "api-guide", name: "API Guide", placeholder: "Enter API name or feature (e.g., REST API, GraphQL)" },
  { id: "code-comments", name: "Code Comments", placeholder: "Paste your code snippet here" },
  { id: "setup-instructions", name: "Setup Instructions", placeholder: "Enter software/tool name (e.g., Docker, Node.js)" },
  { id: "troubleshooting", name: "Troubleshooting Guide", placeholder: "Describe the issue (e.g., Connection timeout error)" },
  { id: "user-manual", name: "User Manual Intro", placeholder: "Enter tool/product name" },
];

const languages = [
  { value: "english", label: "English" },
  { value: "isizulu", label: "isiZulu" },
  { value: "isixhosa", label: "isiXhosa" },
  { value: "afrikaans", label: "Afrikaans" },
  { value: "sepedi", label: "Sepedi" },
  { value: "french", label: "Français" },
  { value: "spanish", label: "Español" },
  { value: "portuguese", label: "Português" },
  { value: "swahili", label: "Kiswahili" },
  { value: "yoruba", label: "Yorùbá" },
  { value: "hausa", label: "Hausa" },
  { value: "amharic", label: "አማርኛ (Amharic)" },
];

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [input, setInput] = useState("");
  const [audience, setAudience] = useState("developers");
  const [detailLevel, setDetailLevel] = useState("moderate");
  const [format, setFormat] = useState("markdown");
  const [language, setLanguage] = useState("english");
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !input.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a template and provide input.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedDoc("");
    setFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-documentation", {
        body: {
          template: selectedTemplate,
          input: input.trim(),
          audience,
          detailLevel,
          format,
          language,
        },
      });

      if (error) throw error;

      setGeneratedDoc(data.documentation);

      toast({
        title: "Success",
        description: "Documentation generated successfully!",
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate documentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type);
    toast({
      title: "Thank you for your feedback!",
      description: "The Capaciti Digital Pioneers team appreciates your input.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    toast({
      title: "Copied",
      description: "Documentation copied to clipboard!",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate}-${Date.now()}.${format === "markdown" ? "md" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "Documentation downloaded successfully!",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const NavMenu = () => (
    <nav className="flex flex-col gap-2 p-4">
      <Button variant="ghost" className="justify-start" onClick={() => navigate("/")}>
        <Home className="mr-2 h-4 w-4" />
        Home
      </Button>
      <Button variant="ghost" className="justify-start" onClick={() => navigate("/feedback")}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Feedback
      </Button>
      <Button variant="ghost" className="justify-start" onClick={() => navigate("/collaboration")}>
        <Users className="mr-2 h-4 w-4" />
        Collaboration
      </Button>
      <Button variant="ghost" className="justify-start" onClick={() => navigate("/settings")}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      {user ? (
        <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      ) : (
        <Button variant="ghost" className="justify-start" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      )}
    </nav>
  );

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Purple overlay for entire page */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/60 to-indigo-900/70 pointer-events-none"></div>
      
      <div className="relative z-10">
      {/* Header with Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">
              TechDoc<span className="text-primary">Gen</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/feedback")}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Feedback
              </Button>
              <Button variant="ghost" onClick={() => navigate("/collaboration")}>
                <Users className="mr-2 h-4 w-4" />
                Collaboration
              </Button>
              <Button variant="ghost" onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              {user ? (
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")}>Sign In</Button>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <NavMenu />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
        <div className="container relative z-10 mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-purple-200 dark:border-purple-700">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Powered by AI - Built for Everyone</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            TechDocGen
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Your AI-powered documentation assistant
          </p>
          <p className="text-base mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
            Meet <strong>Elon</strong>, your friendly AI assistant from Capaciti's Digital Pioneers team. 
            Create technical documentation that's clear, accessible, and inclusive.
          </p>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
            Start Creating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-3 text-gray-900 dark:text-white">Documentation Made Simple</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Generate professional technical documentation in seconds
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">API Guides</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create comprehensive API documentation</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Code Comments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generate clear code explanations</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Setup Instructions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step installation guides</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Troubleshooting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Problem-solving documentation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-3 text-gray-900 dark:text-white">Built for Accessibility</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Inclusive features for every user
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Text-to-Speech</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Listen to documentation</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Voice Input</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Speak your requests</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                  <Languages className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Multi-Language</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">12 languages supported</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                  <Contrast className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">High Contrast</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accessible design modes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Version History */}
        <div className="mb-6">
          <VersionHistory />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-glow">Create Documentation</CardTitle>
              <CardDescription className="text-white/80">
                Configure your documentation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-white">Template Type</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Choose a documentation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="input" className="text-white">Your Input</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVoiceInput}
                    className={isListening ? "bg-primary text-primary-foreground" : ""}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    {isListening ? "Listening..." : "Voice Input"}
                  </Button>
                </div>
                <Textarea
                  id="input"
                  placeholder={currentTemplate?.placeholder || "Enter your input here"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="text-white">Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger id="audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="developers">Developers</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="detail" className="text-white">Detail Level</Label>
                  <Select value={detailLevel} onValueChange={setDetailLevel}>
                    <SelectTrigger id="detail">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format" className="text-white">Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="plain">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-white">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !selectedTemplate || !input.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Documentation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-glow">Generated Documentation</CardTitle>
              <CardDescription className="text-white/80">
                Your AI-generated documentation will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedDoc ? (
                <>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto border border-white/10">
                    <pre className="whitespace-pre-wrap text-sm text-white">{generatedDoc}</pre>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => speakText(generatedDoc)}
                      className={isSpeaking ? "bg-primary text-primary-foreground" : ""}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      {isSpeaking ? "Stop Reading" : "Read Aloud"}
                    </Button>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <p className="text-sm text-white/80 mb-2">Was this helpful?</p>
                    <div className="flex gap-2">
                      <Button
                        variant={feedback === "positive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeedback("positive")}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Yes
                      </Button>
                      <Button
                        variant={feedback === "negative" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeedback("negative")}
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        No
                      </Button>
                    </div>
                  </div>

                  {feedback && (
                    <div className="bg-primary/20 border border-primary/30 rounded-lg p-4 text-sm backdrop-blur-sm">
                      <p className="text-white font-medium">✅ Keep learning — the future is digital! 💻✨</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-12 text-center text-white/70 min-h-[400px] flex items-center justify-center border border-white/10">
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-white" />
                    <p>Your documentation will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-white/80 mb-2">Need help or have questions?</p>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="mailto:support@capaciti.org" target="_blank" rel="noopener noreferrer">
                <Mail className="mr-2 h-4 w-4" />
                Contact Capaciti Support
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-white/80 space-y-2">
          <p className="font-semibold">Powered by Capaciti | Developed by the Digital Pioneers Team, 2025</p>
          <p>Empowering learners through smart, inclusive tech documentation</p>
        </div>
      </footer>
      </div>

      {/* Chatbot */}
      <ChatBot currentTemplate={selectedTemplate} currentInput={input} />
    </div>
  );
};

export default Index;
