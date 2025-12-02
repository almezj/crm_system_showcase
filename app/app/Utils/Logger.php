<?php

namespace App\Utils;

class Logger
{
    private static $logFile = __DIR__ . '/../../public/static/debug.log';
    
    public static function log($message, $level = 'INFO')
    {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
        
        // Ensure the directory exists
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Write to log file
        file_put_contents(self::$logFile, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Also write to PHP error log for compatibility
        error_log($logEntry);
    }
    
    public static function debug($message)
    {
        self::log($message, 'DEBUG');
    }
    
    public static function info($message)
    {
        self::log($message, 'INFO');
    }
    
    public static function error($message)
    {
        self::log($message, 'ERROR');
    }
    
    public static function clear()
    {
        if (file_exists(self::$logFile)) {
            unlink(self::$logFile);
        }
    }
    
    public static function getLogFile()
    {
        return self::$logFile;
    }
}
