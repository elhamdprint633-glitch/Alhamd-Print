# Isolated native smoke test

Use a NEW empty ALHAMD_QA_DATA folder. Never point the test at real business data.
Create the ALHAMD_QA_PDF output folder first. Set ALHAMD401_RESULT to a JSON output file.
Run Electron with tests/native-401/boot.cjs as the entry script.
On a Linux headless test machine use --ozone-platform=headless; this sandboxed cloud
requires --no-sandbox for development QA only. Packaged builds still enable sandboxing.
The scenario signs in, posts purchases/invoices/receipts/services, checks accounting
balances, persists through real IPC/SQLite, exports a real PDF and checks the employee
session after manager PIN confirmation. Any renderer error makes the test fail.
ALHAMD401_SCENARIO can select reopen.js to check the SAME isolated database in a new process.
On Linux without a key store the encrypted daily backup cannot be created; Windows
DPAPI behavior must be tested on Windows. For the isolated reopen test only, mark
lastDaily as today's UTC date in desktop-config.json before starting so that the
unavailable development encryption provider is not mistaken for a SQLite failure.
