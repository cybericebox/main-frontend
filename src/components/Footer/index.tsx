import { t } from '@/i18n/t'
import { SOURCE_URL } from '@/lib/links'
import { Logo } from '@/components/brand/Logo'

export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="border-t border-[var(--frost-border)] bg-transparent">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
                {/* Brand: short platform description, with year + support note at the bottom */}
                <div className="flex max-w-sm flex-col gap-3">
                    <Logo size={40} />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {t('landing.footer.tagline')}
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
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

                {/* Links (no heading) */}
                <div className="flex flex-col gap-2">
                    <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
                        {t('landing.footer.privacy')}
                    </a>
                    <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
                        {t('landing.footer.terms')}
                    </a>
                    <a
                        href={SOURCE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        {t('landing.footer.github')}
                    </a>
                </div>
            </div>
        </footer>
    )
}
