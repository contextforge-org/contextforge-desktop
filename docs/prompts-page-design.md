# Prompts Page Design Specification

## Overview
Design specification for implementing a Prompts management page in the ContextForge Electron application, following established patterns from MCPServersPage and ToolsPage.

## Data Model

### Prompt Interface (TypeScript)
Based on [`PromptRead`](src/lib/contextforge-client-ts/types.gen.ts:3759) from the generated client:

```typescript
interface Prompt {
  id: number;
  name: string;
  description: string | null;
  template: string;
  arguments: PromptArgument[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags?: string[];
  metrics: PromptMetrics;
  
  // Ownership & visibility
  teamId?: string | null;
  visibility: 'public' | 'team' | 'private';
  createdBy?: string | null;
  modifiedBy?: string | null;
  
  // Metadata
  createdVia?: string | null;
  importBatchId?: string | null;
}

interface PromptArgument {
  name: string;
  description?: string | null;
  required?: boolean;
}

interface PromptMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  minResponseTime?: number | null;
  maxResponseTime?: number | null;
  avgResponseTime?: number | null;
}
```

## Page Structure

### Component Hierarchy
```
PromptsPage
├── PageHeader (reusable)
├── DataTableToolbar (reusable)
│   ├── Search input
│   ├── Filter dropdown
│   ├── View mode toggle (table/grid)
│   └── Action buttons (Add Prompt, Bulk Import)
├── Table/Grid View
│   ├── PromptTableView
│   └── PromptGridView
└── PromptDetailsPanel (side panel)
    ├── View mode
    ├── Edit mode
    └── Test/Execute mode
```

## Key Features

### 1. List View (Table Mode)
**Columns:**
- Name (with active status indicator)
- Description (truncated)
- Arguments count badge
- Tags (colored badges)
- Executions (from metrics)
- Success Rate (percentage with color coding)
- Last Updated
- Actions dropdown

**Table Features:**
- Sortable columns
- Row selection
- Hover actions
- Click to open detail panel

### 2. List View (Grid Mode)
**Card Layout:**
- Prompt name and status
- Description preview
- Arguments list
- Tags
- Metrics summary (executions, success rate)
- Quick actions (Edit, Test, Toggle, Delete)

### 3. Filtering & Search

**Search:**
- Search by name, description, template content
- Real-time filtering

**Filter Categories:**
- **Status:** Active, Inactive
- **Visibility:** Public, Team, Private
- **Tags:** Multi-select from available tags
- **Arguments:** Has arguments, No arguments
- **Performance:** High success rate (>90%), Medium (70-90%), Low (<70%)
- **Usage:** Frequently used, Rarely used, Never used
- **Team:** Filter by team (when multiple teams)

### 4. Detail Panel (Right Side)

#### View Mode
**Sections:**
1. **Header**
   - Prompt name
   - Status toggle (Active/Inactive)
   - Action buttons (Edit, Test, Duplicate, Delete)

2. **Basic Information**
   - Description
   - Visibility badge
   - Tags (editable)
   - Created/Updated timestamps
   - Owner information

3. **Template**
   - Template text with syntax highlighting
   - Variable placeholders highlighted
   - Copy button

4. **Arguments**
   - List of arguments with:
     - Name
     - Description
     - Required/Optional badge
   - Add/Edit/Remove argument buttons

5. **Metrics Dashboard**
   - Total executions
   - Success rate (with visual indicator)
   - Average response time
   - Recent execution history (mini chart)

6. **Metadata**
   - Created by
   - Modified by
   - Import batch ID (if applicable)
   - Team assignment

#### Edit Mode
**Editable Fields:**
- Name (text input)
- Description (textarea)
- Template (code editor with variable detection)
- Arguments (dynamic list)
  - Add/remove arguments
  - Edit name, description, required flag
- Tags (tag input with autocomplete)
- Visibility (dropdown: public/team/private)
- Team assignment (dropdown)
- Active status (toggle)

