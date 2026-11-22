/* Final dark palette guard for dynamically-created windows and controls. */
(()=>{'use strict';
const id='darkContrast153';let style=document.getElementById(id);if(!style){style=document.createElement('style');style.id=id;document.head.append(style);}
style.textContent=`
.global-search-kbd152{display:none!important}
@media screen {
 body.dark{color:#f1f5f9!important;background:#0b1220!important;color-scheme:dark}
 body.dark main#appMainScroll153,body.dark main{background:#0f172a!important;color:#f1f5f9!important}
 body.dark header{background:#111c2e!important;border-color:#334155!important;color:#f1f5f9!important}
 body.dark main .tab-view{color:#f1f5f9}

 body.dark main .tab-view .bg-gray-50,body.dark main .tab-view .bg-neutral-50,body.dark main .tab-view .bg-white{background-color:#172337!important;color:#f1f5f9}
 body.dark main .tab-view .bg-gray-100,body.dark main .tab-view .bg-neutral-100{background-color:#202f45!important;color:#f1f5f9}
 body.dark main .tab-view .bg-gray-200,body.dark main .tab-view .bg-neutral-200{background-color:#2b3b52!important;color:#f1f5f9}
 body.dark main .tab-view .bg-gray-800,body.dark main .tab-view .bg-neutral-800{background-color:#101b2d!important;color:#f1f5f9}
 body.dark main .tab-view .text-gray-950,body.dark main .tab-view .text-gray-900,body.dark main .tab-view .text-gray-800,body.dark main .tab-view .text-neutral-950,body.dark main .tab-view .text-neutral-900,body.dark main .tab-view .text-black{color:#f8fafc!important}
 body.dark main .tab-view .text-gray-700,body.dark main .tab-view .text-neutral-700{color:#e2e8f0!important}
 body.dark main .tab-view .text-gray-600,body.dark main .tab-view .text-neutral-600{color:#cbd5e1!important}
 body.dark main .tab-view .text-gray-500,body.dark main .tab-view .text-neutral-500{color:#cbd5e1!important}
 body.dark main .tab-view .border-gray-100,body.dark main .tab-view .border-gray-200,body.dark main .tab-view .border-gray-300,body.dark main .tab-view .border-neutral-100,body.dark main .tab-view .border-neutral-200{border-color:#3b4a60!important}
 body.dark main .tab-view .bg-rose-50,body.dark main .tab-view .bg-red-50,body.dark main .tab-view [class*="bg-rose-50/"],body.dark main .tab-view [class*="bg-red-50/"]{background-color:#3b1f2a!important;color:#fecdd3!important}
 body.dark main .tab-view .bg-amber-50,body.dark main .tab-view .bg-yellow-50,body.dark main .tab-view [class*="bg-amber-50/"],body.dark main .tab-view [class*="bg-yellow-50/"]{background-color:#3a2d19!important;color:#fde68a!important}
 body.dark main .tab-view .bg-emerald-50,body.dark main .tab-view .bg-green-50,body.dark main .tab-view .bg-teal-50,body.dark main .tab-view [class*="bg-emerald-50/"],body.dark main .tab-view [class*="bg-teal-50/"]{background-color:#13332d!important;color:#a7f3d0!important}
 body.dark main .tab-view .bg-blue-50,body.dark main .tab-view .bg-sky-50,body.dark main .tab-view .bg-cyan-50,body.dark main .tab-view .bg-indigo-50,body.dark main .tab-view .bg-violet-50,body.dark main .tab-view [class*="bg-indigo-50/"],body.dark main .tab-view [class*="bg-sky-50/"]{background-color:#172e43!important;color:#bae6fd!important}
 body.dark main .tab-view .bg-emerald-100,body.dark main .tab-view .bg-green-100,body.dark main .tab-view .bg-teal-100{background-color:#064e3b!important;color:#d1fae5!important;border-color:#059669!important}
 body.dark main .tab-view .bg-amber-100,body.dark main .tab-view .bg-yellow-100,body.dark main .tab-view .bg-orange-100{background-color:#78350f!important;color:#fef3c7!important;border-color:#d97706!important}
 body.dark main .tab-view .bg-rose-100,body.dark main .tab-view .bg-red-100{background-color:#881337!important;color:#ffe4e6!important;border-color:#e11d48!important}
 body.dark main .tab-view .bg-sky-100,body.dark main .tab-view .bg-blue-100,body.dark main .tab-view .bg-indigo-100,body.dark main .tab-view .bg-violet-100,body.dark main .tab-view .bg-purple-100{background-color:#1e3a8a!important;color:#dbeafe!important;border-color:#3b82f6!important}
 body.dark main .tab-view .text-rose-900,body.dark main .tab-view .text-rose-800,body.dark main .tab-view .text-rose-700,body.dark main .tab-view .text-red-800,body.dark main .tab-view .text-red-700{color:#fda4af!important}
 body.dark main .tab-view .text-amber-900,body.dark main .tab-view .text-amber-800,body.dark main .tab-view .text-amber-700,body.dark main .tab-view .text-yellow-800{color:#fcd34d!important}
 body.dark main .tab-view .text-emerald-900,body.dark main .tab-view .text-emerald-800,body.dark main .tab-view .text-emerald-700,body.dark main .tab-view .text-teal-900,body.dark main .tab-view .text-teal-800,body.dark main .tab-view .text-teal-700,body.dark main .tab-view .text-green-800{color:#6ee7b7!important}
 body.dark main .tab-view .text-blue-900,body.dark main .tab-view .text-blue-800,body.dark main .tab-view .text-blue-700,body.dark main .tab-view .text-sky-900,body.dark main .tab-view .text-sky-800,body.dark main .tab-view .text-sky-700,body.dark main .tab-view .text-indigo-900,body.dark main .tab-view .text-indigo-800,body.dark main .tab-view .text-indigo-700,body.dark main .tab-view .text-cyan-800{color:#93c5fd!important}
 body.dark main .tab-view table thead th{background-color:var(--table-head-bg,#1e293b)!important;color:var(--table-head-text,#f8fafc)!important;border-bottom-color:#334155!important;border-inline-start-color:rgba(100,116,139,0.45)!important;border-inline-end-color:rgba(100,116,139,0.45)!important}
 body.dark main .tab-view table tbody td{border-color:#334155!important;color:#f1f5f9}
 body.dark main .tab-view table tfoot tr,body.dark main .tab-view table tfoot td,body.dark main .tab-view table tfoot th{background-color:#0f172a!important;color:#f8fafc!important;border-color:#475569!important}
 body.dark [id$="Pager"]{background-color:#131f33!important;color:#e2e8f0!important;border-color:#334155!important}
 body.dark [id$="Pager"] button{background-color:#1e293b!important;color:#f1f5f9!important;border-color:#475569!important}
 body.dark .row-combo160{background-color:#0f172a!important;border-color:#475569!important}
 body.dark .row-combo160 input{color:#f8fafc!important;background:transparent!important}
 body.dark .row-combo-menu160{background-color:#1e293b!important;border-color:#475569!important;color:#f8fafc!important}
 body.dark .row-combo-opt160{color:#e2e8f0!important}
 body.dark .row-combo-opt160:hover{background-color:#0f766e!important;color:#ffffff!important}
 body.dark .app-dialog144 .bg-slate-50,body.dark .studio-card150 .bg-slate-50,body.dark #operationsModal149 .bg-slate-50,body.dark #reviewCenter .bg-slate-50{background-color:#1d2b40!important}
 body.dark .app-dialog144 .bg-rose-50,body.dark .studio-card150 .bg-rose-50,body.dark .app-dialog144 .bg-amber-50,body.dark .studio-card150 .bg-amber-50{background-color:#3a2d27!important}
 body.dark .app-dialog144 .text-gray-900,body.dark .app-dialog144 .text-gray-800,body.dark .studio-card150 .text-gray-900,body.dark .studio-card150 .text-gray-800,body.dark #operationsModal149 .text-gray-900,body.dark #reviewCenter .text-gray-900{color:#f8fafc!important}
 body.dark .app-dialog144 .text-gray-700,body.dark .studio-card150 .text-gray-700,body.dark #operationsModal149 .text-gray-700,body.dark #reviewCenter .text-gray-700{color:#e2e8f0!important}
 body.dark .app-dialog144 .text-gray-600,body.dark .studio-card150 .text-gray-600,body.dark #operationsModal149 .text-gray-600,body.dark #reviewCenter .text-gray-600{color:#cbd5e1!important}
 body.dark .app-dialog144 .text-gray-500,body.dark .studio-card150 .text-gray-500,body.dark #operationsModal149 .text-gray-500,body.dark #reviewCenter .text-gray-500{color:#cbd5e1!important}
 body.dark .app-dialog144 button:not(.bg-rose-600):not(.bg-emerald-600),body.dark .studio-card150 button{border-color:#46566d}
 body.dark .app-dialog144 input::placeholder,body.dark .app-dialog144 textarea::placeholder,body.dark .studio-card150 input::placeholder{color:#94a3b8!important;opacity:1}
 body.dark .app-dialog144 table,body.dark .studio-card150 table{color:#f1f5f9!important}
 body.dark .app-dialog144 th,body.dark .studio-card150 th{background:var(--table-head-bg,#1e293b)!important;color:var(--table-head-text,#f8fafc)!important}
 body.dark .app-dialog144 td,body.dark .studio-card150 td{border-color:#3b4a60!important}
 body.dark main .tab-view .bg-white,body.dark main .tab-view .bg-slate-50{background-color:#172337!important}
 body.dark main .tab-view .bg-slate-100{background-color:#202f45!important}
 body.dark main .tab-view .bg-slate-200{background-color:#2b3b52!important;color:#f1f5f9!important}
 body.dark main .tab-view .text-slate-950,body.dark main .tab-view .text-slate-900,body.dark main .tab-view .text-slate-800{color:#f8fafc!important}
 body.dark main .tab-view .text-slate-700{color:#e2e8f0!important}
 body.dark main .tab-view .text-slate-600{color:#cbd5e1!important}
 body.dark main .tab-view .text-slate-500{color:#cbd5e1!important}
 body.dark main .tab-view .text-slate-400{color:#b1bfd0!important}
 body.dark main .tab-view .border-slate-100,body.dark main .tab-view .border-slate-200,body.dark main .tab-view .border-slate-300,body.dark main .tab-view .divide-slate-100>*+*,body.dark main .tab-view .divide-slate-200>*+*{border-color:#3b4a60!important}
 body.dark main .tab-view input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]),body.dark main .tab-view select,body.dark main .tab-view textarea{background-color:#101b2d!important;color:#f8fafc!important;border-color:#46566d!important;color-scheme:dark}
 body.dark main .tab-view input::placeholder,body.dark main .tab-view textarea::placeholder{color:#94a3b8!important;opacity:1}
 body.dark main .tab-view option{background:#172337!important;color:#f8fafc!important}
 body.dark main .tab-view button.bg-white,body.dark main .tab-view button.bg-slate-50,body.dark main .tab-view button.bg-slate-100{color:#f1f5f9!important}
 body.dark main .tab-view .hover\\:bg-slate-50:hover,body.dark main .tab-view .hover\\:bg-slate-100:hover,body.dark main .tab-view .hover\\:bg-slate-200:hover{background-color:#2b3b52!important}
 body.dark main .tab-view table{color:#f1f5f9}
 body.dark main .tab-view tbody tr{border-color:#334155!important}
 body.dark main .tab-view tbody tr:hover{background-color:#243247!important}
 body.dark .settings-nav-btn{color:#e2e8f0!important}
 body.dark .settings-nav-btn.bg-teal-600,body.dark .settings-nav-btn.text-white{color:#ffffff!important}
 body.dark .ops-card149,body.dark .ops-dialog149,body.dark .pos-card148,body.dark .pos-rail148{background-color:#172337!important;color:#f1f5f9!important;border-color:#3b4a60!important}
 body.dark .app-dialog144>section,body.dark .dialog-card144,body.dark .studio-card150,body.dark .studio-overlay150>section,body.dark #operationsModal149>section,body.dark #pdfOptionsModal>section,body.dark #reviewCenter>section{background:#172337!important;color:#f1f5f9!important;border-color:#3b4a60!important}
 body.dark .app-dialog144 .bg-white,body.dark .studio-card150 .bg-white,body.dark #operationsModal149 .bg-white,body.dark #reviewCenter .bg-white,body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-white:not(#printArea):not(#printArea *):not(#statementInvoiceSheet):not(#statementInvoiceSheet *){background-color:#1d2b40!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-50:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-gray-50,body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-neutral-50{background-color:#1d2b40!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-100:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-gray-100,body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-neutral-100{background-color:#243247!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-900:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-800:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-900,body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-800{color:#f8fafc!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-700:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-700{color:#e2e8f0!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-600:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-600{color:#cbd5e1!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-500:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-500{color:#cbd5e1!important}
 body.dark .fixed.inset-0 input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]),body.dark .fixed.inset-0 select,body.dark .fixed.inset-0 textarea{background:#101b2d!important;color:#f8fafc!important;border-color:#46566d!important;color-scheme:dark}
 body.dark .fixed.inset-0 input::placeholder,body.dark .fixed.inset-0 textarea::placeholder{color:#94a3b8!important;opacity:1}
 body.dark .app-dialog144 .text-slate-900,body.dark .app-dialog144 .text-slate-800,body.dark .studio-card150 .text-slate-900,body.dark .studio-card150 .text-slate-800,body.dark #operationsModal149 .text-slate-900,body.dark #operationsModal149 .text-slate-800,body.dark #reviewCenter .text-slate-900,body.dark #reviewCenter .text-slate-800{color:#f8fafc!important}
 body.dark .app-dialog144 .text-slate-700,body.dark .studio-card150 .text-slate-700,body.dark #operationsModal149 .text-slate-700,body.dark #reviewCenter .text-slate-700{color:#e2e8f0!important}
 body.dark .app-dialog144 .text-slate-600,body.dark .studio-card150 .text-slate-600,body.dark #operationsModal149 .text-slate-600,body.dark #reviewCenter .text-gray-600{color:#cbd5e1!important}
 body.dark .app-dialog144 .text-slate-500,body.dark .studio-card150 .text-slate-500,body.dark #operationsModal149 .text-slate-500,body.dark #reviewCenter .text-slate-500{color:#cbd5e1!important}
 body.dark .app-dialog144 .border-slate-100,body.dark .app-dialog144 .border-slate-200,body.dark .studio-card150 .border-slate-100,body.dark .studio-card150 .border-slate-200,body.dark #operationsModal149 .border-slate-100,body.dark #operationsModal149 .border-slate-200{border-color:#3b4a60!important}
 body.dark .app-dialog144 input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]),body.dark .app-dialog144 select,body.dark .app-dialog144 textarea,body.dark .studio-card150 input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]),body.dark .studio-card150 select,body.dark .studio-card150 textarea{background:#101b2d!important;color:#f8fafc!important;border-color:#46566d!important;color-scheme:dark}
 body.dark .window-tools150{background:#111c2e!important;color:#f1f5f9!important;border-color:#3b4a60!important}
 body.dark #notificationCenter152 .notification-card152{background:var(--notice-panel,#111c2e)!important;color:var(--notice-title,#f8fafc)!important}
 body.dark #notificationCenter152 .notification-head152 button,body.dark #notificationCenter152 .notification-tools152 button,body.dark #notificationCenter152 .notification-tools152 select{background:var(--notice-row,#1e293b)!important;color:var(--notice-title,#f8fafc)!important;border-color:var(--notice-border,#334155)!important}
 body.dark #notificationCenter152 .notification-row152{background:var(--notice-row,#1e293b)!important;border-color:var(--notice-border,#334155)!important}
 body.dark #notificationCenter152 .notification-row152.is-read{background:var(--notice-read,#172337)!important}
 body.dark #notificationCenter152 .notification-copy152 strong{color:var(--notice-title,#f8fafc)!important}
 body.dark #notificationCenter152 .notification-copy152 p{color:var(--notice-body,#cbd5e1)!important}
 body.dark .global-search-wrap152{background:#111c2e!important;border-color:#46566d!important}
 body.dark #notificationsButton152,body.dark .notifications-button152{background:#1e293b!important;color:#fbbf24!important;border:1.5px solid #f59e0b!important}
 body.dark #notificationsButton152>i,body.dark .notifications-button152>i{color:#fbbf24!important;font-weight:900!important}
 body.dark .global-search-input152{color:#f8fafc!important;background:transparent!important}
 body.dark .global-search-results152{background:#172337!important;color:#f8fafc!important;border-color:#46566d!important}
 body.dark .global-search-result152{background:#172337!important;color:#f8fafc!important}
 body.dark .global-search-result152:hover,body.dark .global-search-result152:focus-visible{background:#26364c!important}
 body.dark .global-search-result-copy152 small{color:#cbd5e1!important}
 body.dark #colsPanel,body.dark #privPanel{background:#172337!important;color:#f1f5f9!important;border-color:#46566d!important}
 body.dark #colsPanel label,body.dark #privPanel label{color:#f1f5f9!important}
 /* Uniform contrast for all dynamically-created dialogs/popovers, including older screens. */
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-white:not(#printArea):not(#printArea *):not(#statementInvoiceSheet):not(#statementInvoiceSheet *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-white:not(#printArea):not(#printArea *):not(#statementInvoiceSheet):not(#statementInvoiceSheet *),body.dark .app-dialog144 .bg-white,body.dark .studio-overlay150 .bg-white{background-color:#172337!important;color:#f1f5f9!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-50:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-50:not(#printArea *){background-color:#1d2b40!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-100:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-100:not(#printArea *){background-color:#243247!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-200:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-slate-200:not(#printArea *){background-color:#2b3b52!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-950:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-900:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-800:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-950,body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-900,body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-800,body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-black:not(#printArea *){color:#f8fafc!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-700:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-700,body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-700:not(#printArea *){color:#e2e8f0!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-600:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-600,body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-600:not(#printArea *){color:#cbd5e1!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-500:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-500,body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-500:not(#printArea *){color:#cbd5e1!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-400:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-gray-400,body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .text-slate-400:not(#printArea *){color:#b1bfd0!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .border-slate-100:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .border-slate-200:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .border-slate-300:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .border-slate-200:not(#printArea *){border-color:#3b4a60!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-rose-50:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-rose-50:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-red-50{background-color:#3b1f2a!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-amber-50:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-amber-50:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-yellow-50{background-color:#3a2d19!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-emerald-50:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-emerald-50:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-green-50{background-color:#12352d!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-blue-50:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-blue-50:not(#printArea *),body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) .bg-sky-50{background-color:#172e43!important}
 body.dark .fixed.inset-0 input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]),body.dark .fixed.inset-0 select,body.dark .fixed.inset-0 textarea,body.dark [role="dialog"] input:not([type=color]):not([type=checkbox]):not([type=radio]):not([type=range]),body.dark [role="dialog"] select,body.dark [role="dialog"] textarea{background-color:#101b2d!important;color:#f8fafc!important;border-color:#46566d!important;color-scheme:dark}
 body.dark .fixed.inset-0 input::placeholder,body.dark .fixed.inset-0 textarea::placeholder,body.dark [role="dialog"] input::placeholder,body.dark [role="dialog"] textarea::placeholder{color:#94a3b8!important;opacity:1}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) table:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) table:not(#printArea *){color:#f1f5f9!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) th:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) th:not(#printArea *){background:#1e293b!important;color:#f8fafc!important}
 body.dark .fixed.inset-0:not(#modalPrintInvoice):not(#statementDocumentPreview) td:not(#printArea *),body.dark [role="dialog"]:not(#modalPrintInvoice):not(#statementDocumentPreview) td:not(#printArea *){border-color:#3b4a60!important}
 body.dark #loginScreen input,body.dark #lockScreenOverlay input{background:#fff!important;color:#172337!important;color-scheme:light}
 body.dark .fixed.inset-0 .text-slate-800{color:#f8fafc}
 body.dark #statementDocumentPreview #statementInvoiceSheet{background-color:#ffffff!important;color:#172337!important;border-color:#cbd5e1!important;color-scheme:light!important}
 body.dark #opsPaper149,body.dark .ops-paper149{background-color:#ffffff!important;color:#000000!important;border-color:#0f172a!important;color-scheme:light!important}
 body.dark #opsPaper149 *,body.dark .ops-paper149 *{color:#000000!important;border-color:#1e293b!important}
 body.dark #opsPaper149 th,body.dark .ops-paper149 th{background-color:#e2e8f0!important;color:#000000!important}
 body.dark #opsPaper149 td,body.dark .ops-paper149 td{background-color:#ffffff!important;color:#000000!important}
}
@media print{#darkContrast153{display:none}}
`;
const apply=()=>{if(document.body)document.body.classList.toggle('dark',document.body.classList.contains('dark'));};
const old=window.applyUi;if(typeof old==='function'&&!old.__dark153){const wrapped=function(...args){const out=old.apply(this,args);apply();return out;};wrapped.__dark153=true;window.applyUi=wrapped;}
new MutationObserver(apply).observe(document.body,{attributes:true,attributeFilter:['class']});apply();
})();
