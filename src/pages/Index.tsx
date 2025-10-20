import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Copy, Download, Loader2, Volume2, Mic, Eye, Type, Keyboard, LogOut, Moon, Sun } from "lucide-react";
import heroImage from "@/assets/hero-ai.png";
import ChatBot from "@/components/ChatBot";
import VersionHistory from "@/components/VersionHistory";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";

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
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  // Check authentication (optional)
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
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
      // Ctrl/Cmd + Shift + V to toggle voice input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        toggleVoiceInput();
      }
      // Ctrl/Cmd + Shift + S to speak generated doc
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (generatedDoc) speakText(generatedDoc);
      }
      // Ctrl/Cmd + = to increase font size
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        setFontSize(prev => Math.min(prev + 2, 24));
      }
      // Ctrl/Cmd + - to decrease font size
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setFontSize(prev => Math.max(prev - 2, 12));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTemplate, input, generatedDoc]);

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
      setIsListening(false);
      toast({
        title: "Voice Input Stopped",
        description: "Voice recognition has been turned off.",
      });
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Voice Input Active",
        description: "Start speaking to input text...",
      });
    }
  };

  const speakText = (text: string) => {
    // Stop any ongoing speech
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
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Text-to-Speech Error",
        description: "Could not read the text. Please try again.",
        variant: "destructive",
      });
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    
    toast({
      title: "Reading Documentation",
      description: "Text-to-speech is now active.",
    });
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

      // Save to database
      const { data: savedDoc, error: saveError } = await supabase
        .from('documents')
        .insert({
          template: selectedTemplate,
          input: input.trim(),
          content: data.documentation,
          audience,
          detail_level: detailLevel,
          format,
          version: 1,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving document:', saveError);
      } else if (savedDoc) {
        setCurrentDocId(savedDoc.id);
      }

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

  const handleRestoreVersion = (content: string) => {
    setGeneratedDoc(content);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  return (
    <div 
      className={`min-h-screen ${highContrast ? 'contrast-150 brightness-110' : ''}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>

      {/* Accessibility Controls Bar */}
      <div 
        className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="toolbar"
        aria-label="Accessibility controls"
      >
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Accessibility</span>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                  title="Toggle dark mode"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="Toggle high contrast mode"
                />
                <Label htmlFor="high-contrast" className="text-sm cursor-pointer">
                  High Contrast
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={12}
                  max={24}
                  step={1}
                  className="w-24"
                  aria-label="Adjust font size"
                />
                <span className="text-xs text-muted-foreground w-8">{fontSize}px</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast({
                    title: "Keyboard Shortcuts",
                    description: (
                      <div className="text-sm space-y-1">
                        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+Enter</kbd> - Generate</p>
                        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+Shift+V</kbd> - Voice Input</p>
                        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+Shift+S</kbd> - Speak Doc</p>
                        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+=</kbd> - Increase Font</p>
                        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+-</kbd> - Decrease Font</p>
                      </div>
                    ),
                  });
                }}
                aria-label="Show keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
              
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  aria-label="Sign in"
                  className="gap-2"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden" role="banner">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="AI Technology - Human and Robot Hand Connection" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <FileText className="h-12 w-12 text-primary drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-foreground drop-shadow-lg">
              TechDoc<span className="text-primary">Gen</span>
            </h1>
          </div>
          <p className="text-2xl font-semibold text-foreground drop-shadow-lg mb-2">
            Hi there, Tech Explorer!
          </p>
          <p className="text-lg font-poppins font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg mb-4">
            Ready to turn your ideas into professional docs? Choose a template type and let TechDocGen do the rest.
          </p>
          <p className="text-xl text-primary font-medium drop-shadow-lg">
            Making tech simple for everyone
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto max-w-6xl px-6 pb-12 -mt-12">
        {/* Version History Section */}
        <div className="mb-6">
          <VersionHistory onRestore={handleRestoreVersion} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Configure Documentation</CardTitle>
              <CardDescription className="text-muted-foreground">
                Select a template and customize your output
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template" className="text-foreground">Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger 
                    id="template" 
                    className="bg-background border-border text-foreground"
                    aria-label="Select documentation template"
                  >
                    <SelectValue placeholder="Choose a documentation type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {templates.map((template) => (
                      <SelectItem 
                        key={template.id} 
                        value={template.id} 
                        className="text-popover-foreground hover:bg-accent"
                      >
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="input" className="text-foreground">Input</Label>
                <div className="relative">
                  <Textarea
                    id="input"
                    placeholder={currentTemplate?.placeholder || "Select a template first"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[150px] bg-background border-border text-foreground placeholder:text-muted-foreground pr-12"
                    disabled={!selectedTemplate}
                    aria-label="Documentation input text area"
                    aria-describedby="input-help"
                  />
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={toggleVoiceInput}
                    disabled={!selectedTemplate}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    title={isListening ? "Stop voice input (Ctrl+Shift+V)" : "Start voice input (Ctrl+Shift+V)"}
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <p id="input-help" className="text-xs text-muted-foreground">
                  Type or use voice input (Ctrl+Shift+V) to enter your documentation content
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-foreground">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="english" className="text-popover-foreground hover:bg-accent">English</SelectItem>
                      <SelectItem value="spanish" className="text-popover-foreground hover:bg-accent">Spanish</SelectItem>
                      <SelectItem value="french" className="text-popover-foreground hover:bg-accent">French</SelectItem>
                      <SelectItem value="german" className="text-popover-foreground hover:bg-accent">German</SelectItem>
                      <SelectItem value="chinese" className="text-popover-foreground hover:bg-accent">Chinese</SelectItem>
                      <SelectItem value="japanese" className="text-popover-foreground hover:bg-accent">Japanese</SelectItem>
                      <SelectItem value="portuguese" className="text-popover-foreground hover:bg-accent">Portuguese</SelectItem>
                      <SelectItem value="russian" className="text-popover-foreground hover:bg-accent">Russian</SelectItem>
                      <SelectItem value="arabic" className="text-popover-foreground hover:bg-accent">Arabic</SelectItem>
                      <SelectItem value="hindi" className="text-popover-foreground hover:bg-accent">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-foreground">Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger id="audience" className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="beginners" className="text-popover-foreground hover:bg-accent">Beginners</SelectItem>
                      <SelectItem value="developers" className="text-popover-foreground hover:bg-accent">Developers</SelectItem>
                      <SelectItem value="advanced" className="text-popover-foreground hover:bg-accent">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail" className="text-foreground">Detail Level</Label>
                  <Select value={detailLevel} onValueChange={setDetailLevel}>
                    <SelectTrigger id="detail" className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="brief" className="text-popover-foreground hover:bg-accent">Brief</SelectItem>
                      <SelectItem value="moderate" className="text-popover-foreground hover:bg-accent">Moderate</SelectItem>
                      <SelectItem value="comprehensive" className="text-popover-foreground hover:bg-accent">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format" className="text-foreground">Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format" className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="markdown" className="text-popover-foreground hover:bg-accent">Markdown</SelectItem>
                      <SelectItem value="plain" className="text-popover-foreground hover:bg-accent">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !selectedTemplate || !input.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Generate documentation"
                title="Generate documentation (Ctrl+Enter)"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Generating...</span>
                  </>
                ) : (
                  "Generate Documentation (Ctrl+Enter)"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Generated Documentation</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your AI-generated technical documentation
                  </CardDescription>
                </div>
                {generatedDoc && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(generatedDoc)}
                    aria-label={isSpeaking ? "Stop reading documentation" : "Read documentation aloud"}
                    title={isSpeaking ? "Stop reading (Ctrl+Shift+S)" : "Read aloud (Ctrl+Shift+S)"}
                  >
                    <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse text-primary' : ''}`} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="min-h-[400px] rounded-md border border-border bg-background p-4"
                role="region"
                aria-live="polite"
                aria-label="Generated documentation output"
              >
                {isLoading ? (
                  <div className="flex h-full items-center justify-center" role="status">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                    <span className="sr-only">Generating documentation...</span>
                  </div>
                ) : generatedDoc ? (
                  <pre 
                    className="whitespace-pre-wrap font-mono text-sm text-foreground"
                    tabIndex={0}
                    aria-label="Generated documentation content"
                  >
                    {generatedDoc}
                  </pre>
                ) : (
                  <p className="text-center text-muted-foreground" role="status">
                    Generated documentation will appear here
                  </p>
                )}
              </div>

              {generatedDoc && (
                <div className="flex gap-2" role="group" aria-label="Documentation actions">
                  <Button
                    onClick={handleCopy}
                    variant="secondary"
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    aria-label="Copy documentation to clipboard"
                  >
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="secondary"
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    aria-label="Download documentation file"
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Contact Footer */}
      <footer className="border-t bg-muted/30 mt-12" role="contentinfo">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                TechDocGen
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-powered technical documentation generator
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Contact Support / Feedback</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <a 
                    href="mailto:digital.pioneer@capaciti.org.za" 
                    className="hover:text-primary transition-colors"
                    aria-label="Email support"
                  >
                    digital.pioneer@capaciti.org.za
                  </a>
                </p>
                <p>
                  <a 
                    href="tel:0714946332" 
                    className="hover:text-primary transition-colors"
                    aria-label="Call support number 1"
                  >
                    071 494 6332
                  </a>
                  {" / "}
                  <a 
                    href="tel:0768269583" 
                    className="hover:text-primary transition-colors"
                    aria-label="Call support number 2"
                  >
                    076 826 9583
                  </a>
                </p>
                <p>
                  <a 
                    href="mailto:digital.pioneer@capaciti.org.za?subject=Feedback" 
                    className="hover:text-primary transition-colors inline-flex items-center gap-1"
                    aria-label="Send feedback"
                  >
                    Send Feedback
                  </a>
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Website</h3>
              <p className="text-sm text-muted-foreground">
                <a 
                  href="mailto:techdocgen@capaciti.org.za" 
                  className="hover:text-primary transition-colors"
                  aria-label="Email website contact"
                >
                  techdocgen@capaciti.org.za
                </a>
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TechDocGen. Powered by Capaciti.</p>
            <p className="mt-2">Created by Digital Pioneer @ UVU Africa CAPACITI</p>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <ChatBot currentTemplate={selectedTemplate} currentInput={input} />
    </div>
    </div>
  );
};

export default Index;
