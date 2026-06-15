import { t } from '@/i18n/t'
import { SOURCE_URL } from '@/lib/links'

export default function Footer() {
    return (
        <footer className="border-t border-[var(--frost-border)] bg-transparent">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized images */}
                    <img src="/assets/logo-crest.png" alt="CyberICEBox — ICE CTF" className="h-6 w-auto" />
                    <span className="text-xs text-muted-foreground">{t('landing.footer.rights')}</span>
                </div>
                <nav className="flex items-center gap-5 text-xs text-muted-foreground">
                    <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t('landing.footer.github')}</a>
                </nav>
            </div>
            <div className="border-t border-[var(--frost-border)] py-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                © {new Date().getFullYear()} ХНУРЕ
                <br />
                <a href='https://ice.nure.ua/ua/' target="_blank" rel="noopener noreferrer" className="hover:text-foreground">За підтримки кафедри ІКІ ім. В. В. Поповського</a>
                <br />
                Харківського національного університету радіоелектроніки
            </div>
        </footer>
    )
}
