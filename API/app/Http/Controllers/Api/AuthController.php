<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseController {

    /**
     * Handle the registration request.
     *
     * @param Request $request The incoming request instance.
     * @return JsonResponse The response containing the newly
     * registered user data or error message.
     */
    public function register(Request $request): JsonResponse {
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'password' => 'required|string|min:6',
        ]);

        $name = $validatedData['nom'] . ' ' . $validatedData['prenom'];
        $email = strtolower($validatedData['nom'] . '.' . $validatedData['prenom'] . '@pasdecalais.fr');
        $rules = ['email' => 'unique:users,email'];
        $input = ['email' => $email];

        if(!Validator :: make($input, $rules)->passes()) {
            return $this->sendError('Registration failed.', ['error' => 'Email already exists.'], 500);
        }

        try {
            DB::transaction(function () use ($validatedData, $name, $email, &$user, &$client) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($validatedData['password']),
                ]);
            });


            $success['token'] = $user->createToken('auth_token')->plainTextToken;
            $success['token_type'] = 'Bearer';
            $success['name'] = $user->name;

            return $this->sendResponse([
                'user' => [
                    'id' => $user->id,
                    'prenom' => explode(' ', $user->name)[1] ?? '',
                    'nom' => explode(' ', $user->name)[0] ?? '',
                    'email' => $user->email,
                ],
                'token' => $success['token'],
            ], 'User registered successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Registration failed.', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle the login request.
     *
     * @param Request $request The incoming request instance.
     * @return JsonResponse The response containing the authentication
     * token or error message.
     */
    public function login(Request $request): JsonResponse {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }

        $user = Auth::user();

        $success['token'] = $user->createToken('auth_token')->plainTextToken;
        $success['token_type'] = 'Bearer';

        return $this->sendResponse($success, 'User login successfully.');
    }

    /**
     * Get the authenticated user's information.
     *
     * @param Request $request The incoming request instance.
     * @return JsonResponse The response containing the authenticated
     * user's information.
     */
    public function me(Request $request): JsonResponse {
        $success['user'] = new UserResource(Auth::user());
        return $this->sendResponse($success, 'User information.');
    }

    /**
     * Handle the logout request.
     *
     * @return JsonResponse The response confirming the user has been
     * logged out.
     */
    public function logout(): JsonResponse {
        auth()->user()->tokens()->delete();
        return $this->sendResponse([], 'Logged out successfully.');
    }
}