**Validation:**
- Name required and unique
- Template required
- Argument names must be valid identifiers
- Template variables should match defined arguments

#### Test/Execute Mode
**Features:**
1. **Argument Input Form**
   - Dynamic form based on prompt arguments
   - Required field validation
   - Type-appropriate inputs
   - Default values

2. **Execution Controls**
   - Execute button
   - Clear inputs button
   - Save test case button

3. **Results Display**
   - Rendered prompt output
   - Execution time
   - Success/failure status
   - Error messages (if any)

4. **Test History**
   - Recent test executions
   - Saved test cases
   - Quick replay

### 5. Add/Create Prompt

**Form Fields:**
- Name* (required)
- Description
- Template* (required, code editor)
- Arguments (dynamic list)
- Tags (multi-select with create new)
- Visibility (dropdown)
- Team (dropdown, filtered by user's teams)

**Template Editor Features:**
- Syntax highlighting
- Variable detection (e.g., `{{variable_name}}`)
- Auto-suggest arguments
- Preview mode

**Argument Builder:**
- Add argument button
- For each argument:
  - Name* (required)
  - Description
  - Required checkbox
  - Remove button

### 6. Bulk Import

**Import Options:**
- JSON file upload
- Paste JSON
- Import from MCP Server

**Import Preview:**
- Show prompts to be imported
- Conflict detection (duplicate names)
- Validation errors
- Select/deselect prompts
- Bulk tag assignment
- Team assignment

## API Integration

### API Methods (from SDK)
```typescript
// List prompts
listPromptsPromptsGet(options?: { query?: { skip?: number; limit?: number; } })

// Get single prompt
getPromptNoArgsPromptsPromptIdGet({ path: { prompt_id: number } })

// Create prompt
createPromptPromptsPost({ body: PromptCreate })

// Update prompt
updatePromptPromptsPromptIdPut({ path: { prompt_id: number }, body: PromptUpdate })

// Delete prompt
deletePromptPromptsPromptIdDelete({ path: { prompt_id: number } })

// Toggle active status
togglePromptStatusPromptsPromptIdTogglePost({ path: { prompt_id: number } })

// Execute prompt (with arguments)
getPromptPromptsPromptIdPost({ path: { prompt_id: number }, body: { arguments: Record<string, any> } })
```

### Data Fetching Strategy
1. **Initial Load:**
   - Fetch all prompts on component mount
   - Handle authentication (auto-login if needed)
   - Show loading state

2. **Error Handling:**
   - Display error messages
   - Retry mechanism
   - Fallback to empty state

3. **Optimistic Updates:**
   - Update UI immediately
   - Rollback on API failure
   - Show toast notifications

## UI/UX Patterns

### Color Coding
**Status Indicators:**
- Active: Green dot
- Inactive: Gray dot

**Success Rate:**
- High (>90%): Green
- Medium (70-90%): Yellow/Orange
- Low (<70%): Red

**Visibility Badges:**
- Public: Blue
- Team: Purple
- Private: Gray

### Interactions
**Click Behaviors:**
- Row click: Open detail panel
- Action buttons: Dropdown menu
- Tags: Filter by tag
- Metrics: Show detailed stats

**Keyboard Shortcuts:**
- `Cmd/Ctrl + K`: Focus search
- `Cmd/Ctrl + N`: New prompt
- `Esc`: Close panel
- `Cmd/Ctrl + S`: Save (in edit mode)

### Responsive Design
- Side panel slides in from right
- Overlay on smaller screens
- Collapsible sections in detail panel
- Mobile-friendly grid layout

## State Management

### Component State
```typescript
// Main page state
const [promptsData, setPromptsData] = useState<Prompt[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
const [searchQuery, setSearchQuery] = useState('');

// Panel state
const [showSidePanel, setShowSidePanel] = useState(false);
const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
const [panelMode, setPanelMode] = useState<'view' | 'edit' | 'test'>('view');

// Filter state
const [filters, setFilters] = useState({
  status: [] as string[],
  visibility: [] as string[],
  tags: [] as string[],
  performance: [] as string[],
});

// Edit state
const [editedName, setEditedName] = useState('');
const [editedDescription, setEditedDescription] = useState('');
const [editedTemplate, setEditedTemplate] = useState('');
const [editedArguments, setEditedArguments] = useState<PromptArgument[]>([]);
const [editedTags, setEditedTags] = useState<string[]>([]);
const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
const [editedActive, setEditedActive] = useState(true);

// Test state
const [testInputs, setTestInputs] = useState<Record<string, any>>({});
const [testResult, setTestResult] = useState<string | null>(null);
const [testLoading, setTestLoading] = useState(false);
```

### Custom Hooks
```typescript
// usePromptFilters - Filter logic
// usePromptEditor - Edit state management
// usePromptActions - CRUD operations
// usePromptTest - Test execution logic
```

## Component Files

### New Files to Create
1. **`src/components/PromptsPage.tsx`** - Main page component
2. **`src/components/PromptTableView.tsx`** - Table view
3. **`src/components/PromptGridView.tsx`** - Grid view
4. **`src/components/PromptDetailsPanel.tsx`** - Detail/edit panel
5. **`src/components/PromptTestPanel.tsx`** - Test execution interface
6. **`src/components/PromptFilterDropdown.tsx`** - Filter component
7. **`src/hooks/usePromptFilters.ts`** - Filter hook
8. **`src/hooks/usePromptEditor.ts`** - Editor hook
9. **`src/hooks/usePromptActions.ts`** - Actions hook
10. **`src/hooks/usePromptTest.ts`** - Test hook

### Reusable Components
- [`PageHeader`](src/components/common/PageHeader.tsx) - Already exists
- [`DataTableToolbar`](src/components/common/DataTableToolbar.tsx) - Already exists
- [`StatusBadge`](src/components/common/StatusBadge.tsx) - Already exists
- [`TagList`](src/components/common/TagList.tsx) - Already exists
- UI components from `src/components/ui/`

## Implementation Phases

### Phase 1: Basic Structure
- [ ] Create PromptsPage component
- [ ] Implement data fetching
- [ ] Add to navigation routing
- [ ] Basic table view with columns
- [ ] Loading and error states

### Phase 2: Detail Panel
- [ ] Create PromptDetailsPanel component
- [ ] View mode with all sections
- [ ] Edit mode with form
- [ ] Save/cancel functionality
- [ ] Validation

### Phase 3: Filtering & Search
- [ ] Implement search functionality
- [ ] Create filter dropdown
- [ ] Filter logic and state management
- [ ] Clear filters option

### Phase 4: Grid View
- [ ] Create PromptGridView component
- [ ] Card layout design
- [ ] View mode toggle

### Phase 5: CRUD Operations
- [ ] Add prompt functionality
- [ ] Edit prompt
- [ ] Delete prompt (with confirmation)
- [ ] Duplicate prompt
- [ ] Toggle active status

### Phase 6: Test/Execute
- [ ] Create PromptTestPanel
- [ ] Dynamic argument form
- [ ] Execute prompt API call
- [ ] Display results
- [ ] Test history

### Phase 7: Advanced Features
- [ ] Bulk import
- [ ] Metrics visualization
- [ ] Template syntax highlighting
- [ ] Variable detection
- [ ] Saved test cases

### Phase 8: Polish
- [ ] Keyboard shortcuts
- [ ] Animations and transitions
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Performance optimization

## Design Mockup (Text Description)

### Table View Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Prompts                                                                  │
│ Manage and test your prompt templates                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ [Search...] [Filters ▼] [Table/Grid] [+ Add Prompt ▼]                  │
├──────┬──────────────┬──────────┬──────┬────────┬──────────┬────────────┤
│ ●    │ Name         │ Desc     │ Args │ Tags   │ Exec.    │ Success    │
├──────┼──────────────┼──────────┼──────┼────────┼──────────┼────────────┤
│ 🟢   │ code-review  │ Review..│  3   │ dev qa │ 1,234    │ 95% ████   │
│ 🟢   │ summarize    │ Summ... │  2   │ docs   │ 856      │ 98% █████  │
│ ⚫   │ translate    │ Trans...│  4   │ i18n   │ 0        │ N/A        │
└──────┴──────────────┴──────────┴──────┴────────┴──────────┴────────────┘
```

### Detail Panel Layout
```
┌─────────────────────────────────────┐
│ code-review                    🟢   │
│ [Edit] [Test] [⋮]                   │
├─────────────────────────────────────┤
│ Description:                        │
│ Review code for best practices...   │
│                                     │
│ Visibility: 🔵 Public               │
│ Tags: [dev] [qa] [+]                │
│                                     │
│ Template:                           │
│ ┌─────────────────────────────────┐ │
│ │ Review the following code:      │ │
│ │ {{code}}                        │ │
│ │                                 │ │
│ │ Focus on: {{focus_areas}}      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Arguments (3):                      │
│ • code (required)                   │
│   Code to review                    │
│ • focus_areas (optional)            │
│   Specific areas to focus on        │
│ • language (optional)               │
│   Programming language              │
│                                     │
│ Metrics:                            │
│ Total Executions: 1,234             │
│ Success Rate: 95% ████░             │
│ Avg Response: 1.2s                  │
│                                     │
│ [View Full Metrics →]               │
└─────────────────────────────────────┘
```

## Technical Considerations

### Performance
- Virtualized table for large datasets
- Debounced search
- Memoized filter functions
- Lazy loading for metrics

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

### Testing Strategy
- Unit tests for hooks
- Component tests for UI
- Integration tests for API calls
- E2E tests for critical flows

## Migration Notes

### From Existing Patterns
- Follow MCPServersPage structure for consistency
- Reuse ToolsPage filtering patterns
- Adapt ServerDetailsPanel for PromptDetailsPanel
- Use existing hooks patterns (useServerFilters, useServerEditor)

### API Wrapper
Consider creating a wrapper in `src/lib/api/contextforge-api-ipc.ts`:
```typescript
export async function listPrompts() {
  return await sdk.listPromptsPromptsGet();
}

export async function createPrompt(data: PromptCreate) {
  return await sdk.createPromptPromptsPost({ body: data });
}

// ... other prompt methods
```

## Future Enhancements

1. **Prompt Versioning**
   - Track template changes
   - Rollback capability
   - Version comparison

2. **Prompt Chaining**
   - Link prompts together
   - Output of one → input of another
   - Visual workflow builder

3. **A/B Testing**
   - Compare prompt variations
   - Track performance metrics
   - Automatic optimization

4. **Prompt Library**
   - Community templates
   - Import from marketplace
   - Share prompts

5. **Advanced Analytics**
   - Usage trends
   - Performance over time
   - Cost analysis

6. **Collaboration**
   - Comments on prompts
   - Review/approval workflow
   - Change history

## Questions for User

1. **Template Syntax**: What variable syntax should we support? (e.g., `{{var}}`, `{var}`, `$var`)
2. **Execution Context**: Should prompts be executed locally or sent to a backend service?
3. **Metrics Collection**: How are prompt metrics collected? Real-time or batch?
4. **Permissions**: What permission model for prompt visibility (public/team/private)?
5. **Import Format**: What JSON structure for bulk import?
6. **Testing**: Should we support mock/dry-run executions?

## Summary

This design provides a comprehensive Prompts management page that:
- ✅ Follows existing application patterns
- ✅ Leverages generated API client
- ✅ Provides full CRUD operations
- ✅ Includes testing/execution capabilities
- ✅ Supports filtering and search
- ✅ Shows metrics and analytics
- ✅ Maintains consistency with other pages
- ✅ Scales for future enhancements

The implementation can be done incrementally following the phased approach, with each phase delivering working functionality.