<?php

namespace App\Routes;

use App\Middlewares\AuthMiddleware;
use App\Controllers\UserController;
use App\Controllers\RoleController;
use App\Controllers\AuthController;
use App\Controllers\ProductController;
use App\Controllers\ManufacturerController;
use App\Controllers\AddressController;
use App\Controllers\ReferenceController;
use App\Controllers\PersonController;
use App\Controllers\ContactController;
use App\Controllers\VehicleController;
use App\Controllers\ManufacturerLocationsController;
use App\Controllers\ProductMetadataController;
use App\Controllers\ProposalController;
use App\Controllers\OrderController;
use App\Controllers\PickupController;
use App\Controllers\DeliveryController;
use App\Controllers\StopItemsController;
use App\Controllers\RouteController;
use App\Controllers\ProductImageController;
use App\Controllers\LanguageController;
use App\Controllers\ProductTranslationController;
use App\Controllers\MaterialController;
use App\Controllers\DashboardController;
use App\Controllers\PieceController;
use App\Controllers\PieceImageController;
use App\Controllers\PieceMaterialController;
use App\Controllers\ProposalItemPieceMaterialController;
use App\Controllers\CarelliItemController;
use App\Controllers\ZendeskController;
use App\Utils\JsonResponse;

class Router
{
    private $authMiddleware;
    private $resourceWhitelists;

