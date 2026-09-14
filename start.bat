@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Quiz Video Generator - Multi-Channel Studio

echo ========================================================================
echo               QUIZ VIDEO GENERATOR - MULTI-CHANNEL STUDIO
echo ========================================================================
echo.

:: 1. Cấu hình cổng riêng biệt (hoàn toàn tách biệt, không trùng source cũ)
:: - Frontend UI : Cổng 5400 (tránh trùng các source khác)
:: - Backend API : Cổng 5410 (tránh trùng các source khác)
if "%FRONTEND_PORT%"=="" set "FRONTEND_PORT=5400"
if "%BACKEND_PORT%"=="" set "BACKEND_PORT=5410"

echo [*] Cấu hình cổng hoạt động:
echo     - Frontend Web UI : http://localhost:%FRONTEND_PORT%
echo     - Backend API     : http://localhost:%BACKEND_PORT%
echo.

:: 2. Kiểm tra môi trường Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] LỖI: Không tìm thấy Node.js trên máy tính của bạn!
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 3. Tự động cài đặt thư viện nếu chạy lần đầu
if not exist "node_modules\" (
    echo [*] Thư viện dự án chưa được cài đặt. Đang chạy 'npm install'...
    call npm install
    if %errorlevel% neq 0 (
        echo [!] LỖI: Cài đặt thư viện thất bại! Vui lòng kiểm tra kết nối mạng.
        pause
        exit /b 1
    )
)

:: 4. Tự động giải phóng cổng nếu có tiến trình Node cũ bị kẹt
echo [*] Kiểm tra và dọn dẹp cổng %FRONTEND_PORT% và %BACKEND_PORT%...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r /c:":%FRONTEND_PORT% .*LISTENING"') do (
    echo [*] Đang giải phóng cổng %FRONTEND_PORT% (PID: %%p)...
    taskkill /F /PID %%p >nul 2>nul
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r /c:":%BACKEND_PORT% .*LISTENING"') do (
    echo [*] Đang giải phóng cổng %BACKEND_PORT% (PID: %%p)...
    taskkill /F /PID %%p >nul 2>nul
)

:: 5. Khởi động hệ thống & Tự động mở trình duyệt
echo.
echo ========================================================================
echo  Đang khởi động hệ thống... Trình duyệt sẽ tự động mở sau vài giây!
echo  (Nhấn [Ctrl + C] tại cửa sổ này nếu bạn muốn tắt tool)
echo ========================================================================
echo.

call npm start

pause
