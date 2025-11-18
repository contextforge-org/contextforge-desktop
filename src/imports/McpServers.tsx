import svgPaths from "./svg-00ihbob3cz";
import imgProfilePhotoForAnEnterpriseUser from "figma:asset/4738bf72f3d89ef65da9ce4b462d51904577797c.png";

function Logo() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="logo">
      <div className="h-[10px] relative shrink-0 w-[16px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10">
            <path clipRule="evenodd" d={svgPaths.p461f600} fill="var(--fill-0, white)" fillRule="evenodd" id="Ellipse 1" />
          </svg>
        </div>
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-white w-[1214px]">Forge</p>
    </div>
  );
}

function Github() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="github">
      <div className="absolute flex inset-[-6px_-1px_-6px_-15px] items-center justify-center">
        <div className="flex-none h-[28px] rotate-[180deg] scale-y-[-100%] w-[55px]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-full" data-name="hover-background" />
        </div>
      </div>
      <div className="relative shrink-0 size-[16px]" data-name="GitHub">
        <div className="absolute bottom-[2.47%] left-0 right-0 top-0" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path clipRule="evenodd" d={svgPaths.p32b5ac70} fill="var(--fill-0, #A1A1AA)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-zinc-400 whitespace-pre">3k</p>
    </div>
  );
}

function Bell() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="bell">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="bell">
        <div className="absolute inset-[8.33%_12.5%_8.31%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-4.69%_-5.21%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
              <path d={svgPaths.p299e9d00} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="box-border content-stretch flex h-[24px] isolate items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="avatar">
      <div className="mr-[-8px] relative rounded-[4px] shrink-0 size-[24px] z-[1]" data-name="Profile photo for an enterprise user">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[4px] size-full" src={imgProfilePhotoForAnEnterpriseUser} />
      </div>
    </div>
  );
}

function Count() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="count">
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="chevrons-up-down">
        <div className="absolute inset-[16.67%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-8.33%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 14">
              <path d={svgPaths.p1f8c3380} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="profile">
      <div className="absolute flex h-[28px] items-center justify-center left-[calc(50%+1.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[57px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 h-[28px] opacity-0 rounded-[6px] w-[57px]" data-name="hover-background" />
        </div>
      </div>
      <Avatar />
      <Count />
    </div>
  );
}

function End() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-end relative shrink-0" data-name="end">
      <Github />
      <Bell />
      <div className="flex flex-row items-center self-stretch">
        <div className="h-full relative shrink-0 w-0" data-name="pipe">
          <div className="absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0" style={{ "--stroke-0": "rgba(39, 39, 42, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 24">
              <path d="M0.5 0V24" id="pipe" stroke="var(--stroke-0, #27272A)" />
            </svg>
          </div>
        </div>
      </div>
      <Profile />
    </div>
  );
}

function Nav() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="nav">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[40px] items-center justify-between pl-[16px] pr-[14px] py-[6px] relative w-full">
          <Logo />
          <End />
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 content-stretch flex gap-[8px] grow items-center min-h-px min-w-px relative shrink-0" data-name="text">
      <div className="basis-0 flex flex-col font-['Inter:Regular',sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">All teams</p>
      </div>
      <div className="absolute bg-gradient-to-l from-[#18181b] right-[-12px] size-[28px] to-[rgba(24,24,27,0)] top-1/2 translate-y-[-50%]" data-name="grad-mask" />
    </div>
  );
}

function IconChevronsupdown() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icon-chevronsupdown">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icon-chevronsupdown">
          <path d={svgPaths.p1b213800} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p84f8000} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Field() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[10px] items-center pl-[8px] pr-[12px] py-[10px] relative w-full">
          <Text />
          <IconChevronsupdown />
        </div>
      </div>
    </div>
  );
}

function Org() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="org">
      <Field />
    </div>
  );
}

