<?php

namespace Config;

use PDO;

class Database
{
    private static $instances = [];
    
    const CONFIG_FILE = __DIR__ . '/../config.ini';

    public static function getConnection($connection = 'main_database')
    {
        // Get connection
    }

    public static function getMainConnection()
    {
        return self::getConnection('main_database');
    }

    public static function getStoreConnection()
    {
        return self::getConnection('store_database');
    }
}
