import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/branding/pap-scholars-logo.png";
import programmeLogo from "../../public/images/branding/image.png";

export function Brand({ showLogo = false }: { showLogo?: boolean }) {
  return (
    <Link href="/" aria-label="PAP Scholars home" className="inline-flex shrink-0 items-center gap-3 rounded-control">
      {showLogo ? (
        <span className="inline-flex shrink-0 items-center gap-2">
          <Image
            src={programmeLogo}
            alt="Presidential Amnesty Programme logo"
            sizes="(min-width: 640px) 56px, 48px"
            preload
            className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
          />
          <Image
            src={logo}
            alt="PAP Scholars logo"
            sizes="(min-width: 640px) 56px, 48px"
            preload
            className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
          />
        </span>
      ) : (
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-control bg-primary text-sm font-bold tracking-tight text-on-primary shadow-soft">
          P<span className="text-accent">.</span>
        </span>
      )}
      <span className="text-lg font-semibold tracking-tight text-foreground">PAP <span className="font-normal">Scholars</span></span>
    </Link>
  );
}