function Item() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-[218px]">
              <div className="bg-zinc-800 rounded-[6px] size-full" data-name="hover-background" />
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="MCP">
            <div className="absolute inset-[0.54%_5.66%_0.28%_5.17%]" data-name="Vector">
              <div className="absolute inset-0" style={{ "--fill-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 18">
                  <g id="Vector">
                    <path d={svgPaths.pa6cc300} fill="var(--fill-0, #A1A1AA)" />
                    <path d={svgPaths.p2d11870} fill="var(--fill-0, #A1A1AA)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-nowrap text-white whitespace-pre">MCP Servers</p>
        </div>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-[218px]">
              <div className="bg-zinc-800 opacity-0 rounded-[6px] size-full" data-name="hover-background" />
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="server">
            <div className="absolute inset-[8.333%]" data-name="Vector">
              <div className="absolute inset-[-4.167%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                  <path d={svgPaths.p3256ee80} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
          <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">Virtual Servers</p>
        </div>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-[218px]">
              <div className="bg-zinc-800 opacity-0 rounded-[6px] size-full" data-name="hover-background" />
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="agent">
            <div className="absolute inset-[12.5%_8.33%]" data-name="Vector">
              <div className="absolute inset-[-4.63%_-4.17%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
                  <path d={svgPaths.pfa8c500} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
          <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">Agents</p>
        </div>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-[218px]">
              <div className="bg-zinc-800 opacity-0 rounded-[6px] size-full" data-name="hover-background" />
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="chart-line">
            <div className="absolute inset-[12.5%]" data-name="Vector">
              <div className="absolute inset-[-4.63%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
                  <path d={svgPaths.p2267d680} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
          <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">Metrics</p>
        </div>
      </div>
    </div>
  );
}

function SectionNav() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="section-nav">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Item4() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-[218px]">
              <div className="bg-zinc-800 opacity-0 rounded-[6px] size-full" data-name="hover-background" />
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="plug-2">
            <div className="absolute inset-[8.33%_20.83%]" data-name="Vector">
              <div className="absolute inset-[-4.17%_-5.95%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 17">
                  <path d={svgPaths.p37749d80} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
          <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">Plugins</p>
        </div>
      </div>
    </div>
  );
}

function Item5() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[32px] items-center px-[8px] py-0 relative w-full">
          <div className="absolute flex inset-0 items-center justify-center">
            <div className="flex-none h-[32px] rotate-[180deg] scale-y-[-100%] w-[218px]">
              <div className="bg-zinc-800 opacity-0 rounded-[6px] size-full" data-name="hover-background" />
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="layout-grid">
            <div className="absolute inset-[12.5%]" data-name="Vector">
              <div className="absolute inset-[-4.63%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
                  <g id="Vector">
                    <path d={svgPaths.p3e998500} stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                    <path d={svgPaths.p156ac800} stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                    <path d={svgPaths.p11a5b480} stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                    <path d={svgPaths.p29e06200} stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">MCP Registry</p>
        </div>
      </div>
    </div>
  );
}

function SectionNavSecondary() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="section-nav-secondary">
      <Item4 />
      <Item5 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] h-full items-start p-[16px] relative shrink-0 w-[250px]" data-name="nav">
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-solid border-zinc-800 bottom-0 left-0 pointer-events-none right-[-1px] top-0" />
      <Org />
      <SectionNav />
      <div className="bg-zinc-800 h-px shrink-0 w-full" data-name="line" />
      <SectionNavSecondary />
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="title">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[28px] min-h-px min-w-px not-italic relative shrink-0 text-[18px] text-white">MCP Servers</p>
    </div>
  );
}

function Search() {
  return (
    <div className="basis-0 bg-zinc-900 grow h-[32px] max-w-[640px] min-h-px min-w-px relative rounded-[6px] shrink-0" data-name="search">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-600 inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center max-w-inherit size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[32px] items-center max-w-inherit px-[12px] py-0 relative w-full">
          <div className="overflow-clip relative shrink-0 size-[14px]" data-name="icon-start">
            <div className="absolute inset-[12.5%]" data-name="Vector">
              <div className="absolute inset-[-5.952%]" style={{ "--stroke-0": "rgba(113, 113, 122, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                  <path d={svgPaths.p1565b400} id="Vector" stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
          <p className="basis-0 font-['JetBrains_Mono:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[14px] text-zinc-500">Search MCP servers...</p>
        </div>
      </div>
    </div>
  );
}

function Start() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-[640px]" data-name="start">
      <Search />
    </div>
  );
}

function Utility() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="utility">
      <Start />
      <div className="bg-white box-border content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="button-small">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-black text-nowrap whitespace-pre">Add Server</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="relative rounded-[8px] shrink-0 size-[16px]" data-name="Google Drive">
        <div className="absolute aspect-[87.3/78] bottom-[4.17%] left-1/2 top-[4.17%] translate-x-[-50%]" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 186, 0, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
              <g id="Vector">
                <path d={svgPaths.p86a6f80} fill="#0066DA" />
                <path d={svgPaths.p102cfa00} fill="#00AC47" />
                <path d={svgPaths.p1996fff0} fill="#EA4335" />
                <path d={svgPaths.p1dd2240} fill="#00832D" />
                <path d={svgPaths.p286cc680} fill="#2684FC" />
                <path d={svgPaths.p1d5784f0} fill="var(--fill-0, #FFBA00)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function More() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Gmail</p>
      </div>
      <More />
    </div>
  );
}

