<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeptRequest;
use App\Http\Requests\TempRequest;
use App\Http\Resources\DeptResource;
use App\Http\Resources\TempResource;
use App\Models\Dept;
use App\Models\Temp;

class DeptController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $depts = $user->departements;

        return DeptResource::collection($depts);
    }

    public function store(DeptRequest $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $dept = Dept::create($request->validated());
        $user->departements()->attach($dept->id);
        return new DeptResource($dept);
    }

    public function show(Dept $dept)
    {
        return new DeptResource($dept);
    }

    public function update(DeptRequest $request, Dept $dept)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->departements->contains($dept->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $dept->update($request->validated());

        return new DeptResource($dept);
    }

    public function destroy(Dept $dept)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->departements->contains($dept->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $dept->users()->detach();

        $dept->delete();

        return response()->json(['message' => 'Department deleted successfully'], 200);
    }

    public function listeTemperatures(Dept $dept)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->departements->contains($dept->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return TempResource::collection($dept->temps);
    }

    public function storeTemperature(Dept $dept, TempRequest $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->departements->contains($dept->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $temp = $dept->temps()->create($request->validated());

        return new TempResource($temp);
    }

    public function updateTemperature(TempRequest $request, Dept $dept, Temp $temp)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->departements->contains($dept->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tempBelongsToDept = $dept->temps()->where('id', $temp->id)->exists();

        if (!$tempBelongsToDept) {
            return response()->json(['message' => 'Temperature not found in this department'], 404);
        }

        $temp->update($request->validated());

        return new TempResource($temp);
    }

    public function deleteTemperature(Dept $dept, Temp $temp)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->departements->contains($dept->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tempBelongsToDept = $dept->temps()->where('id', $temp->id)->exists();

        if (!$tempBelongsToDept) {
            return response()->json(['message' => 'Temperature not found in this department'], 404);
        }

        $temp->delete();

        return response()->json(['message' => 'Temperature deleted successfully'], 200);
    }
}
