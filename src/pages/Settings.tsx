import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";

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
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("english");
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [voiceInput, setVoiceInput] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground mb-8">Customize your TechDocGen experience</p>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how TechDocGen looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]" id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Enhance readability</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
                  <p className="text-sm text-muted-foreground">Use OpenDyslexic font</p>
                </div>
                <Switch
                  id="dyslexia-font"
                  checked={dyslexiaFont}
                  onCheckedChange={setDyslexiaFont}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle>Language & Localization</CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="language">Interface Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]" id="language">
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
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Features to enhance accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tts">Text-to-Speech</Label>
                  <p className="text-sm text-muted-foreground">Read responses aloud</p>
                </div>
                <Switch
                  id="tts"
                  checked={textToSpeech}
                  onCheckedChange={setTextToSpeech}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice">Voice Input</Label>
                  <p className="text-sm text-muted-foreground">Speak instead of typing</p>
                </div>
                <Switch
                  id="voice"
                  checked={voiceInput}
                  onCheckedChange={setVoiceInput}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground border-t pt-6">
          <p>Powered by Capaciti | Developed by the Digital Pioneers Team, 2025</p>
          <p className="mt-1">Empowering learners through smart, inclusive tech documentation</p>
        </footer>
      </div>
    </div>
  );
}
