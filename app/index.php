<?php
// ===========================================
// SECURITY HEADERS - OWASP Top 10 Protection
// ===========================================

require_once __DIR__ . '/app/Utils/SecurityHeaders.php';
use App\Utils\SecurityHeaders;

SecurityHeaders::setSecurityHeaders();

// ===========================================
// CORS CONFIGURATION - Simple & Secure
// ===========================================

$allowedOrigins = [
    'http://localhost:3000',
    'https://comforting-malabi-3835ed.netlify.app',
    'https://app.carelli.cz'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isAllowed = in_array($origin, $allowedOrigins);

if ($isAllowed) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token");
    header("Access-Control-Allow-Credentials: true");
}

// preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header("Content-Type: application/json");
    echo json_encode(['status' => 'preflight_ok']);
    exit(0);
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/Routes/Router.php';
require_once __DIR__ . '/app/Utils/ExceptionHandler.php';

use App\Utils\ExceptionHandler;
use App\Routes\Router;

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

set_exception_handler([ExceptionHandler::class, 'handleException']);
set_error_handler([ExceptionHandler::class, 'handleError']);

header("Content-Type: application/json");

try {
    $router = new Router();
    $router->handleRequest($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
    http_response_code(500);
} 