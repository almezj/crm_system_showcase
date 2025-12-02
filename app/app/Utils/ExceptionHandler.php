<?php

namespace App\Utils;

class ExceptionHandler
{
    public static function handleException($exception)
    {
        if ($exception instanceof \App\Utils\CustomException) {
            Logger::error($exception->getMessage() . ' - Trace: ' . json_encode($exception->getTrace()));
            ErrorResponse::send($exception->getMessage(), $exception->getHttpCode(), 'CUSTOM_EXCEPTION');
        } else {
            Logger::error($exception->getMessage() . ' - Trace: ' . json_encode($exception->getTrace()));
            
            // Show detailed error in development, generic message in production
            $isDevelopment = (getenv('APP_ENV') === 'development' || getenv('APP_ENV') === 'dev');
            
            if ($isDevelopment) {
                ErrorResponse::send(
                    'An unexpected error occurred: ' . $exception->getMessage(),
                    500,
                    'UNEXPECTED_ERROR',
                    [
                        'file' => $exception->getFile(),
                        'line' => $exception->getLine(),
                        'trace' => $exception->getTraceAsString()
                    ]
                );
            } else {
                ErrorResponse::send('An unexpected error occurred. Please try again later.', 500, 'UNEXPECTED_ERROR');
            }
        }
    }

    public static function handleError($errno, $errstr, $errfile, $errline)
    {
        Logger::error("PHP Error: $errstr in $errfile on line $errline");
        
        $isDevelopment = (getenv('APP_ENV') === 'development' || getenv('APP_ENV') === 'dev');
        
        if ($isDevelopment) {
            ErrorResponse::send(
                "PHP Error: $errstr",
                500,
                'PHP_ERROR',
                [
                    'file' => $errfile,
                    'line' => $errline,
                    'code' => $errno
                ]
            );
        } else {
            ErrorResponse::send('An unexpected error occurred. Please try again later.', 500, 'PHP_ERROR');
        }
    }
}