    public function __construct()
    {
        $this->authMiddleware = new AuthMiddleware();
        $this->resourceWhitelists = [
            'users' => [
                'GET' => ['auth' => true, 'roles' => ['Admin']],
                'POST' => ['auth' => true, 'roles' => ['Admin']],
                'PATCH' => ['auth' => true, 'roles' => ['Admin']],
            ],
            'roles' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
            ],
            'permissions' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'products' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'manufacturers' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'addresses' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'references' => [
                'GET' => ['auth' => true],
            ],
            'persons' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'contacts' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'vehicles' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'manufacturer-locations' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'metadata' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'proposals' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'orders' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'pickups' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
            ],
            'deliveries' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
            ],
            'routes' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
            ],
            'stop-items' => [
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
            ],
            'languages' => [
                'GET' => ['auth' => true],
            ],
            'product-translations' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'materials' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'pieces' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'piece-images' => [
                'GET' => ['auth' => true],
                'POST' => ['auth' => true],
                'PATCH' => ['auth' => true],
                'DELETE' => ['auth' => true],
            ],
            'auth' => [
                'POST' => ['auth' => false], // Public route for login/logout
            ],
        ];
    }

    /**
     * Unified authentication check - single source of truth
     * Returns user_id if authenticated, throws exception otherwise
     */
    private function requireAuth()
    {
        try {
            $headers = getallheaders();
            $userId = $this->authMiddleware->validateToken($headers);
            
            if (!$userId) {
                throw new \Exception("Unauthorized", 401);
            }
            
            return $userId;
        } catch (\Exception $e) {
            throw new \Exception("Unauthorized", 401);
        }
    }

    public function handleRequest($method, $uri)
    {
        $uriParts = explode('?', $uri);
        $path = $uriParts[0];

        error_log("[Router] handleRequest: method=$method, path=$path, original_uri=$uri");
        error_log("[Router] TEST: This is a test log to verify code execution");
        error_log("[Router] DEBUG: uriParts=" . print_r($uriParts, true));
        error_log("[Router] DEBUG: Extracted path='$path' from uri='$uri'");

        try {
            // Handle auth routes first
            if ($path === '/auth/login' || $path === '/api/auth/login') {
                if ($method === 'POST') {
                    (new AuthController())->login();
                    return;
                }
            }

            // Handle logout
            if ($path === '/auth/logout' || $path === '/api/auth/logout') {
                if ($method === 'POST') {
                    (new AuthController())->logout();
                    return;
                }
            }

            // Handle Zendesk webhook routes
            if ($path === '/api/new-zendesk-customer') {
                if ($method === 'POST') {
                    (new ZendeskController())->createCustomer();
                    return;
                }
            }

            // Handle Zendesk user.created webhook
            if ($path === '/api/zendesk-user-created') {
                if ($method === 'POST') {
                    (new ZendeskController())->handleUserCreated();
                    return;
                }
            }



            // Handle dashboard statistics
            error_log("[Router] Checking dashboard route: path=$path, method=$method");
            if ($path === '/dashboard/statistics' || $path === '/api/dashboard/statistics') {
                error_log("[Router] Dashboard route matched! Calling getStatistics()");
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new DashboardController())->getStatistics();
                    return;
                }
            }

            // Handle Carelli item routes
            error_log("[Router] DEBUG: Checking Carelli search route - path='$path', method='$method'");
            if (preg_match('/^\/api\/carelli-items\/search$/', $path)) {
                error_log("[Router] DEBUG: Carelli search route MATCHED!");
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    error_log("[Router] DEBUG: Calling CarelliItemController->searchItems()");
                    (new CarelliItemController())->searchItems();
                    return;
                }
            } else {
                error_log("[Router] DEBUG: Carelli search route NOT matched - pattern: /^\/api\/carelli-items\/search$/");
            }

            if (preg_match('/^\/api\/carelli-items\/(\d+)$/', $path, $matches)) {
                $itemId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->getItem($itemId);
                    return;
                }
            }

            if (preg_match('/^\/api\/carelli-items\/(\d+)\/validate$/', $path, $matches)) {
                $itemId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->validateItem($itemId);
                    return;
                }
            }

            if (preg_match('/^\/api\/carelli-items\/(\d+)\/product-data$/', $path, $matches)) {
                $itemId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->getItemForProduct($itemId);
                    return;
                }
            }

            if (preg_match('/^\/api\/carelli-items\/(\d+)\/translation-data$/', $path, $matches)) {
                $itemId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->getItemForTranslation($itemId);
                    return;
                }
            }

            if (preg_match('/^\/api\/carelli-items\/categories$/', $path)) {
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->getCategories();
                    return;
                }
            }

            if (preg_match('/^\/api\/carelli-items\/categories\/(\d+)\/subcategories$/', $path, $matches)) {
                $categoryId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->getSubcategories($categoryId);
                    return;
                }
            }

            if (preg_match('/^\/api\/carelli-items\/categories\/(\d+)\/items$/', $path, $matches)) {
                $categoryId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new CarelliItemController())->getItemsByCategory($categoryId);
                    return;
                }
            }

            // Handle product images routes
            if (preg_match('/^\/api\/products\/(\d+)\/images$/', $path, $matches)) {
                $productId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->getProductImages($productId);
                    return;
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->uploadProductImage($productId);
                    return;
                }
            }

            // Handle unset primary route (must come before other product routes)
            error_log("[Router] Checking unset-primary route: path=$path");
            if (preg_match('/^\/api\/products\/(\d+)\/images\/unset-primary\/?$/', $path, $matches)) {
                $productId = $matches[1];
                error_log("[Router] Unset primary route matched! productId=$productId, method=$method");
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->unsetPrimaryImage($productId);
                    return;
                }
            }

            if (preg_match('/^\/api\/products\/(\d+)\/images\/(\d+)$/', $path, $matches)) {
                $productId = $matches[1];
                $imageId = $matches[2];
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->updateProductImage($imageId);
                    return;
                } elseif ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->deleteProductImage($imageId);
                    return;
                }
            }

            if (preg_match('/^\/api\/products\/(\d+)\/images\/(\d+)\/primary$/', $path, $matches)) {
                $productId = $matches[1];
                $imageId = $matches[2];
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->setPrimaryImage($productId, $imageId);
                    return;
                }
            }

            error_log("[Router] Checking unset-primary route: path=$path");
            if (preg_match('/^\/api\/products\/(\d+)\/images\/unset-primary\/?$/', $path, $matches)) {
                $productId = $matches[1];
                error_log("[Router] Unset primary route matched! productId=$productId, method=$method");
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->unsetPrimaryImage($productId);
                    return;
                }
            }



            // Handle proposal item image routes
            error_log("[Router] Checking reorder route: path=$path, method=$method");
            if (preg_match('/^\/api\/proposals\/items\/(\d+)\/images\/reorder$/', $path, $matches)) {
                error_log("[Router] Reorder route matched! proposalItemId=" . $matches[1]);
                $proposalItemId = $matches[1];
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    error_log("[Router] Calling reorderItemImages for proposalItemId=$proposalItemId");
                    (new ProposalController())->reorderItemImages($proposalItemId);
                    return;
                }
            }

            // Handle image description update (without proposal_item_id)
            if (preg_match('/^\/api\/proposals\/items\/images\/(\d+)\/description$/', $path, $matches)) {
                $imageId = $matches[1];
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->updateItemImageDescription($imageId);
                    return;
                }
            }

            // Handle piece routes
            if (preg_match('/^\/api\/products\/(\d+)\/pieces$/', $path, $matches)) {
                $productId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new PieceController())->getProductPieces($productId);
                    return;
                }
            }

            // Handle piece metadata routes
            if (preg_match('/^\/api\/pieces\/(\d+)\/metadata$/', $path, $matches)) {
                $pieceId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new PieceController())->getPieceMetadata($pieceId);
                    return;
                } elseif ($method === 'PUT') {
                    $this->requireAuth(); // Require authentication
                    (new PieceController())->updatePieceMetadata($pieceId);
                    return;
                }
            }

            // Remove hardcoded piece route - let it go through the resource routing system

            //get the Controller and method
            foreach ($this->resourceWhitelists as $resource => $whitelist) {
                $singularResource = $this->singularize($resource);
                $controllerClass = '\\App\\Controllers\\' . ucfirst($singularResource) . 'Controller';
                error_log("[Router] Checking resource: $resource, controllerClass: $controllerClass");
                if (class_exists($controllerClass)) {
                    $controller = new $controllerClass();
                    $this->mapResourceRoutes($path, $method, $resource, $controller, $whitelist);
                } else {
                    error_log("[Router] Controller class does not exist: $controllerClass");
                }
            }
            error_log("[Router] No route found for $path");
            // Explicit mappings for missing routes
            $this->addExplicitMappings($path, $method);

            throw new \Exception("Endpoint not found", 404);
        } catch (\Exception $e) {
            $exceptionCode = (int)$e->getCode() ?: 500;
            http_response_code($exceptionCode);
            // Enhanced debug output
            echo json_encode([
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_path' => $uri,
                'request_method' => $method
            ]);
        }
    }

    private function singularize($plural)
    {
        $irregulars = [
            'metadata' => 'metadata',
            'stop-items' => 'stopItem',
            'manufacturer-locations' => 'manufacturerLocation',
            'languages' => 'language',
            'pieces' => 'piece',
        ];

        if (isset($irregulars[$plural])) {
            return $irregulars[$plural];
        }

        // Basic rules
        if (substr($plural, -3) === 'ies') {
            return substr($plural, 0, -3) . 'y';
        }
        //not roles but role
        if (substr($plural, -2) === 'es' && $plural !== 'roles') {
            return substr($plural, 0, -2);
        }

        if (substr($plural, -1) === 's') {
            return substr($plural, 0, -1);
        }

        return $plural;
    }

    private function addExplicitMappings($path, $method)
    {
        switch (true) {
                // Dashboard statistics
            case $path === '/api/dashboard/statistics':
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    error_log("[Router] Dashboard route found in explicit mappings");
                    (new DashboardController())->getStatistics();
                }
                break;

                // Token renewal
            case $path === '/api/auth/renew':
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication (need valid token to renew)
                    (new AuthController())->renewToken();
                }
                break;

                // Proposal PDF generation
            case preg_match('/^\/api\/proposals\/(\d+)\/generate-pdf$/', $path, $matches):
                $proposalId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    try {
                        $pdfPath = (new ProposalController())->generateProposalPDF($proposalId);
                        JsonResponse::send(['pdf_url' => $pdfPath], 200);
                    } catch (\Exception $e) {
                        JsonResponse::send(['error' => $e->getMessage()], 500);
                    }
                }
                break;

            case preg_match('/^\/api\/proposals\/(\d+)\/download-pdf$/', $path, $matches):
                $proposalId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    try {
                        (new ProposalController())->downloadProposalPDF($proposalId);
                    } catch (\Exception $e) {
                        JsonResponse::send(['error' => $e->getMessage()], 500);
                    }
                }
                break;

            case $path === '/api/proposals/temp-upload-item-image':
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->uploadTempItemImage();
                }
                break;

            case preg_match('/^\/api\/proposals\/items\/temp-images\/(\d+)\/description$/', $path, $matches):
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    $tempImageId = $matches[1];
                    (new ProposalController())->updateTempItemImageDescription($tempImageId);
                }
                break;

            case $path === '/api/proposals/upload-custom-section-image':
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->uploadCustomSectionImage();
                }
                break;



            case preg_match('/^\/api\/proposals\/items\/(\d+)\/images\/(\d+)\/description$/', $path, $matches):
                $proposalItemId = $matches[1];
                $imageId = $matches[2];
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->updateItemImageDescription($imageId);
                }
                break;

            case preg_match('/^\/api\/proposals\/items\/images\/(\d+)$/', $path, $matches):
                $imageId = $matches[1];
                if ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->deleteItemImage($imageId);
                }
                break;

            case preg_match('/^\/api\/proposals\/(\d+)\/currency$/', $path, $matches):
                $proposalId = $matches[1];
                if ($method === 'PUT') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->updateProposalCurrency($proposalId);
                }
                break;

            // Exchange rate - current usable rate for a currency vs CZK
            case $path === '/api/exchange-rate':
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new \App\Controllers\CurrencyController())->getExchangeRate();
                }
                break;

                // Product translations
            case preg_match('/^\/api\/products\/(\d+)\/translations$/', $path, $matches):
                $productId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProductTranslationController())->getProductTranslations($productId);
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductTranslationController())->createTranslation();
                }
                break;

                // Piece images
            case preg_match('/^\/api\/pieces\/(\d+)\/images$/', $path, $matches):
                $pieceId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new PieceImageController())->getByPiece($pieceId);
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new PieceImageController())->upload();
                }
                break;

            case preg_match('/^\/api\/piece-images\/(\d+)$/', $path, $matches):
                $imageId = $matches[1];
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    (new PieceImageController())->update($imageId);
                } elseif ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new PieceImageController())->delete($imageId);
                }
                break;

            case preg_match('/^\/api\/pieces\/(\d+)\/images\/reorder$/', $path, $matches):
                $pieceId = $matches[1];
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new PieceImageController())->reorder($pieceId);
                }
                break;

            case preg_match('/^\/api\/piece-images\/(\d+)\/primary$/', $path, $matches):
                $imageId = $matches[1];
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new PieceImageController())->setPrimary($imageId);
                }
                break;

            case preg_match('/^\/api\/product-translations\/(\d+)$/', $path, $matches):
                $translationId = $matches[1];
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    (new ProductTranslationController())->updateTranslation($translationId);
                } elseif ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new ProductTranslationController())->deleteTranslation($translationId);
                }
                break;

                // Proposal-to-order conversion
            case $path === '/api/orders/convert':
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    $data = json_decode(file_get_contents('php://input'), true);
                    if (!isset($data['proposal_id'])) {
                        throw new \Exception("Proposal ID is required", 400);
                    }
                    (new OrderController())->convertProposalToOrder($data['proposal_id']);
                }
                break;

                // Product metadata
            case preg_match('/^\/api\/products\/(\d+)\/metadata$/', $path, $matches):
                $productId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProductController())->getProductMetadata($productId);
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductMetadataController())->createMetadata();
                } elseif ($method === 'PUT') {
                    $this->requireAuth(); // Require authentication
                    (new ProductController())->updateProductMetadata($productId);
                }
                break;

                // Product unset primary image
            case preg_match('/^\/api\/products\/(\d+)\/images\/unset-primary\/?$/', $path, $matches):
                $productId = $matches[1];
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProductImageController())->unsetPrimaryImage($productId);
                }
                break;

                //references - e.g. person_type "/^\/api\/references\/([a-zA-Z_]+)$/"
            case preg_match('/^\/api\/references\/([a-zA-Z_]+)$/', $path, $matches):
                $referenceType = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    error_log("a");
                    (new ReferenceController())->getAll($referenceType);
                }
                break;

                // Stop items
            case preg_match('/^\/api\/stop-items$/', $path):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    $data = json_decode(file_get_contents('php://input'), true);
                    $stopId = $data['stop_id'] ?? null;
                    if (!$stopId) {
                        throw new \Exception("Stop ID is required", 400);
                    }
                    (new StopItemsController())->addStopItem($stopId);
                }
                break;

            case preg_match('/^\/api\/stop-items\/(\d+)$/', $path, $matches):
                $stopItemId = $matches[1];
                if ($method === 'PATCH') {
                    $this->requireAuth(); // Require authentication
                    (new StopItemsController())->updateStopItem($stopItemId);
                }
                break;

            // Proposal status changes
            case preg_match('/^\/api\/proposals\/(\d+)\/send$/', $path, $matches):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->sendProposal($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/accept$/', $path, $matches):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->acceptProposal($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/hold$/', $path, $matches):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->holdProposal($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/expire$/', $path, $matches):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->expireProposal($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/status-history$/', $path, $matches):
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->getProposalStatusHistory($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/pdf-snapshots$/', $path, $matches):
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->getPdfSnapshots($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/pdf-snapshots\/(\d+)\/download$/', $path, $matches):
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->downloadPdfSnapshot($matches[1], $matches[2]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/pdf-snapshots\/(\d+)\/view$/', $path, $matches):
                if ($method === 'GET') {
                    // Note: PDF view might support token-in-URL for sharing - auth handled in controller
                    (new ProposalController())->viewPdfSnapshot($matches[1], $matches[2]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/convert$/', $path, $matches):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->convertProposal($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/cancel-send$/', $path, $matches):
                if ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->cancelSend($matches[1]);
                }
                break;
            case preg_match('/^\/api\/proposals\/(\d+)\/preview$/', $path, $matches):
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalController())->getProposalPreview($matches[1]);
                }
                break;

            // Material search
            case preg_match('/^\/api\/materials\/search$/', $path):
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new MaterialController())->searchMaterials();
                }
                break;

            // Material image upload
            case preg_match('/^\/api\/materials\/(\d+)\/images$/', $path, $matches):
                $materialId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new MaterialController())->getMaterialImages($materialId);
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new MaterialController())->uploadMaterialImage();
                }
                break;

            // Material image delete
            case preg_match('/^\/api\/materials\/images\/(\d+)$/', $path, $matches):
                $imageId = $matches[1];
                if ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new MaterialController())->deleteMaterialImage($imageId);
                }
                break;

            // Piece materials
            case preg_match('/^\/api\/pieces\/(\d+)\/materials$/', $path, $matches):
                $pieceId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new PieceMaterialController())->getPieceMaterials($pieceId);
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new PieceMaterialController())->addMaterialToPiece($pieceId);
                } elseif ($method === 'PUT') {
                    $this->requireAuth(); // Require authentication
                    (new PieceMaterialController())->updatePieceMaterials($pieceId);
                }
                break;

            // Piece material delete
            case preg_match('/^\/api\/pieces\/(\d+)\/materials\/(\d+)$/', $path, $matches):
                $pieceId = $matches[1];
                $materialId = $matches[2];
                if ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new PieceMaterialController())->removeMaterialFromPiece($pieceId, $materialId);
                }
                break;

            // Proposal item piece materials
            case preg_match('/^\/api\/proposal-item-pieces\/(\d+)\/materials$/', $path, $matches):
                $proposalItemPieceId = $matches[1];
                if ($method === 'GET') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalItemPieceMaterialController())->getProposalItemPieceMaterials($proposalItemPieceId);
                } elseif ($method === 'POST') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalItemPieceMaterialController())->addMaterialToProposalItemPiece($proposalItemPieceId);
                } elseif ($method === 'PUT') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalItemPieceMaterialController())->updateProposalItemPieceMaterials($proposalItemPieceId);
                }
                break;

            // Proposal item piece material delete
            case preg_match('/^\/api\/proposal-item-pieces\/(\d+)\/materials\/(\d+)$/', $path, $matches):
                $proposalItemPieceId = $matches[1];
                $materialId = $matches[2];
                if ($method === 'DELETE') {
                    $this->requireAuth(); // Require authentication
                    (new ProposalItemPieceMaterialController())->removeMaterialFromProposalItemPiece($proposalItemPieceId, $materialId);
                }
                break;


        }
        return false; // Route was not handled
    }

    private function mapResourceRoutes($path, $method, $resource, $controller, $whitelist)
    {
        $pathPattern = "/^\/api\/$resource(\/(\d+))?$/";
        error_log("[Router] mapResourceRoutes: pathPattern=$pathPattern, path=$path");
        if (preg_match($pathPattern, $path, $matches)) {
            error_log("[Router] Regex matched for resource: $resource");
            $id = $matches[2] ?? null;

            // Ensure method is whitelisted
            if (!isset($whitelist[$method])) {
                error_log("[Router] Method $method not allowed for resource $resource");
                throw new \Exception("Method not allowed", 405);
            }

            // Apply authentication if required
            if ($whitelist[$method]['auth']) {
                $userId = $this->authMiddleware->validateToken(getallheaders());
                if (!$userId) {
                    error_log("[Router] Authentication failed for resource $resource");
                    throw new \Exception("Unauthorized", 401);
                } else {
                    error_log("[Router] Authentication succeeded for resource $resource, userId=$userId");
                }
            }

            $singularResource = $this->singularize($resource);
            error_log("[Router] singularResource: $singularResource");

            // Map methods to controller actions
            if ($id) {
                switch ($method) {
                    case 'GET':
                        $methodName = "get" . ucfirst($singularResource);
                        error_log("[Router] Calling controller method: $methodName($id)");
                        $controller->$methodName($id);
                        return;
                    case 'PATCH':
                        $methodName = "update" . ucfirst($singularResource);
                        error_log("[Router] Calling controller method: $methodName($id)");
                        $controller->$methodName($id);
                        return;
                    case 'DELETE':
                        $methodName = "delete" . ucfirst($singularResource);
                        error_log("[Router] Calling controller method: $methodName($id)");
                        $controller->$methodName($id);
                        return;
                }
            } else {
                switch ($method) {
                    case 'GET':
                        $methodName = "getAll" . ucfirst($singularResource) . "s";
                        // Special case for users - the method is getAllUsers, not getAllUserss
                        if ($resource === 'users') {
                            $methodName = "getAllUsers";
                        }
                        error_log("[Router] Calling controller method: $methodName()");
                        $controller->$methodName();
                        return;
                    case 'POST':
                        $methodName = "create" . ucfirst($singularResource);
                        error_log("[Router] Calling controller method: $methodName()");
                        $controller->$methodName();
                        return;
                }
            }
        } else {
            error_log("[Router] Regex did NOT match for resource: $resource");
        }
    }
}
