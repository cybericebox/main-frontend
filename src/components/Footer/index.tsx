import { t } from '@/i18n/t'
import { SOURCE_URL } from '@/lib/links'

export default function Footer() {
    return (
        <footer className="border-t border-[var(--frost-border)] bg-transparent">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-center">
                <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                    {t('landing.footer.github')}
                </a>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                    © {new Date().getFullYear()} ХНУРЕ
                    <br />
                    За підтримки <a href='https://ice.nure.ua/ua/' target="_blank" rel="noopener noreferrer" className="hover:text-foreground">кафедри ІКІ ім. В. В. Поповського</a>
                </p>
            </div>
        </footer>
    )
}
