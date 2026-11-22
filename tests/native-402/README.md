# Native backup regression test

Run only with fresh isolated ALHAMD_QA_DATA and ALHAMD402_RESULT paths.
Use Electron to run tests/native-402/boot.cjs; on Linux headless use
--no-sandbox --ozone-platform=headless for this unpackaged QA process only.
The test bootstrap uses a deliberately isolated key-store shim; it is excluded
from the packaged app and does not verify real Windows DPAPI.
The test clicks through the actual export/password/verify/admin-restore UI,
checks wrong passwords do not open fatal diagnostics, restores from a portable
ZIP and verifies the new locked renderer and the original financial balance.
ALHAMD402_REOPEN=1 checks the same test data in a new process with an unavailable
backup directory, ensuring that login still succeeds and a warning is shown.
Do not use the test shim or paths with real business data.
