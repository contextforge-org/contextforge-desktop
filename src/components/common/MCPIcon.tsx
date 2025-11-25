import svgPaths from '../../imports/svg-00ihbob3cz';

interface MCPIconProps {
  className?: string;
}

export function MCPIcon({ className }: MCPIconProps) {
  return (
    <svg className={className || "block size-full"} fill="none" preserveAspectRatio="none" viewBox="0 0 17 18">
      <g>
        <path d={svgPaths.pa6cc300} fill="currentColor" />
        <path d={svgPaths.p2d11870} fill="currentColor" />
      </g>
    </svg>
  );
}