<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']) ->name('login');
Route::post('register', [AuthController::class, 'register']) ->name('register');
Route::get('user', [AuthController::class, 'me'])->middleware('auth:sanctum')->name('me');
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');
