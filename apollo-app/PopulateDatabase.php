<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 02/03/16
 * Time: 10:38
 */

require_once 'vendor/autoload.php';

use Apollo\Components\DB;
use Apollo\Entities\DataEntity;
use Apollo\Entities\FieldEntity;
use Apollo\Entities\OrganisationEntity;
use Apollo\Entities\PersonEntity;
use Apollo\Entities\RecordEntity;
use Apollo\Entities\UserEntity;
use Faker\Factory;

$entity_manager = DB::getEntityManager();
$organisationRepo = $entity_manager->getRepository('Apollo\\Entities\\OrganisationEntity');
/**
 * @var OrganisationEntity $organisation
 */
$organisation = $organisationRepo->find(1);
$userRepo = $entity_manager->getRepository('Apollo\\Entities\\UserEntity');
/**
 * @var UserEntity $user
 */
$user = $userRepo->find(1);
date_default_timezone_set('Europe/London');
$date = new DateTime();

for($i = 0; $i < 200; $i++) {

    $faker = Factory::create();
    $person = new PersonEntity();
    $person->setOrganisation($organisation);
    $person->setGivenName($faker->firstName);
    $person->setMiddleName($faker->firstName);
    $person->setLastName($faker->lastName);
    $person->setIsHidden(false);

    $entity_manager->persist($person);
    $entity_manager->flush();

    $record = new RecordEntity($user);
    $record->setPerson($person);
    $entity_manager->persist($record);
    $entity_manager->flush();

    $record->setVarchar(FIELD_RECORD_NAME, 'First Record');
    $record->setVarchar(FIELD_EMAIL, $faker->email);
    $record->setVarchar(FIELD_PHONE, $faker->phoneNumber);
    $record->setVarchar(FIELD_ADDRESS, $faker->address);
    $record->setDateTime(FIELD_START_DATE, new DateTime());
    $record->setDateTime(FIELD_END_DATE, new DateTime());

    $entity_manager->flush();


}