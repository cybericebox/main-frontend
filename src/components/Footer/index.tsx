import { t } from '@/i18n/t'
import { SOURCE_URL } from '@/lib/links'
import { Logo } from '@/components/brand/Logo'

export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="border-t border-[var(--frost-border)] bg-transparent">
            <div className="mx-auto max-w-5xl px-4 py-10">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                    {/* Brand */}
                    <div className="space-y-3">
                        <Logo size={40} />
                        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                            {t('landing.footer.tagline')}
                        </p>
                    </div>

                    {/* Legal */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">
                            {t('landing.footer.legal')}
                        </h3>
                        <a href="/privacy" className="block text-xs text-muted-foreground hover:text-foreground">
                            {t('landing.footer.privacy')}
                        </a>
                        <a href="/terms" className="block text-xs text-muted-foreground hover:text-foreground">
                            {t('landing.footer.terms')}
                        </a>
                    </div>

                    {/* Resources */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">
                            {t('landing.footer.resources')}
                        </h3>
                        <a
                            href={SOURCE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-muted-foreground hover:text-foreground"
                        >
                            {t('landing.footer.github')}
                        </a>
                    </div>
                </div>

                <div className="mt-8 border-t border-[var(--frost-border)] pt-6 text-[11px] leading-relaxed text-muted-foreground">
                    © {year} ХНУРЕ · За підтримки{' '}
                    <a
                        href="https://ice.nure.ua/ua/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                    >
                        кафедри ІКІ ім. В. В. Поповського
                    </a>
                </div>
            </div>
        </footer>
    )
}
