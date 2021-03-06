<?php
/**
 * Apollo application entry script file
 *
 * This file load the bootstrap for namespace autoloading and
 * creates an instance of the Apollo object and starts the application.
 *
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2016
 * @license http://opensource.org/licenses/gpl-license.php MIT License
 * @version 0.0.1
 */


require_once '../apollo/Bootstrap.php';
use Apollo\Apollo;
use Apollo\components\GlobalWebManager;
use Apollo\Components\UserFriendlyException;

try {
    Apollo::getInstance()->start();
} catch (Exception $e) {
    GlobalWebManager::printExceptionToUser($e);
} catch (Error $e) {
    $friendlyE = new UserFriendlyException("A critical error occurred.", 0, $e);
    GlobalWebManager::printExceptionToUser($friendlyE);
}
