import { t } from '@/i18n/t'
import { SOURCE_URL } from '@/lib/links'
import { Logo } from '@/components/brand/Logo'

export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="border-t border-[var(--frost-border)] bg-transparent">
            <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8">
                {/* Row 1: logo + platform name */}
                <div className="flex items-center gap-3">
                    <Logo size={40} />
                    <span className="text-sm text-muted-foreground">
                        {t('landing.footer.tagline')}
                    </span>
                </div>

                {/* Row 2: three evenly distributed links */}
                <nav className="flex justify-between gap-4 text-xs text-muted-foreground">
                    <a href="/privacy" className="hover:text-foreground">
                        {t('landing.footer.privacy')}
                    </a>
                    <a href="/terms" className="hover:text-foreground">
                        {t('landing.footer.terms')}
                    </a>
                    <a
                        href={SOURCE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                    >
                        {t('landing.footer.github')}
                    </a>
                </nav>

                {/* Row 3: full-width divider + copyright */}
                <p className="border-t border-[var(--frost-border)] pt-5 text-[11px] leading-relaxed text-muted-foreground">
                    © {year} ХНУРЕ · За підтримки{' '}
                    <a
                        href="https://ice.nure.ua/ua/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                    >
                        кафедри ІКІ ім. В. В. Поповського
                    </a>
                </p>
            </div>
        </footer>
    )
}
