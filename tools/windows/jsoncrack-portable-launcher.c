#include <windows.h>
#include <shlwapi.h>

#ifndef MAX_PATH
#define MAX_PATH 260
#endif

static void show_error(const wchar_t *message) {
    MessageBoxW(NULL, message, L"JSON Crack Portable", MB_OK | MB_ICONERROR);
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR pCmdLine, int nCmdShow) {
    wchar_t modulePath[MAX_PATH];
    if (!GetModuleFileNameW(NULL, modulePath, MAX_PATH)) {
        show_error(L"Unable to resolve launcher location.");
        return 1;
    }

    PathRemoveFileSpecW(modulePath);

    wchar_t targetPath[MAX_PATH];
    lstrcpyW(targetPath, modulePath);
    PathAppendW(targetPath, L"..\\..\\dist\\json-crack-portable.exe");

    if (!PathFileExistsW(targetPath)) {
        show_error(L"Portable executable not found. Run 'pnpm electron:build' first.");
        return 1;
    }

    STARTUPINFOW startupInfo;
    PROCESS_INFORMATION processInfo;

    ZeroMemory(&startupInfo, sizeof(startupInfo));
    ZeroMemory(&processInfo, sizeof(processInfo));
    startupInfo.cb = sizeof(startupInfo);

    if (!CreateProcessW(targetPath, NULL, NULL, NULL, FALSE, 0, NULL, NULL, &startupInfo, &processInfo)) {
        show_error(L"Unable to launch the portable executable.");
        return 1;
    }

    CloseHandle(processInfo.hProcess);
    CloseHandle(processInfo.hThread);

    return 0;
}
