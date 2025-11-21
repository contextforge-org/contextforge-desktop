interface TagListProps {
  tags: string[];
  maxVisible?: number;
  colorScheme?: 'default' | 'colorful';
  onTagClick?: (tag: string) => void;
  theme: string;
}

// Helper function to get consistent tag colors
const getTagColor = (tag: string, theme: string) => {
  const darkColors = [
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  ];
  
  const lightColors = [
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  ];
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function TagList({ 
  tags, 
  maxVisible, 
  colorScheme = 'default', 
  onTagClick, 
  theme 
}: TagListProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const remainingCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;
  
  const getTagClassName = (tag: string) => {
    if (colorScheme === 'colorful') {
      const colors = getTagColor(tag, theme);
      return `${colors.bg} ${colors.text} ${colors.border} border px-2 py-1 rounded text-xs font-medium`;
    }
    return `px-2 py-1 rounded text-xs ${
      theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-700'
    }`;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={`${getTagClassName(tag)} ${onTagClick ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
}


