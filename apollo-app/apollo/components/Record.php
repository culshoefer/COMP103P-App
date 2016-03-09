<?php
/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2016
 * @license http://opensource.org/licenses/mit-license.php MIT License
 */


namespace Apollo\Components;
use Apollo\Entities\RecordEntity;


/**
 * Class Record
 *
 * @package Apollo\Components
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @version 0.0.2
 */
class Record extends DBComponent
{
    /**
     * Namespace of entity class
     * @var string
     */
    protected static $entityNamespace = 'Apollo\\Entities\\RecordEntity';

    /**
     * Checks that default data exists for all fields, if not, adds the missing fields.
     *
     * @param RecordEntity $record
     * @since 0.0.2
     */
    public static function prepare($record) {
        $fieldRepo = Field::getRepository();
        $fields = $fieldRepo->findBy(['is_hidden' => false]);
        var_dump($fields);
    }
}