function Copy() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:6248/mcp</p>
      <Copy />
    </div>
  );
}

function Action() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Communication</p>
    </div>
  );
}

function Action1() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Productivity</p>
    </div>
  );
}

function Tags() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action />
      <Action1 />
    </div>
  );
}

function Card() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header />
          <Url />
          <Tags />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="bg-[#5765f2] box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="overflow-clip relative rounded-[8px] shrink-0 size-[16px]" data-name="Discord">
        <div className="absolute bottom-[12.78%] left-0 right-0 top-[11%]" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 13">
              <path d={svgPaths.p15bda300} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function More1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header1() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon1 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Discord</p>
      </div>
      <More1 />
    </div>
  );
}

function Copy1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:9746/mcp</p>
      <Copy1 />
    </div>
  );
}

function Action2() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Communication</p>
    </div>
  );
}

function Tags1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action2 />
    </div>
  );
}

function Card1() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header1 />
          <Url1 />
          <Tags1 />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="bg-[#3d50f5] box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="overflow-clip relative rounded-[8px] shrink-0 size-[16px]" data-name="Astro">
        <div className="absolute bottom-0 left-[10.42%] right-[10.42%] top-0" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 16">
              <g id="Vector">
                <path d={svgPaths.p1ca74e00} fill="var(--fill-0, white)" />
                <path d={svgPaths.p18382af2} fill="var(--fill-0, white)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function More2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header2() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon2 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Astro</p>
      </div>
      <More2 />
    </div>
  );
}

function Copy2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:4169/mcp</p>
      <Copy2 />
    </div>
  );
}

function Action3() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Documentation</p>
    </div>
  );
}

function Tags2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action3 />
    </div>
  );
}

function Card2() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header2 />
          <Url2 />
          <Tags2 />
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="relative rounded-[8px] shrink-0 size-[16px]" data-name="Slack">
        <div className="absolute bottom-[53.33%] left-0 right-[53.33%] top-0" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(54, 197, 240, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
              <path clipRule="evenodd" d={svgPaths.p2ff81f70} fill="var(--fill-0, #36C5F0)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[53.33%] left-[53.33%] right-0 top-0" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path clipRule="evenodd" d={svgPaths.p7c85600} fill="var(--fill-0, #2EB67D)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-[53.33%] right-0 top-[53.33%]" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path clipRule="evenodd" d={svgPaths.pd405100} fill="var(--fill-0, #ECB22E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-[53.33%] top-[53.33%]" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path clipRule="evenodd" d={svgPaths.pf5fd480} fill="var(--fill-0, #E01E5A)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function More3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header3() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon3 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Slack</p>
      </div>
      <More3 />
    </div>
  );
}

function Copy3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:8995/mcp</p>
      <Copy3 />
    </div>
  );
}

function Action4() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Communication</p>
    </div>
  );
}

function Action5() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Productivity</p>
    </div>
  );
}

function Tags3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action4 />
      <Action5 />
    </div>
  );
}

function Card3() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header3 />
          <Url3 />
          <Tags3 />
        </div>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-name="row">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="bg-[#635bff] box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Stripe">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path clipRule="evenodd" d={svgPaths.p22f36900} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function More4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header4() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon4 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Stripe</p>
      </div>
      <More4 />
    </div>
  );
}

function Copy4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(248, 113, 113, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #F87171)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:1488/mcp</p>
      <Copy4 />
    </div>
  );
}

function Action6() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Payments</p>
    </div>
  );
}

function Tags4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action6 />
    </div>
  );
}

function Card4() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header4 />
          <Url4 />
          <Tags4 />
        </div>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="bg-[#05bdba] box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="overflow-clip relative rounded-[8px] shrink-0 size-[16px]" data-name="Netlify">
        <div className="absolute inset-[35.96%_36.57%_35.47%_36.57%]" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
              <path d={svgPaths.p31529a60} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[5.75%] left-0 right-[-0.01%] top-[6.25%]" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 15">
              <path d={svgPaths.p8975980} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function More5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header5() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon5 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Netlify</p>
      </div>
      <More5 />
    </div>
  );
}

