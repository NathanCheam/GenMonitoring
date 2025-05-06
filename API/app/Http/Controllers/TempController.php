<?php

namespace App\Http\Controllers;

use App\Http\Requests\TempRequest;
use App\Http\Resources\TempResource;
use App\Models\Temp;

class TempController extends Controller
{
    public function index()
    {
        return TempResource::collection(Temp::all());
    }

    public function store(TempRequest $request)
    {
        return new TempResource(Temp::create($request->validated()));
    }

    public function show(Temp $temp)
    {
        return new TempResource($temp);
    }

    public function update(TempRequest $request, Temp $temp)
    {
        $temp->update($request->validated());

        return new TempResource($temp);
    }

    public function destroy(Temp $temp)
    {
        $temp->delete();

        return response()->json();
    }
}
