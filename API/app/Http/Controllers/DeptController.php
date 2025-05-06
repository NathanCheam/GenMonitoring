<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeptRequest;
use App\Http\Resources\DeptResource;
use App\Models\Dept;

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
}
