<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\DeptController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']) ->name('login');
Route::post('register', [AuthController::class, 'register']) ->name('register');
Route::get('user', [AuthController::class, 'me'])->middleware('auth:sanctum')->name('me');
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');

Route::resource('depts', DeptController::class)->middleware('auth:sanctum');

Route::get('depts/{dept}/temperatures', [DeptController::class, 'listeTemperatures'])->middleware('auth:sanctum')->name('departement.temperatures.index');
Route::post('depts/{dept}/temperatures', [DeptController::class, 'storeTemperature'])->middleware('auth:sanctum')->name('departement.temperature.store');
Route::put('depts/{dept}/temperatures/{temp}', [DeptController::class, 'updateTemperature'])->middleware('auth:sanctum')->name('departement.temperature.update');
Route::delete('depts/{dept}/temperatures/{temp}', [DeptController::class, 'deleteTemperature'])->middleware('auth:sanctum')->name('departement.temperature.delete');
