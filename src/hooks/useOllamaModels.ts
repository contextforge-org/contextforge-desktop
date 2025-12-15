import { useState, useEffect } from 'react';

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaModelsResponse {
  models: OllamaModel[];
}

/**
 * Hook to fetch available Ollama models from the Ollama API
 * Returns all installed models - most modern models support tool calling
 */
export function useOllamaModels(baseUrl: string = 'http://localhost:11434') {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchModels() {
      if (!baseUrl) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseUrl}/api/tags`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch Ollama models: ${response.statusText}`);
        }

        const data: OllamaModelsResponse = await response.json();
        
        if (isMounted) {
          // Show all available models - let the user decide which ones support tools
          // Most modern models (Llama 3+, Mistral, Mixtral, Qwen, Granite, etc.) support tool calling
          const allModels = data.models
            .map(model => model.name)
            .sort();

          setModels(allModels);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Ollama models';
          setError(errorMessage);
          console.error('Error fetching Ollama models:', err);
          
          // Fallback to default models if fetch fails
          setModels([
            'llama3.2',
            'llama3.1',
            'llama3',
            'mistral',
            'mixtral',
            'qwen2.5',
            'phi3',
          ]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      isMounted = false;
    };
  }, [baseUrl]);

  return { models, isLoading, error };
}

// Made with Bob