function Copy5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url5() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:5931/mcp</p>
      <Copy5 />
    </div>
  );
}

function Action7() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Development</p>
    </div>
  );
}

function Tags5() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action7 />
    </div>
  );
}

function Card5() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header5 />
          <Url5 />
          <Tags5 />
        </div>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="relative rounded-[8px] shrink-0 size-[16px]" data-name="GitHub">
        <div className="absolute bottom-[2.47%] left-0 right-0 top-0" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(27, 31, 35, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path clipRule="evenodd" d={svgPaths.p32b5ac70} fill="var(--fill-0, #1B1F23)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function More6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header6() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon6 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">GitHub</p>
      </div>
      <More6 />
    </div>
  );
}

function Copy6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url6() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:8025/mcp</p>
      <Copy6 />
    </div>
  );
}

function Action8() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Development</p>
    </div>
  );
}

function Tags6() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action8 />
    </div>
  );
}

function Card6() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header6 />
          <Url6 />
          <Tags6 />
        </div>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[6px] shrink-0 size-[32px]" data-name="icon">
      <div className="relative rounded-[8px] shrink-0 size-[16px]" data-name="Notion">
        <div className="absolute bottom-0 left-0 right-[4.29%] top-0" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p3b15c000} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-[4.29%] top-0" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path clipRule="evenodd" d={svgPaths.p2cfdc500} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function More7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="more">
      <div className="absolute flex items-center justify-center left-[calc(50%+0.5px)] size-[28px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="ellipsis-vertical">
        <div className="absolute inset-[16.67%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-5.21%_-41.67%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 14">
              <g id="Vector">
                <path d={svgPaths.p23ffce80} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p1eaed00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                <path d={svgPaths.p21848000} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header7() {
  return (
    <div className="content-stretch flex gap-[12px] h-[32px] items-center relative shrink-0 w-full" data-name="header">
      <Icon7 />
      <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">
        <p className="leading-[20px]">Notion</p>
      </div>
      <More7 />
    </div>
  );
}

function Copy7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="copy">
      <div className="absolute flex items-center justify-center left-[-6px] size-[28px] top-[-6px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="bg-zinc-800 opacity-0 rounded-[6px] size-[28px]" data-name="hover-background" />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="copy">
        <div className="absolute inset-[8.333%]" data-name="Vector">
          <div className="absolute inset-[-4.69%]" style={{ "--stroke-0": "rgba(161, 161, 170, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path d={svgPaths.p27d20800} id="Vector" stroke="var(--stroke-0, #A1A1AA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Url7() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="url">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(52, 211, 153, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #34D399)" id="Ellipse 43" r="3" />
          </svg>
        </div>
      </div>
      <p className="[white-space-collapse:collapse] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[13px] text-nowrap text-zinc-500 w-[160px]">http://localhost:3523/mcp</p>
      <Copy7 />
    </div>
  );
}

function Action9() {
  return (
    <div className="bg-zinc-800 box-border content-stretch flex gap-[4px] items-center px-[4px] py-[2px] relative rounded-[4px] shrink-0" data-name="action">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400 whitespace-pre">Productivity</p>
    </div>
  );
}

function Tags7() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center overflow-clip relative shrink-0 w-full" data-name="tags">
      <Action9 />
    </div>
  );
}

function Card7() {
  return (
    <div className="basis-0 bg-zinc-900 grow min-h-px min-w-px opacity-0 relative shrink-0" data-name="card">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center p-[16px] relative w-full">
          <div className="absolute bg-zinc-900 inset-0 rounded-[12px]" data-name="hover-card">
            <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
          </div>
          <Header7 />
          <Url7 />
          <Tags7 />
        </div>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-name="row">
      <Card4 />
      <Card5 />
      <Card6 />
      <Card7 />
    </div>
  );
}

function Grid() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="grid">
      <Row />
      <Row1 />
    </div>
  );
}

function Knowledge() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[32px] grow h-full items-start min-h-px min-w-px relative shrink-0" data-name="knowledge">
      <Title />
      <Utility />
      <Grid />
    </div>
  );
}

function Body() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="body">
      <div className="size-full">
        <div className="box-border content-stretch flex gap-[40px] items-start p-[24px] relative size-full">
          <Knowledge />
        </div>
      </div>
    </div>
  );
}

