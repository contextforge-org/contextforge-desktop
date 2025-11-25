export type MCPServer = {
  id: string; // Changed from number to string to match API
  name: string;
  logoUrl: string;
  url: string;
  description: string;
  tags: string[];
  active: boolean;
  lastSeen: string;
  team: string;
  visibility: 'public' | 'team' | 'private';
  transportType: string;
  authenticationType: string;
  passthroughHeaders: string[];
  associatedTools?: string[];
  associatedResources?: string[];
  associatedPrompts?: string[];
};


