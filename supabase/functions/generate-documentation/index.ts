import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const templatePrompts: Record<string, (input: string, audience: string, detail: string) => string> = {
  "api-guide": (input, audience, detail) => {
    const audienceContext = audience === "beginners" ? "with simple explanations and examples" : 
                           audience === "developers" ? "with practical code examples" : 
                           "with advanced implementation details and edge cases";
    const detailContext = detail === "brief" ? "Keep it concise and focused on essentials." :
                         detail === "moderate" ? "Provide a balanced overview with key details." :
                         "Be comprehensive with thorough explanations and multiple examples.";
    
    return `You are a technical documentation expert. Write a clear and professional API guide for ${input} ${audienceContext}. ${detailContext}

Include:
1. Overview and purpose
2. Authentication (if applicable)
3. Key endpoints/methods
4. Request/response examples
5. Common use cases
6. Error handling

Format the output as clean, readable documentation.`;
  },
  
  "code-comments": (input, audience, detail) => {
    const audienceContext = audience === "beginners" ? "Explain concepts clearly for those learning." :
                           audience === "developers" ? "Write professional, maintainable comments." :
                           "Include architectural insights and design patterns.";
    const detailContext = detail === "brief" ? "Add essential inline comments only." :
                         detail === "moderate" ? "Add inline and block comments where helpful." :
                         "Add comprehensive documentation with examples.";
    
    return `You are a code documentation expert. Add clear, helpful comments to the following code. ${audienceContext} ${detailContext}

Code:
${input}

Return the code with well-structured comments that explain:
- What the code does
- Why certain approaches are used
- Any important considerations or edge cases`;
  },
  
  "setup-instructions": (input, audience, detail) => {
    const audienceContext = audience === "beginners" ? "Assume no prior knowledge and explain every step." :
                           audience === "developers" ? "Assume basic technical knowledge." :
                           "Focus on advanced configuration and optimization.";
    const detailContext = detail === "brief" ? "List the essential steps only." :
                         detail === "moderate" ? "Include setup steps with explanations." :
                         "Provide detailed steps with troubleshooting tips and alternatives.";
    
    return `You are a technical writer. Create clear setup instructions for ${input}. ${audienceContext} ${detailContext}

Include:
1. Prerequisites
2. Installation steps
3. Configuration
4. Verification
5. Next steps`;
  },
  
  "troubleshooting": (input, audience, detail) => {
    const audienceContext = audience === "beginners" ? "Use simple language and provide step-by-step guidance." :
                           audience === "developers" ? "Focus on diagnostic steps and solutions." :
                           "Include root cause analysis and preventive measures.";
    const detailContext = detail === "brief" ? "Provide quick fixes only." :
                         detail === "moderate" ? "Include common solutions and workarounds." :
                         "Provide in-depth analysis with multiple solution approaches.";
    
    return `You are a troubleshooting expert. Create a troubleshooting guide for: ${input}. ${audienceContext} ${detailContext}

Include:
1. Problem description
2. Common causes
3. Diagnostic steps
4. Solutions
5. Prevention tips`;
  },
  
  "user-manual": (input, audience, detail) => {
    const audienceContext = audience === "beginners" ? "Write for first-time users with clear explanations." :
                           audience === "developers" ? "Focus on functionality and integration." :
                           "Include advanced features and customization options.";
    const detailContext = detail === "brief" ? "Provide a concise introduction." :
                         detail === "moderate" ? "Include overview and key features." :
                         "Write a comprehensive introduction covering all aspects.";
    
    return `You are a technical documentation writer. Write an introduction for a user manual about ${input}. ${audienceContext} ${detailContext}

Include:
1. What the tool is
2. Key features and benefits
3. Who should use it
4. Quick start overview
5. How to get help`;
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, input, audience, detailLevel, format, language = 'english' } = await req.json();
    
    console.log("Generating documentation:", { template, audience, detailLevel, format });

    if (!template || !input) {
      throw new Error("Template and input are required");
    }

    const promptBuilder = templatePrompts[template];
    if (!promptBuilder) {
      throw new Error("Invalid template");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = promptBuilder(input, audience, detailLevel);
    const formatInstruction = format === "markdown" ? 
      "\n\nFormat the output using proper Markdown syntax with headers, lists, code blocks, etc." :
      "\n\nFormat the output as plain text without special formatting.";
    const languageInstruction = language !== 'english' ? 
      `\n\nIMPORTANT: Write the entire documentation in ${language.charAt(0).toUpperCase() + language.slice(1)}.` : 
      "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: systemPrompt + formatInstruction + languageInstruction
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add credits to your workspace.");
      }
      
      throw new Error("Failed to generate documentation");
    }

    const data = await response.json();
    const documentation = data.choices[0].message.content;

    console.log("Documentation generated successfully");

    return new Response(
      JSON.stringify({ documentation }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in generate-documentation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
