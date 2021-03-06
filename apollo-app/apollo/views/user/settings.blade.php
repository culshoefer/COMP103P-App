<?php
/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2016
 * @license https://opensource.org/licenses/mit-license.php MIT License
 * @version 0.0.1
 */
use Apollo\Apollo;

$user = Apollo::getInstance()->getUser();
?>
@extends('layouts.extended')
@section('content')
    <div class="panel panel-primary">
        <div class="panel-heading">Information</div>
        <div class="panel-body">
            <div class="row">
                <div class="col-md-6 col-sm-12">
                    <table class="table">
                        <thead>
                        <th colspan="2">
                            Your information
                        </th>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Your name:</td>
                            <td>{{ $user->getName() }}</td>
                        </tr>
                        <tr>
                            <td>Your email:</td>
                            <td>{{ $user->getEmail() }}</td>
                        </tr>
                        <tr>
                            <td>Your ID:</td>
                            <td>{{ $user->getDisplayId() }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-6 col-sm-12">
                    <table class="table">
                        <thead>
                        <th colspan="2">
                            Organisation information
                        </th>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Organisation name:</td>
                            <td>{{ $user->getOrganisationName() }}</td>
                        </tr>
                        <tr>
                            <td>Organisation timezone:</td>
                            <td>{{ $user->getOrganisationTimeZone() }}</td>
                        </tr>
                        <tr>
                            <td>Organisation ID:</td>
                            <td>{{ $user->getOrganisationDisplayId() }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@stop