function Close() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="close">
      <div className="absolute bg-zinc-800 left-1/2 opacity-0 rounded-[8px] size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="hover-background" />
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="x">
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-6.944%]" style={{ "--stroke-0": "rgba(113, 113, 122, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
              <path d={svgPaths.pdd33620} id="Vector" stroke="var(--stroke-0, #71717A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Title1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="title">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[28px] min-h-px min-w-px not-italic relative shrink-0 text-[18px] text-white">Knowledge Filter</p>
      <Close />
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-nowrap text-white whitespace-pre">Filter name</p>
    </div>
  );
}

function Title2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="title">
      <Text1 />
    </div>
  );
}

function Field1() {
  return (
    <div className="h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[40px] items-center justify-between px-[8px] py-[6px] relative w-full">
          <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">Treasure Tables</p>
        </div>
      </div>
    </div>
  );
}

function IconTypeBrand() {
  return (
    <div className="bg-purple-900 content-stretch flex items-center justify-center relative rounded-[6px] shrink-0 size-[40px]" data-name="icon-type/brand">
      <div className="overflow-clip relative shrink-0 size-[25px]" data-name="ghost">
        <div className="absolute inset-[8.33%_16.67%]" data-name="Vector">
          <div className="absolute inset-[-4.8%_-6%]" style={{ "--stroke-0": "rgba(192, 132, 252, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 23">
              <path d={svgPaths.p397af00} id="Vector" stroke="var(--stroke-0, #C084FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex gap-[8px] items-end relative shrink-0 w-full" data-name="row">
      <div className="basis-0 content-stretch flex flex-col gap-[10px] grow items-start min-h-px min-w-px relative shrink-0" data-name="field">
        <Title2 />
        <Field1 />
      </div>
      <IconTypeBrand />
    </div>
  );
}

function Created() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-center justify-center leading-[14px] not-italic relative shrink-0 text-[10px] text-nowrap whitespace-pre" data-name="created">
      <p className="relative shrink-0 text-zinc-500">Created</p>
      <p className="relative shrink-0 text-zinc-400">Sep 01, 2025 8:45AM</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-nowrap text-white whitespace-pre">Description</p>
    </div>
  );
}

function Title3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="title">
      <Text2 />
    </div>
  );
}

function Field2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex items-start justify-between px-[8px] py-[6px] relative size-full">
          <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Focused subset of all loot, item tables, and magical artifacts for on-the-fly reward generation.</p>
        </div>
      </div>
    </div>
  );
}

function Id() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-end justify-end relative shrink-0 w-full" data-name="id">
      <Row2 />
      <Created />
      <div className="content-stretch flex flex-col gap-[10px] h-[160px] items-start relative shrink-0 w-full" data-name="field">
        <Title3 />
        <Field2 />
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-nowrap text-white whitespace-pre">Search query</p>
    </div>
  );
}

function Title4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="title">
      <Text3 />
    </div>
  );
}

function Field3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex items-start justify-between px-[8px] py-[6px] relative size-full">
          <p className="basis-0 font-['JetBrains_Mono:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[14px] text-zinc-500">Show me all documents about treasure, loot, or magical items</p>
        </div>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="list">
      <div className="relative rounded-[6px] shrink-0 w-full" data-name="button-small">
        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
          <div className="box-border content-stretch flex gap-[6px] items-center justify-center px-[12px] py-[8px] relative w-full">
            <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">All sources</p>
            <div className="overflow-clip relative shrink-0 size-[14px]" data-name="icon-end">
              <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                <div className="absolute inset-[-17.86%_-8.93%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                    <path d={svgPaths.p17c97470} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      </div>
      <div className="relative rounded-[6px] shrink-0 w-full" data-name="button-small">
        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
          <div className="box-border content-stretch flex gap-[6px] items-center justify-center px-[12px] py-[8px] relative w-full">
            <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">All types</p>
            <div className="overflow-clip relative shrink-0 size-[14px]" data-name="icon-end">
              <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                <div className="absolute inset-[-17.86%_-8.93%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                    <path d={svgPaths.p17c97470} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      </div>
      <div className="relative rounded-[6px] shrink-0 w-full" data-name="button-small">
        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
          <div className="box-border content-stretch flex gap-[6px] items-center justify-center px-[12px] py-[8px] relative w-full">
            <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-white">All owners</p>
            <div className="overflow-clip relative shrink-0 size-[14px]" data-name="icon-end">
              <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                <div className="absolute inset-[-17.86%_-8.93%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                    <path d={svgPaths.p17c97470} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[6px]" />
      </div>
    </div>
  );
}

