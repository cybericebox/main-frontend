import type React from 'react'
import { t } from '@/i18n/t'
import { SOURCE_URL, DOCS_URL, LICENSE_URL } from '@/lib/links'

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
                    <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t('landing.footer.docs')}</a>
                    <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t('landing.footer.license')}</a>
                </nav>
            </div>
            <div className="border-t border-[var(--frost-border)] py-2 text-center text-[11px] text-muted-foreground">
                © {new Date().getFullYear()} ХНУРЕ
                {process.env.NEXT_PUBLIC_SHOW_UNIVERSITY === 'true' && (
                    <><br /><a href='https://ice.nure.ua/ua/' className="hover:text-foreground">За підтримки кафедри ІКІ ім. В. В.
                        Поповського</a><br />Харківського національного університету радіоелектроніки</>
                )}
            </div>
        </footer>
    )
}
