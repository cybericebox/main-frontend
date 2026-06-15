import type React from 'react'

export default function Footer() {
    return (
        <footer className="py-1 bg-primary text-white rounded-t">
	        <div className='container text-xs mx-auto'>
	            <center>© {new Date().getFullYear()} ХНУРЕ
                    {process.env.NEXT_PUBLIC_SHOW_UNIVERSITY === 'true' && (
                        <><br /><a href='https://ice.nure.ua/ua/'>За підтримки кафедри ІКІ ім. В. В.
                            Поповського</a><br/>Харківського національного університету радіоелектроніки</>
                    )}
                </center>
            </div>
        </footer>
    )
}