function Actions() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="actions">
      <List />
    </div>
  );
}

function Title5() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[10px] items-start leading-[16px] not-italic relative shrink-0 text-[13px] text-zinc-200 w-full" data-name="title">
      <p className="basis-0 grow min-h-px min-w-px relative shrink-0">Response limit</p>
      <p className="relative shrink-0 text-nowrap whitespace-pre">3</p>
    </div>
  );
}

function Slider() {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0 w-full" data-name="slider">
      <div className="bg-zinc-500 h-[5px] rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-[120px]" data-name="fill" />
      <div className="relative shrink-0 size-[16px]" data-name="knob">
        <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]" style={{ "--fill-0": "rgba(0, 0, 0, 1)", "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <g filter="url(#filter0_dd_4_638)" id="knob">
              <circle cx="11" cy="10" fill="var(--fill-0, black)" r="8" />
              <circle cx="11" cy="10" r="7" stroke="var(--stroke-0, white)" strokeWidth="2" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_4_638" width="22" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feMorphology in="SourceAlpha" operator="erode" radius="1" result="effect1_dropShadow_4_638" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_638" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1.5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend in2="effect1_dropShadow_4_638" mode="normal" result="effect2_dropShadow_4_638" />
                <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_638" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="basis-0 bg-zinc-800 grow h-[5px] min-h-px min-w-px rounded-br-[6px] rounded-tr-[6px] shrink-0" data-name="rail" />
    </div>
  );
}

function Temp() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[10px] h-[58px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="temp">
      <Title5 />
      <Slider />
    </div>
  );
}

function Title6() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[10px] items-start leading-[16px] not-italic relative shrink-0 text-[13px] text-zinc-200 w-full" data-name="title">
      <p className="basis-0 grow min-h-px min-w-px relative shrink-0">Score threshold</p>
      <p className="relative shrink-0 text-nowrap whitespace-pre">0</p>
    </div>
  );
}

function Slider1() {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0 w-full" data-name="slider">
      <div className="relative shrink-0 size-[16px]" data-name="knob">
        <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]" style={{ "--fill-0": "rgba(0, 0, 0, 1)", "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <g filter="url(#filter0_dd_4_638)" id="knob">
              <circle cx="11" cy="10" fill="var(--fill-0, black)" r="8" />
              <circle cx="11" cy="10" r="7" stroke="var(--stroke-0, white)" strokeWidth="2" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_4_638" width="22" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feMorphology in="SourceAlpha" operator="erode" radius="1" result="effect1_dropShadow_4_638" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_638" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1.5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend in2="effect1_dropShadow_4_638" mode="normal" result="effect2_dropShadow_4_638" />
                <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_638" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="basis-0 bg-zinc-800 grow h-[5px] min-h-px min-w-px rounded-br-[6px] rounded-tr-[6px] shrink-0" data-name="rail" />
    </div>
  );
}

function Score() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[10px] h-[58px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="score">
      <Title6 />
      <Slider1 />
    </div>
  );
}

function Sliders() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-name="sliders">
      <Temp />
      <Score />
    </div>
  );
}

function Filters() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="filters">
      <Actions />
      <Sliders />
    </div>
  );
}

function End1() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-end justify-end min-h-px min-w-px relative shrink-0 w-full" data-name="end">
      <div className="bg-red-500 box-border content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="button-small">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-nowrap text-white whitespace-pre">Delete Filter</p>
      </div>
    </div>
  );
}

function Panel() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[24px] h-[942px] items-end p-[16px] right-[-360px] top-0 w-[360px]" data-name="panel">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-solid border-zinc-800 bottom-0 left-[-1px] pointer-events-none right-0 top-0" />
      <Title1 />
      <Id />
      <div className="content-stretch flex flex-col gap-[10px] h-[160px] items-start relative shrink-0 w-full" data-name="field">
        <Title4 />
        <Field3 />
      </div>
      <Filters />
      <End1 />
    </div>
  );
}

function Page() {
  return (
    <div className="basis-0 content-stretch flex grow items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="page">
      <Nav1 />
      <Body />
      <Panel />
    </div>
  );
}

export default function McpServers() {
  return (
    <div className="bg-zinc-900 relative rounded-[12px] size-full" data-name="mcp-servers">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Nav />
        <Page />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}