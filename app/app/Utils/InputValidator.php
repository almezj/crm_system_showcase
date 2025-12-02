<?php
namespace App\Utils;

/**
 * Enhanced Input Validator with Security Focus
 * Backward compatible with existing code while adding security features
 */
class InputValidator 
{
    /**
     * Legacy validation method (backward compatible)
     * 
     * @param array $data Input data
     * @param array $rules Validation rules
     * @throws \Exception If validation fails
     */
    public static function validate($data, $rules) 
    {
        // Convert legacy rules to new format
        $newRules = [];
        foreach ($rules as $key => $rule) {
            if (is_string($rule)) {
                $newRules[$key] = ['required' => true, 'type' => 'string'];
            } else {
                $newRules[$key] = $rule;
            }
        }

        // Use the new security validator
        return SecurityValidator::validate($data, $newRules);
    }

    /**
     * Enhanced validation with security features
     * 
     * @param array $data Input data
     * @param array $rules Validation rules
     * @return array Sanitized and validated data
     * @throws \Exception If validation fails
     */
    public static function validateSecure($data, $rules) 
    {
        return SecurityValidator::validate($data, $rules);
    }

    /**
     * Validate file upload with security checks
     * 
     * @param array $file $_FILES array element
     * @param array $options Validation options
     * @return array Validation result
     */
    public static function validateFile($file, $options = []) 
    {
        return SecurityValidator::validateFile($file, $options);
    }

    /**
     * Validate SQL query parameters
     * 
     * @param string $query SQL query
     * @param array $params Parameters
     * @return bool
     */
    public static function validateSqlQuery($query, $params) 
    {
        return SecurityValidator::validateSqlQuery($query, $params);
    }

    /**
     * Quick validation for common patterns
     */
    public static function email($email) 
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function integer($value) 
    {
        return is_numeric($value) && (int)$value == $value;
    }

    public static function url($url) 
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    public static function sanitizeString($string) 
    {
        return SecurityValidator::sanitizeString($string);
    }
}
?>
