interface PageHeaderProps {
  title: string;
  description: string;
  theme: string;
}

export function PageHeader({ title, description, theme }: PageHeaderProps) {
  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[32px] pb-[24px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
        <p className={`basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[28px] min-h-px min-w-px not-italic relative shrink-0 text-[18px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </p>
      </div>
      <p className={`font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
        {description}
      </p>
    </div>
  );
}


